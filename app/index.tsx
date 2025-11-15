import { useRouter } from 'expo-router';
import { Button, Text, View } from 'react-native';
import { useSession } from '../context/SessionContext';

export default function Index() {
  const router = useRouter();
  const { config, state } = useSession();
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={{ fontSize: 22, fontWeight: '600' }}>HeartWake</Text>
      {config ? (
        <Text>Target: {new Date(config.targetTime).toLocaleTimeString()} (window {config.windowMinutes}m)</Text>
      ) : (
        <Text>No session configured.</Text>
      )}
      {state.active && <Text>Session running. Current stage: {state.stage || 'unknown'}</Text>}
      <View style={{ height: 16 }} />
      <Button title="Setup Session" onPress={() => router.push('/sleep/setup')} />
      <View style={{ height: 8 }} />
      <Button title="Live Session" onPress={() => router.push('/sleep/live')} />
      <View style={{ height: 8 }} />
      <Button title="History" onPress={() => router.push('/sleep/history')} />
    </View>
  );
}
