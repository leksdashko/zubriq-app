import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import { useRouter } from 'expo-router';
import { importWords, parseWordLines } from '@/src/services/importExport';
import { Button } from '@/src/components/Button';
import { colors, typography, spacing, radius } from '@/src/theme';

export default function ImportWordsScreen() {
  const router = useRouter();
  const [text, setText] = useState('');
  const [preview, setPreview] = useState<{ original: string; translation: string }[]>([]);

  const handleTextChange = (value: string) => {
    setText(value);
    setPreview(parseWordLines(value));
  };

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'text/plain',
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.[0]) return;

      const file = new File(result.assets[0].uri);
      const content = file.textSync();
      setText(content);
      setPreview(parseWordLines(content));
    } catch {
      Alert.alert('Error', 'Could not read the file.');
    }
  };

  const handleImport = () => {
    if (preview.length === 0) {
      Alert.alert('Nothing to import', 'No valid word pairs found.');
      return;
    }

    const count = importWords(text);
    Alert.alert('Imported', `${count} word${count !== 1 ? 's' : ''} added.`, [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.instructions}>
        Paste words or pick a .txt file. Each line should have a word and its translation separated by tab, dash, or pipe.
      </Text>
      <Text style={styles.example}>
        {'hello — привіт\nworld | мир\ncat\tкіт'}
      </Text>

      <Button title="Pick a file" onPress={handlePickFile} variant="secondary" style={styles.pickBtn} />

      <TextInput
        style={styles.input}
        multiline
        placeholder={'word — translation\nanother — інше'}
        placeholderTextColor={colors.textTertiary}
        value={text}
        onChangeText={handleTextChange}
        textAlignVertical="top"
      />

      {preview.length > 0 && (
        <View style={styles.previewSection}>
          <Text style={styles.previewTitle}>Preview ({preview.length} words)</Text>
          {preview.slice(0, 10).map((w, i) => (
            <View key={i} style={styles.previewRow}>
              <Text style={styles.previewOriginal}>{w.original}</Text>
              <Text style={styles.previewArrow}>→</Text>
              <Text style={styles.previewTranslation}>{w.translation}</Text>
            </View>
          ))}
          {preview.length > 10 && (
            <Text style={styles.previewMore}>...and {preview.length - 10} more</Text>
          )}
        </View>
      )}

      <Button
        title={`Import ${preview.length} word${preview.length !== 1 ? 's' : ''}`}
        onPress={handleImport}
        disabled={preview.length === 0}
        style={styles.importBtn}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgLight,
  },
  content: {
    padding: spacing.lg,
  },
  instructions: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  example: {
    ...typography.small,
    color: colors.textTertiary,
    backgroundColor: colors.bgWhite,
    padding: spacing.md,
    borderRadius: radius.sm,
    fontFamily: 'Inter_400Regular',
    marginBottom: spacing.lg,
  },
  pickBtn: {
    marginBottom: spacing.lg,
  },
  input: {
    backgroundColor: colors.bgWhite,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    minHeight: 140,
    ...typography.body,
    color: colors.textPrimary,
    fontFamily: 'Inter_400Regular',
  },
  previewSection: {
    marginTop: spacing.lg,
    backgroundColor: colors.bgWhite,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  previewTitle: {
    ...typography.caption,
    color: colors.primary,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: spacing.sm,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  previewOriginal: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  previewArrow: {
    ...typography.body,
    color: colors.textTertiary,
    marginHorizontal: spacing.sm,
  },
  previewTranslation: {
    ...typography.body,
    color: colors.textSecondary,
    flex: 1,
    textAlign: 'right',
  },
  previewMore: {
    ...typography.small,
    color: colors.textTertiary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  importBtn: {
    marginTop: spacing.xl,
  },
});
