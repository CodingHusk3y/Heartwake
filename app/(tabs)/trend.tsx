import React, { useEffect, useState } from 'react';
import { FlatList, ScrollView, Text, View } from 'react-native';
import SleepBarChart from '../../components/SleepBarChart';
import { listSessions, StoredSession } from '../../services/storage';

export default function TrendScreen() {
  const [sessions, setSessions] = useState<StoredSession[]>([]);
  useEffect(() => { listSessions().then(setSessions); }, []);
  const displaySessions = sessions.slice(0, 6);
  return (
    <View style={{ flex: 1, padding: 12, backgroundColor: 'transparent' }}>
      <Text style={{ fontSize: 18, fontWeight: '600', color: '#ffffff', marginBottom: 6 }}>Sleeping Times</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <SleepBarChart sessions={sessions} />
      </ScrollView>
      <Text style={{ fontSize: 16, fontWeight: '600', marginTop: 6, color: '#ffffff' }}>Recent Sessions</Text>
      <FlatList
        style={{ backgroundColor: 'transparent' }}
        data={displaySessions}
        keyExtractor={(s) => s.id}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <View style={{ paddingVertical: 6 }}>
            <Text style={{ color: '#ffffff' }}>{new Date(item.targetTime).toLocaleString()} → {item.wakeTime ? new Date(item.wakeTime).toLocaleTimeString() : '—'}</Text>
            <Text style={{ color: '#9aa0c0' }}>
              {item.early ? `Early wake${typeof item.minutesEarly === 'number' ? ` · ${item.minutesEarly} min early` : ''}` : 'Deadline wake'}
              {item.durationMinutes ? ` · ${Math.round((item.durationMinutes/60)*10)/10}h` : ''}
              {item.rating !== undefined ? ` · Rating ${item.rating}` : ''}
            </Text>
          </View>
        )}
        ListEmptyComponent={<Text style={{ color: '#9aa0c0' }}>No sessions yet.</Text>}
      />
    </View>
  );
}
