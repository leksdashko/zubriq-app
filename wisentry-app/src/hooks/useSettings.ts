import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { getSetting, setSetting } from '../db/settings';
import { rescheduleFromSettings } from '../services/notifications';

export function useSettings() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [frequencyMinutes, setFrequencyMinutes] = useState(120);

  useFocusEffect(
    useCallback(() => {
      setNotificationsEnabled(getSetting('notifications_enabled', 'true') === 'true');
      setFrequencyMinutes(parseInt(getSetting('notification_frequency', '120') ?? '120', 10));
    }, []),
  );

  const updateNotificationsEnabled = useCallback(async (enabled: boolean) => {
    setSetting('notifications_enabled', enabled ? 'true' : 'false');
    setNotificationsEnabled(enabled);
    await rescheduleFromSettings();
  }, []);

  const updateFrequency = useCallback(async (minutes: number) => {
    setSetting('notification_frequency', String(minutes));
    setFrequencyMinutes(minutes);
    await rescheduleFromSettings();
  }, []);

  return { notificationsEnabled, frequencyMinutes, updateNotificationsEnabled, updateFrequency };
}
