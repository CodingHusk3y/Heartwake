export type HrSample = { hr: number };

type Subscriber = (s: HrSample) => void;
let subs: Subscriber[] = [];
let recording: any = null;
let pollTimer: any = null;
let lastBeat = 0;
let smoothedHr: number | undefined;
let baselineAmp = 0.03; // rolling baseline of ambient loudness (0..1)
let sensitivityMult = 2; // spike must exceed baseline * sensitivity
let minAmpFloor = 0.02; // absolute minimum amplitude to consider

export function setClapSensitivity(mult: number) {
  sensitivityMult = Math.max(1, Math.min(8, mult));
}

export function getClapSensitivity() {
  return sensitivityMult;
}

type AudioModule = { Audio: any; RecordingCtor: any };

async function tryLoadAudio(): Promise<AudioModule | null> {
  // Prefer expo-audio, but only if it provides a Recording implementation; otherwise fall back to expo-av
  try {
    const mod: any = await import('expo-audio');
    const Audio = (mod && (mod.Audio || mod)) || null;
    const RecordingCtor = (mod && (mod.Recording || (Audio && Audio.Recording))) || null;
    if (Audio && RecordingCtor) return { Audio, RecordingCtor };
  } catch {}
  try {
    const mod: any = await import('expo-av');
    const Audio = mod && mod.Audio;
    const RecordingCtor = (mod && (mod.Recording || (Audio && Audio.Recording))) || null;
    if (Audio && RecordingCtor) return { Audio, RecordingCtor };
  } catch {}
  return null;
}

export async function isClapSupported(): Promise<boolean> {
  const loaded = await tryLoadAudio();
  return !!loaded;
}

export async function startClapHr(): Promise<boolean> {
  try {
    const loaded = await tryLoadAudio();
    if (!loaded) return false;
    const { Audio, RecordingCtor } = loaded;
    if (Audio.requestPermissionsAsync) {
      const perm = await Audio.requestPermissionsAsync();
      const granted = perm?.granted === true || perm?.status === 'granted';
      if (!granted) return false;
    }
    if (Audio.setAudioModeAsync) {
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true, staysActiveInBackground: false });
    }
    const rec = new RecordingCtor();
    const AND = Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4;
    const AENC = Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC;
    const IOS_FMT = Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_LINEARPCM;
    const IOS_QUAL = Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_LOW;
    await rec.prepareToRecordAsync({
      android: {
        extension: '.m4a', outputFormat: AND,
        audioEncoder: AENC, sampleRate: 44100, numberOfChannels: 1,
        bitRate: 128000,
      },
      ios: {
        extension: '.caf', outputFormat: IOS_FMT,
        audioQuality: IOS_QUAL,
        sampleRate: 44100, numberOfChannels: 1, bitRate: 128000,
        linearPCMBitDepth: 16, linearPCMIsBigEndian: false, linearPCMIsFloat: false,
      },
      isMeteringEnabled: true,
    } as any);
    await rec.startAsync();
    recording = rec;
    startPolling();
    return true;
  } catch (e) {
    return false;
  }
}

export function subscribeClapHr(cb: Subscriber) {
  subs.push(cb);
  return () => { subs = subs.filter(s => s !== cb); };
}

export function stopClapHr() {
  if (pollTimer) clearInterval(pollTimer);
  pollTimer = null;
  if (recording) {
    try { recording.stopAndUnloadAsync(); } catch {}
  }
  recording = null;
  lastBeat = 0;
  smoothedHr = undefined;
}

function startPolling() {
  if (!recording) return;
  if (pollTimer) clearInterval(pollTimer);
  pollTimer = setInterval(async () => {
    if (!recording) return;
    try {
      const status: any = await recording.getStatusAsync();
      const metering = typeof status.metering === 'number' ? status.metering : -160;
      const amp = Math.max(0, Math.min(1, Math.pow(10, metering / 20)));
      // Update baseline when not spiking
      const isSpike = amp > baselineAmp * sensitivityMult && amp > minAmpFloor;
      baselineAmp = isSpike ? baselineAmp : baselineAmp * 0.98 + amp * 0.02;
      const now = Date.now();
      if (isSpike) {
        if (now - lastBeat > 300) {
          if (lastBeat > 0) {
            const bpm = Math.max(40, Math.min(200, 60000 / (now - lastBeat)));
            smoothedHr = smoothedHr === undefined ? bpm : smoothedHr * 0.7 + bpm * 0.3;
            emit({ hr: Math.round(smoothedHr) });
          }
          lastBeat = now;
        }
      }
    } catch {}
  }, 50);
}

function emit(s: HrSample) {
  subs.forEach(fn => fn(s));
}
