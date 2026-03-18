import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getSetting } from '../db/settings';

const NOTIFICATION_ID = 'wisentry-review';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleReviewNotification(intervalMinutes: number): Promise<void> {
  await cancelNotifications();

  if (intervalMinutes <= 0) return;

  await Notifications.scheduleNotificationAsync({
    identifier: NOTIFICATION_ID,
    content: {
      title: 'Time to review!',
      body: 'You have words waiting for review in Wisentry.',
      ...(Platform.OS === 'android' && { channelId: 'review' }),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: intervalMinutes * 60,
      repeats: true,
    },
  });
}

export async function cancelNotifications(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(NOTIFICATION_ID).catch(() => {});
}

export async function rescheduleFromSettings(): Promise<void> {
  const enabled = getSetting('notifications_enabled', 'true');
  if (enabled !== 'true') {
    await cancelNotifications();
    return;
  }

  const frequency = getSetting('notification_frequency', '120') ?? '120';
  await scheduleReviewNotification(parseInt(frequency, 10));
}
