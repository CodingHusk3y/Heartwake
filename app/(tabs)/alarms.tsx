import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { ensureNotificationPermission, rescheduleAlarm } from '../../services/alarmScheduler';
import { Alarm, deleteAlarm, listAlarms, summarizeRepeat, toggleAlarm } from '../../services/alarmsStore';

export default function AlarmsScreen() {
  const router = useRouter();
  const nav = useNavigation();
  const [alarms, setAlarms] = useState<Alarm[]>([]);

  const load = useCallback(() => { listAlarms().then(setAlarms); }, []);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { ensureNotificationPermission().then(() => {}); }, []);

  useEffect(() => {
    nav.setOptions({
      headerRight: () => (
        <Pressable onPress={() => router.push('/alarm/edit')} style={{ paddingHorizontal: 12 }}>
          <Ionicons name="add" size={24} />
        </Pressable>
      ),
      headerTitle: 'Alarms',
    });
  }, [nav, router]);

  const renderItem = ({ item }: { item: Alarm }) => <AlarmRow alarm={item} onChanged={load} onPress={() => router.push({ pathname: '/alarm/edit', params: { id: item.id } })} />;

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        contentContainerStyle={{ paddingVertical: 8 }}
        data={alarms}
        keyExtractor={(a) => a.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 32 }}>No alarms. Tap + to add.</Text>}
        onRefresh={load}
        refreshing={false}
      />
    </View>
  );
}

function AlarmRow({ alarm, onChanged, onPress }: { alarm: Alarm; onChanged: () => void; onPress: () => void }) {
  const ref = useRef<Swipeable | null>(null);
  const rightActions = () => (
    <Pressable style={styles.delete} onPress={async () => { await deleteAlarm(alarm.id); await rescheduleAlarm(alarm.id); ref.current?.close(); onChanged(); }}>
      <Ionicons name="trash" size={22} color="#fff" />
      <Text style={{ color: '#fff', marginLeft: 6 }}>Delete</Text>
    </Pressable>
  );
  return (
    <Swipeable ref={ref} renderRightActions={rightActions} overshootRight={false}>
      <Pressable onPress={onPress} style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.time}>{alarm.timeHHMM}</Text>
          <Text style={styles.meta}>{alarm.label || 'Alarm'} · {summarizeRepeat(alarm.repeat)}</Text>
        </View>
        <Switch value={alarm.enabled} onValueChange={async (v) => { await toggleAlarm(alarm.id, v); await rescheduleAlarm(alarm.id); onChanged(); }} />
      </Pressable>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  row: { paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#eee' },
  time: { fontSize: 28, fontWeight: '600' },
  meta: { color: '#666', marginTop: 2 },
  delete: { backgroundColor: '#e24a4a', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, flexDirection: 'row' },
});
