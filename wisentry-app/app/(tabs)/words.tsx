import { View, FlatList, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useWords } from '@/src/hooks/useWords';
import { WordListItem } from '@/src/components/WordListItem';
import { EmptyState } from '@/src/components/EmptyState';
import { colors, spacing } from '@/src/theme';

export default function WordsScreen() {
  const { words, removeWord } = useWords();
  const router = useRouter();

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

      <Pressable
        style={({ pressed }) => [styles.fab, pressed && { opacity: 0.8 }]}
        onPress={() => router.push('/add-word')}
      >
        <Ionicons name="add" size={28} color={colors.bgWhite} />
      </Pressable>
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
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
});
