import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';
import { initializeDatabase } from '@/src/db/schema';
import { requestNotificationPermissions, scheduleNextWordNotification, rescheduleFromSettings } from '@/src/services/notifications';
import { colors } from '@/src/theme';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  useEffect(() => {
    try {
      initializeDatabase();
      setDbReady(true);
    } catch (e) {
      console.error('DB init failed:', e);
    }
  }, []);

  useEffect(() => {
    if (dbReady) {
      requestNotificationPermissions().then(() => {
        rescheduleFromSettings();
      });
    }
  }, [dbReady]);

  // When a notification is received while app is foregrounded, schedule the next one
  useEffect(() => {
    if (!dbReady) return;

    const receivedSub = Notifications.addNotificationReceivedListener(() => {
      scheduleNextWordNotification();
    });

    // When user taps a notification, schedule the next one
    const responseSub = Notifications.addNotificationResponseReceivedListener(() => {
      scheduleNextWordNotification();
    });

    return () => {
      receivedSub.remove();
      responseSub.remove();
    };
  }, [dbReady]);

  useEffect(() => {
    if (fontError) throw fontError;
  }, [fontError]);

  useEffect(() => {
    if (fontsLoaded && dbReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, dbReady]);

  if (!fontsLoaded || !dbReady) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.bgWhite },
        headerTintColor: colors.primary,
        headerTitleStyle: { fontFamily: 'Inter_600SemiBold' },
        contentStyle: { backgroundColor: colors.bgLight },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="add-word"
        options={{
          presentation: 'modal',
          title: 'Add Word',
        }}
      />
      <Stack.Screen
        name="import-words"
        options={{
          presentation: 'modal',
          title: 'Import Words',
        }}
      />
    </Stack>
  );
}
