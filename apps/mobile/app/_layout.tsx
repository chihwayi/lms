import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ToastProvider } from '@/components/ui/Toast';
import { useAuthStore } from '@/stores/auth-store';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';

export default function RootLayout() {
  const { initialize, accessToken } = useAuthStore();
  const [isReady, setIsReady] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    initialize().finally(() => setIsReady(true));
  }, []);

  useEffect(() => {
    if (!isReady) return;

    const inAppGroup = segments[0] === '(app)';
    
    if (inAppGroup && !accessToken) {
      // Redirect to login if trying to access app routes without token
      // But we need to check if we have instanceUrl? 
      // Let's just go to index which handles routing logic
      router.replace('/');
    }
  }, [isReady, segments, accessToken]);

  if (!isReady || !fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <ToastProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="(app)" />
      </Stack>
      <StatusBar style="auto" />
    </ToastProvider>
  );
}
