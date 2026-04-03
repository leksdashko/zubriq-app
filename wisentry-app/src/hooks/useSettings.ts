import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { getSetting, setSetting } from '../db/settings';
import { rescheduleFromSettings } from '../services/notifications';

export function useSettings() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [frequency, setFrequency] = useState('120');

  useFocusEffect(
    useCallback(() => {
      setNotificationsEnabled(getSetting('notifications_enabled', 'true') === 'true');
      setFrequency(getSetting('notification_frequency', '120') ?? '120');
    }, []),
  );

  const updateNotificationsEnabled = useCallback(async (enabled: boolean) => {
    setSetting('notifications_enabled', enabled ? 'true' : 'false');
    setNotificationsEnabled(enabled);
    await rescheduleFromSettings();
  }, []);

  const updateFrequency = useCallback(async (value: string) => {
    setSetting('notification_frequency', value);
    setFrequency(value);
    await rescheduleFromSettings();
  }, []);

  return { notificationsEnabled, frequency, updateNotificationsEnabled, updateFrequency };
}
