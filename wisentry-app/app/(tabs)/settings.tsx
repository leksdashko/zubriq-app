import { View, Text, Switch, StyleSheet, Pressable } from 'react-native';
import { useSettings } from '@/src/hooks/useSettings';
import { colors, typography, spacing, radius } from '@/src/theme';

const FREQUENCY_OPTIONS = [
  { label: 'Every 30 min', value: 30 },
  { label: 'Every hour', value: 60 },
  { label: 'Every 2 hours', value: 120 },
  { label: 'Every 4 hours', value: 240 },
  { label: 'Every 8 hours', value: 480 },
];

export default function SettingsScreen() {
  const { notificationsEnabled, frequencyMinutes, updateNotificationsEnabled, updateFrequency } = useSettings();

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Review reminders</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={updateNotificationsEnabled}
            trackColor={{ false: colors.border, true: colors.primaryLight }}
            thumbColor={notificationsEnabled ? colors.primary : colors.textTertiary}
          />
        </View>

        {notificationsEnabled && (
          <View style={styles.frequencyGroup}>
            <Text style={styles.frequencyLabel}>Reminder frequency</Text>
            {FREQUENCY_OPTIONS.map((opt) => (
              <Pressable
                key={opt.value}
                style={[
                  styles.frequencyOption,
                  frequencyMinutes === opt.value && styles.frequencyOptionActive,
                ]}
                onPress={() => updateFrequency(opt.value)}
              >
                <Text
                  style={[
                    styles.frequencyText,
                    frequencyMinutes === opt.value && styles.frequencyTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgLight,
    padding: spacing.lg,
  },
  section: {
    backgroundColor: colors.bgWhite,
    borderRadius: radius.lg,
    padding: spacing.lg,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  rowLabel: {
    ...typography.body,
    color: colors.textPrimary,
  },
  frequencyGroup: {
    marginTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.lg,
  },
  frequencyLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  frequencyOption: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.sm,
    marginBottom: spacing.xs,
  },
  frequencyOptionActive: {
    backgroundColor: colors.primaryLight,
  },
  frequencyText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  frequencyTextActive: {
    color: colors.primary,
    fontFamily: 'Inter_600SemiBold',
  },
});
