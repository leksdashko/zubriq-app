import { useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useReview } from '@/src/hooks/useReview';
import { FlashCard } from '@/src/components/FlashCard';
import { Button } from '@/src/components/Button';
import { EmptyState } from '@/src/components/EmptyState';
import { colors, spacing } from '@/src/theme';

export default function ReviewScreen() {
  const { currentWord, isFlipped, isComplete, loadNext, flip, answer, removeWord } = useReview();

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

  const handleDelete = () => {
    Alert.alert(
      'Delete word',
      `Delete "${currentWord.original}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            removeWord();
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.cardWrapper}>
        <FlashCard word={currentWord} isFlipped={isFlipped} onFlip={flip} />
      </View>

      {isFlipped && (
        <View style={styles.buttonsContainer}>
          <View style={styles.answerRow}>
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
          <Button
            title="Delete word"
            onPress={handleDelete}
            variant="secondary"
            style={styles.deleteBtn}
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
  buttonsContainer: {
    marginTop: spacing['3xl'],
    paddingHorizontal: spacing.lg,
  },
  answerRow: {
    flexDirection: 'row',
  },
  answerBtn: {
    flex: 1,
  },
  deleteBtn: {
    marginTop: spacing.md,
  },
});
