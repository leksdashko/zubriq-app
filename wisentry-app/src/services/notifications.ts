import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getSetting } from '../db/settings';
import { selectNextWord } from './wordSelection';

const NOTIFICATION_ID = 'wisentry-review';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
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

function getRandomInterval(minMinutes: number, maxMinutes: number): number {
  return Math.floor(Math.random() * (maxMinutes - minMinutes + 1) + minMinutes);
}

export async function scheduleNextWordNotification(): Promise<void> {
  await cancelNotifications();

  const enabled = getSetting('notifications_enabled', 'true');
  if (enabled !== 'true') return;

  const frequency = getSetting('notification_frequency', '120') ?? '120';
  let intervalMinutes: number;

  if (frequency === 'random') {
    intervalMinutes = getRandomInterval(5, 60);
  } else {
    intervalMinutes = parseFloat(frequency);
  }

  if (intervalMinutes <= 0) return;

  const seconds = Math.max(intervalMinutes * 60, 60);

  const word = selectNextWord();

  const content = word
    ? {
        title: `📝 ${word.original}`,
        body: 'Think first, then tap to check!',
        data: { wordId: word.id },
        ...(Platform.OS === 'android' && { channelId: 'review' }),
      }
    : {
        title: 'Time to review!',
        body: 'You have words waiting for review in Wisentry.',
        ...(Platform.OS === 'android' && { channelId: 'review' }),
      };

  await Notifications.scheduleNotificationAsync({
    identifier: NOTIFICATION_ID,
    content,
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds,
      repeats: false,
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

  await scheduleNextWordNotification();
}
