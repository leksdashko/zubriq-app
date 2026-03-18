import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useStats } from '@/src/hooks/useStats';
import { StatCard } from '@/src/components/StatCard';
import { Button } from '@/src/components/Button';
import { colors, typography, spacing } from '@/src/theme';

export default function HomeScreen() {
  const stats = useStats();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Wisentry</Text>
        <Text style={styles.subtitle}>Your vocabulary trainer</Text>
      </View>

      <View style={styles.statsRow}>
        <StatCard label="Total words" value={stats.totalWords} color={colors.primary} />
        <View style={{ width: spacing.sm }} />
        <StatCard label="Learned" value={stats.learnedWords} color={colors.success} />
      </View>

      <View style={styles.statsRow}>
        <StatCard label="Due for review" value={stats.dueWords} color={colors.accent} />
        <View style={{ width: spacing.sm }} />
        <StatCard label="Reviewed today" value={stats.reviewedToday} color={colors.primaryDark} />
      </View>

      <View style={styles.actions}>
        {stats.dueWords > 0 && (
          <Button
            title={`Review ${stats.dueWords} word${stats.dueWords !== 1 ? 's' : ''}`}
            onPress={() => router.push('/review')}
            style={{ marginBottom: spacing.sm }}
          />
        )}
        <Button
          title="Add a word"
          onPress={() => router.push('/add-word')}
          variant="secondary"
        />
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
  header: {
    paddingVertical: spacing['3xl'],
    alignItems: 'center',
  },
  title: {
    ...typography.h1,
    color: colors.primary,
    fontSize: 32,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  actions: {
    marginTop: spacing['2xl'],
  },
});
