import { View, FlatList, Pressable, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useWords } from '@/src/hooks/useWords';
import { exportWordsAsText } from '@/src/services/importExport';
import { WordListItem } from '@/src/components/WordListItem';
import { EmptyState } from '@/src/components/EmptyState';
import { colors, spacing } from '@/src/theme';

export default function WordsScreen() {
  const { words, removeWord } = useWords();
  const router = useRouter();

  const handleExport = async () => {
    if (words.length === 0) {
      Alert.alert('Nothing to export', 'Add some words first.');
      return;
    }

    const content = exportWordsAsText();
    const file = new File(Paths.cache, 'wisentry-words.txt');
    file.create();
    file.write(content);
    await Sharing.shareAsync(file.uri, { mimeType: 'text/plain', dialogTitle: 'Export words' });
  };

  return (
    <View style={styles.container}>
      {words.length === 0 ? (
        <EmptyState
          icon="book-outline"
          title="No words yet"
          subtitle="Tap the + button to add your first word"
        />
      ) : (
        <FlatList
          data={words}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <WordListItem word={item} onDelete={removeWord} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      <View style={styles.fabGroup}>
        <Pressable
          style={({ pressed }) => [styles.fab, styles.fabSecondary, pressed && { opacity: 0.8 }]}
          onPress={() => router.push('/import-words')}
        >
          <Ionicons name="download-outline" size={22} color={colors.primary} />
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.fab, styles.fabSecondary, pressed && { opacity: 0.8 }]}
          onPress={handleExport}
        >
          <Ionicons name="share-outline" size={22} color={colors.primary} />
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.fab, styles.fabPrimary, pressed && { opacity: 0.8 }]}
          onPress={() => router.push('/add-word')}
        >
          <Ionicons name="add" size={28} color={colors.bgWhite} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgLight,
  },
  list: {
    padding: spacing.lg,
  },
  fabGroup: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  fab: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  fabPrimary: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
  },
  fabSecondary: {
    backgroundColor: colors.bgWhite,
    shadowColor: colors.cardShadow,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
