import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Button, FlatList, Text, View } from 'react-native';
import { listSessions } from '../../services/storage';

type Item = { id: string; targetTime: string; wakeTime?: string; early: boolean };

export default function History() {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  useEffect(() => {
    listSessions().then(setItems).catch(() => setItems([]));
  }, []);
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: '600' }}>History</Text>
      <FlatList
        data={items}
        keyExtractor={i => i.id}
        renderItem={({ item }) => (
          <View style={{ paddingVertical: 8 }}>
            <Text>{new Date(item.targetTime).toLocaleString()} → {item.wakeTime ? new Date(item.wakeTime).toLocaleTimeString() : 'not woke'}</Text>
            <Text>{item.early ? 'Early wake' : 'Deadline wake'}</Text>
          </View>
        )}
        ListEmptyComponent={<Text>No sessions stored.</Text>}
      />
      <Button title="Back" onPress={() => router.push('/')} />
    </View>
  );
}
