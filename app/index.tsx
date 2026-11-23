import { Redirect } from 'expo-router';

// The app opens on S1 Welcome.
export default function Index() {
  return <Redirect href="/welcome" />;
}
