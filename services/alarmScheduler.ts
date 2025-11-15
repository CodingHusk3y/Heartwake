import * as Notifications from 'expo-notifications';
import { Alarm, RepeatDay, listAlarms, upsertAlarm } from './alarmsStore';

export async function ensureNotificationPermission(): Promise<boolean> {
  const settings = await Notifications.getPermissionsAsync();
  if (settings.status !== 'granted') {
    const req = await Notifications.requestPermissionsAsync();
    return req.status === 'granted';
  }
  return true;
}

function parseHHMM(hhmm: string): { hour: number; minute: number } {
  const [h, m] = hhmm.split(':').map(Number);
  return { hour: h || 0, minute: m || 0 };
}

function nextOccurrence(hhmm: string): Date {
  const { hour, minute } = parseHHMM(hhmm);
  const d = new Date();
  d.setSeconds(0, 0);
  d.setHours(hour, minute, 0, 0);
  if (d.getTime() <= Date.now()) d.setDate(d.getDate() + 1);
  return d;
}

function weekdayFromRepeatDay(d: RepeatDay): number {
  // Notifications weekday: 1..7 (1=Sunday)
  return d === 0 ? 1 : d + 1;
}

export async function cancelForAlarm(alarm: Alarm) {
  if (!alarm.notifIds || alarm.notifIds.length === 0) return;
  await Promise.all(alarm.notifIds.map((id) => Notifications.cancelScheduledNotificationAsync(id).catch(() => {})));
}

export async function scheduleForAlarm(alarm: Alarm): Promise<string[]> {
  await ensureNotificationPermission();
  const { hour, minute } = parseHHMM(alarm.timeHHMM);
  const ids: string[] = [];
  const content = { title: alarm.label || 'Alarm', body: alarm.timeHHMM, sound: true as any };
  if (alarm.repeat && alarm.repeat.length > 0) {
    for (const d of alarm.repeat) {
      const id = await Notifications.scheduleNotificationAsync({
        content,
        trigger: { hour, minute, weekday: weekdayFromRepeatDay(d), repeats: true },
      });
      ids.push(id);
    }
  } else {
    const fireDate = nextOccurrence(alarm.timeHHMM);
    const id = await Notifications.scheduleNotificationAsync({ content, trigger: fireDate });
    ids.push(id);
  }
  return ids;
}

export async function rescheduleAlarm(alarmId: string) {
  const list = await listAlarms();
  const alarm = list.find((a) => a.id === alarmId);
  if (!alarm) return;
  await cancelForAlarm(alarm);
  if (!alarm.enabled) {
    await upsertAlarm({ ...alarm, notifIds: [] });
    return;
  }
  const ids = await scheduleForAlarm(alarm);
  await upsertAlarm({ ...alarm, notifIds: ids });
}
