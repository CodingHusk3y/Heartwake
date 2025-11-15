import React, { useEffect, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { TrendChart } from '../../components/TrendChart';
import { listSessions, StoredSession } from '../../services/storage';

export default function TrendScreen() {
  const [sessions, setSessions] = useState<StoredSession[]>([]);
  useEffect(() => { listSessions().then(setSessions); }, []);
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <TrendChart sessions={sessions} />
      <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 8 }}>Recent Sessions</Text>
      <FlatList
        data={sessions}
        keyExtractor={(s) => s.id}
        renderItem={({ item }) => (
          <View style={{ paddingVertical: 8 }}>
            <Text>{new Date(item.targetTime).toLocaleString()} → {item.wakeTime ? new Date(item.wakeTime).toLocaleTimeString() : '—'}</Text>
            <Text>{item.early ? 'Early wake' : 'Deadline wake'}{item.rating !== undefined ? ` · Rating ${item.rating}` : ''}</Text>
          </View>
        )}
        ListEmptyComponent={<Text>No sessions yet.</Text>}
      />
    </View>
  );
}
