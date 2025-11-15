import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Button, FlatList, Text, View } from 'react-native';
import { TrendChart } from '../../components/TrendChart';
import { listSessions, StoredSession } from '../../services/storage';

type Item = { id: string; targetTime: string; wakeTime?: string; early: boolean; rating?: number };

export default function History() {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [stored, setStored] = useState<StoredSession[]>([]);
  useEffect(() => {
    listSessions().then(s => { setStored(s); setItems(s); }).catch(() => setItems([]));
  }, []);
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: '600' }}>History</Text>
      <TrendChart sessions={stored} />
      <FlatList
        data={items}
        keyExtractor={i => i.id}
        renderItem={({ item }) => (
          <View style={{ paddingVertical: 8 }}>
            <Text>{new Date(item.targetTime).toLocaleString()} → {item.wakeTime ? new Date(item.wakeTime).toLocaleTimeString() : 'not woke'}</Text>
            <Text>{item.early ? 'Early wake' : 'Deadline wake'}</Text>
            {item.rating !== undefined && <Text>Rating: {item.rating}</Text>}
          </View>
        )}
        ListEmptyComponent={<Text>No sessions stored.</Text>}
      />
      <Button title="Back" onPress={() => router.push('/')} />
    </View>
  );
}
