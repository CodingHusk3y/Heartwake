import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { Button, Pressable, Text, TextInput, View } from 'react-native';
import { rescheduleAlarm } from '../../services/alarmScheduler';
import { Alarm, RepeatDay, listAlarms, upsertAlarm } from '../../services/alarmsStore';

function pad(n: number) { return n.toString().padStart(2, '0'); }
function newId() { return String(Date.now()); }

export default function EditAlarm() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const nav = useNavigation();
  const [time, setTime] = useState('07:00');
  const [label, setLabel] = useState('Alarm');
  const [repeat, setRepeat] = useState<RepeatDay[]>([]);
  const [sound, setSound] = useState('default');

  useEffect(() => {
    if (id) {
      listAlarms().then(list => {
        const a = list.find(x => x.id === id);
        if (a) {
          setTime(a.timeHHMM); setLabel(a.label || 'Alarm'); setRepeat(a.repeat || []); setSound(a.sound || 'default');
        }
      });
    }
  }, [id]);

  useLayoutEffect(() => {
    nav.setOptions({ title: id ? 'Edit Alarm' : 'Add Alarm' });
  }, [nav, id]);

  const toggleDay = (d: RepeatDay) => {
    setRepeat(r => r.includes(d) ? r.filter(x => x !== d) : [...r, d].sort());
  };

  const save = async () => {
    const alarm: Alarm = { id: id || newId(), timeHHMM: time, label, repeat, sound, enabled: true };
    await upsertAlarm(alarm);
    await rescheduleAlarm(alarm.id);
    router.back();
  };

  return (
    <View style={{ flex: 1, padding: 16, gap: 16 }}>
      <Text style={{ fontSize: 16 }}>Time (HH:MM 24h)</Text>
      <TextInput value={time} onChangeText={setTime} style={{ borderWidth: 1, padding: 10, borderRadius: 8 }} placeholder="07:00" />
      <Text>Label</Text>
      <TextInput value={label} onChangeText={setLabel} style={{ borderWidth: 1, padding: 10, borderRadius: 8 }} />
      <Text>Repeat</Text>
      <WeekdayPicker value={repeat} onChange={setRepeat} />
      <Text>Sound</Text>
      <TextInput value={sound} onChangeText={setSound} style={{ borderWidth: 1, padding: 10, borderRadius: 8 }} placeholder="default" />
      <Button title={id ? 'Save' : 'Add'} onPress={save} />
    </View>
  );
}

function WeekdayPicker({ value, onChange }: { value: RepeatDay[]; onChange: (v: RepeatDay[]) => void }) {
  const days: { d: RepeatDay; label: string }[] = [
    { d: 0, label: 'Sun' }, { d: 1, label: 'Mon' }, { d: 2, label: 'Tue' }, { d: 3, label: 'Wed' }, { d: 4, label: 'Thu' }, { d: 5, label: 'Fri' }, { d: 6, label: 'Sat' },
  ];
  return (
    <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
      {days.map(({ d, label }) => {
        const selected = value.includes(d);
        return (
          <Pressable key={d} onPress={() => onChange(selected ? value.filter(x => x !== d) : [...value, d])} style={{ paddingVertical: 8, paddingHorizontal: 12, borderRadius: 16, borderWidth: 1, borderColor: selected ? '#4a90e2' : '#aaa', backgroundColor: selected ? '#eaf2ff' : 'transparent' }}>
            <Text style={{ color: selected ? '#4a90e2' : '#333' }}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
