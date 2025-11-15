import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Button, Text, TextInput, View } from 'react-native';
import { useSession } from '../../context/SessionContext';

function toTodayISO(timeHHMM: string) {
  const [h, m] = timeHHMM.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  if (d.getTime() < Date.now()) d.setDate(d.getDate() + 1);
  return d.toISOString();
}

export default function SetupSession() {
  const { setConfig, updateState } = useSession();
  const router = useRouter();
  const [time, setTime] = useState('08:00');
  const [windowMinutes, setWindowMinutes] = useState('30');

  return (
    <View style={{ flex: 1, padding: 16, gap: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: '600' }}>Configure Sleep Session</Text>
      <Text>Latest Wake Time (HH:MM 24h)</Text>
      <TextInput value={time} onChangeText={setTime} style={{ borderWidth: 1, padding: 8 }} />
      <Text>Wake Window (minutes before latest time)</Text>
      <TextInput value={windowMinutes} onChangeText={setWindowMinutes} keyboardType="numeric" style={{ borderWidth: 1, padding: 8 }} />
      <Button
        title="Save & Start"
        onPress={() => {
          const cfg = { targetTime: toTodayISO(time), windowMinutes: parseInt(windowMinutes) || 30 };
          setConfig(cfg);
          updateState({ active: true, startedAt: new Date().toISOString() });
          router.push('/sleep/live');
        }}
      />
    </View>
  );
}
