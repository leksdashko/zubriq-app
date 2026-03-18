import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useReview } from '@/src/hooks/useReview';
import { FlashCard } from '@/src/components/FlashCard';
import { Button } from '@/src/components/Button';
import { EmptyState } from '@/src/components/EmptyState';
import { colors, spacing } from '@/src/theme';

export default function ReviewScreen() {
  const { currentWord, isFlipped, isComplete, loadNext, flip, answer } = useReview();

  useEffect(() => {
    loadNext();
  }, [loadNext]);

  if (isComplete || !currentWord) {
    return (
      <EmptyState
        icon="checkmark-circle-outline"
        title="All caught up!"
        subtitle="No words to review right now. Add more words or check back later."
      />
    );
  }

  const handleKnow = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    answer(5);
  };

  const handleHard = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    answer(2);
  };

  return (
    <View style={styles.container}>
      <View style={styles.cardWrapper}>
        <FlashCard word={currentWord} isFlipped={isFlipped} onFlip={flip} />
      </View>

      {isFlipped && (
        <View style={styles.buttons}>
          <Button
            title="Know"
            onPress={handleKnow}
            variant="success"
            style={styles.answerBtn}
          />
          <View style={{ width: spacing.md }} />
          <Button
            title="Hard"
            onPress={handleHard}
            variant="danger"
            style={styles.answerBtn}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgLight,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  cardWrapper: {
    alignItems: 'center',
  },
  buttons: {
    flexDirection: 'row',
    marginTop: spacing['3xl'],
    paddingHorizontal: spacing.lg,
  },
  answerBtn: {
    flex: 1,
  },
});
