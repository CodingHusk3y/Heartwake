import * as Notifications from 'expo-notifications';
import { SleepSessionConfig } from '../context/SessionContext';
import { saveSession } from './storage';

let monitorTimer: any;
let currentStage: string = 'unknown';

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowAlert: true, shouldPlaySound: true, shouldSetBadge: false })
});

async function fireEarlyWake(stage: string) {
  await Notifications.scheduleNotificationAsync({
    content: { title: 'HeartWake', body: `Waking during light stage (${stage})`, sound: true },
    trigger: null
  });
}

export function startWakeMonitoring(cfg: SleepSessionConfig, onWake: (stage: string, early: boolean, sessionId: string) => void) {
  stopWakeMonitoring();
  const target = new Date(cfg.targetTime).getTime();
  const windowStart = target - cfg.windowMinutes * 60000;
  monitorTimer = setInterval(async () => {
    const now = Date.now();
    if (now >= windowStart && now <= target) {
      if (currentStage === 'N1' || currentStage === 'N2' || currentStage === 'REM') {
        clearInterval(monitorTimer);
        monitorTimer = undefined;
        await fireEarlyWake(currentStage);
        const wakeTime = new Date().toISOString();
        await saveSession(cfg, wakeTime, true);
        onWake(currentStage, true, wakeTime);
      }
    } else if (now > target) {
      clearInterval(monitorTimer);
      monitorTimer = undefined;
      await Notifications.scheduleNotificationAsync({
        content: { title: 'HeartWake', body: 'Wake deadline reached', sound: true },
        trigger: null
      });
      const wakeTime = new Date().toISOString();
      await saveSession(cfg, wakeTime, false);
      onWake(currentStage, false, wakeTime);
    }
  }, 15000);
}

export function updateStageForAlarm(stage: string) { currentStage = stage; }

export function stopWakeMonitoring() {
  if (monitorTimer) clearInterval(monitorTimer);
  monitorTimer = undefined;
}
