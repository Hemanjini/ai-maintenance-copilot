import IncidentDetailScreen from '../../screens/IncidentDetailScreen';
import { Stack } from 'expo-router';

export default function Page() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <IncidentDetailScreen />
    </>
  );
}
