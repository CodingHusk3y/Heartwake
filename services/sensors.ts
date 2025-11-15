import { Accelerometer } from 'expo-sensors';
let motionListeners: ((mag: number) => void)[] = [];
let accelSubscription: any;

export function startMotion() {
  if (accelSubscription) return;
  Accelerometer.setUpdateInterval(3000);
  accelSubscription = Accelerometer.addListener(({ x, y, z }) => {
    const mag = Math.sqrt(x * x + y * y + z * z);
    motionListeners.forEach(l => l(mag));
  });
}

export function stopMotion() {
  if (accelSubscription) accelSubscription.remove();
  accelSubscription = undefined;
}

export function subscribeMotion(cb: (mag: number) => void) {
  motionListeners.push(cb);
  return () => { motionListeners = motionListeners.filter(l => l !== cb); };
}
