type HRSample = { hr: number; timestamp: number };
let listeners: ((s: HRSample) => void)[] = [];
let timer: any;

export function startHeartRateMock() {
  if (timer) return;
  timer = setInterval(() => {
    const base = 60;
    const variance = Math.sin(Date.now() / 30000) * 5 + (Math.random() * 4 - 2);
    const hr = base + variance;
    const sample: HRSample = { hr, timestamp: Date.now() };
    listeners.forEach(l => l(sample));
  }, 3000);
}

export function stopHeartRateMock() {
  if (timer) clearInterval(timer);
  timer = undefined;
}

export function subscribeHeartRate(cb: (s: HRSample) => void) {
  listeners.push(cb);
  return () => {
    listeners = listeners.filter(l => l !== cb);
  };
}
