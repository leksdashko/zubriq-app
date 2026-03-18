import React from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius } from '../theme';
import type { Word } from '../types';

interface Props {
  word: Word;
  onDelete: (id: number) => void;
}

export function WordListItem({ word, onDelete }: Props) {
  const handleDelete = () => {
    Alert.alert('Delete word', `Remove "${word.original}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onDelete(word.id) },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.original}>{word.original}</Text>
        <Text style={styles.translation}>{word.translation}</Text>
        {word.context && <Text style={styles.context}>{word.context}</Text>}
      </View>
      <Pressable onPress={handleDelete} hitSlop={8} style={styles.deleteBtn}>
        <Ionicons name="trash-outline" size={20} color={colors.textTertiary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgWhite,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  content: {
    flex: 1,
  },
  original: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  translation: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  context: {
    ...typography.small,
    color: colors.textTertiary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  deleteBtn: {
    padding: spacing.sm,
  },
});
