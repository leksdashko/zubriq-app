import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, radius } from '../theme';
import type { WordWithProgress } from '../types';

interface Props {
  word: WordWithProgress;
  isFlipped: boolean;
  onFlip: () => void;
}

export function FlashCard({ word, isFlipped, onFlip }: Props) {
  const flipAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(flipAnim, {
      toValue: isFlipped ? 1 : 0,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
  }, [isFlipped, flipAnim]);

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });
  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const handleFlip = () => {
    if (!isFlipped) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onFlip();
    }
  };

  return (
    <Pressable onPress={handleFlip} style={styles.container}>
      <Animated.View style={[styles.card, styles.cardFront, { transform: [{ rotateY: frontInterpolate }] }]}>
        <Text style={styles.label}>Word</Text>
        <Text style={styles.word}>{word.original}</Text>
        {!isFlipped && <Text style={styles.hint}>Tap to reveal</Text>}
      </Animated.View>
      <Animated.View style={[styles.card, styles.cardBack, { transform: [{ rotateY: backInterpolate }] }]}>
        <Text style={styles.label}>Translation</Text>
        <Text style={styles.word}>{word.translation}</Text>
        {word.context && <Text style={styles.context}>{word.context}</Text>}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 280,
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
    borderRadius: radius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['3xl'],
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  cardFront: {
    backgroundColor: colors.bgWhite,
    borderWidth: 2,
    borderColor: colors.primaryLight,
  },
  cardBack: {
    backgroundColor: colors.primaryLight,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  label: {
    ...typography.caption,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  word: {
    ...typography.h1,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  hint: {
    ...typography.small,
    color: colors.textTertiary,
    marginTop: spacing.xl,
  },
  context: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.lg,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
