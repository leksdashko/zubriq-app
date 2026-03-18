import { useState } from 'react';
import { View, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { addWord } from '@/src/db/words';
import { Button } from '@/src/components/Button';
import { colors, typography, spacing, radius } from '@/src/theme';

export default function AddWordScreen() {
  const router = useRouter();
  const [original, setOriginal] = useState('');
  const [translation, setTranslation] = useState('');
  const [context, setContext] = useState('');

  const canSave = original.trim().length > 0 && translation.trim().length > 0;

  const handleSave = () => {
    if (!canSave) return;
    addWord(original, translation, context || undefined);
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Word or phrase"
          placeholderTextColor={colors.textTertiary}
          value={original}
          onChangeText={setOriginal}
          autoFocus
          returnKeyType="next"
        />
        <TextInput
          style={styles.input}
          placeholder="Translation"
          placeholderTextColor={colors.textTertiary}
          value={translation}
          onChangeText={setTranslation}
          returnKeyType="next"
        />
        <TextInput
          style={[styles.input, styles.contextInput]}
          placeholder="Context or example (optional)"
          placeholderTextColor={colors.textTertiary}
          value={context}
          onChangeText={setContext}
          multiline
          returnKeyType="done"
        />

        <View style={styles.buttons}>
          <Button
            title="Save"
            onPress={handleSave}
            disabled={!canSave}
            style={{ flex: 1 }}
          />
          <View style={{ width: spacing.sm }} />
          <Button
            title="Cancel"
            onPress={() => router.back()}
            variant="secondary"
            style={{ flex: 1 }}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgLight,
  },
  form: {
    padding: spacing.lg,
    paddingTop: spacing['2xl'],
  },
  input: {
    ...typography.body,
    backgroundColor: colors.bgWhite,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    color: colors.textPrimary,
  },
  contextInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  buttons: {
    flexDirection: 'row',
    marginTop: spacing.lg,
  },
});
