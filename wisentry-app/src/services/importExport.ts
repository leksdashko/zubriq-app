import { addWord, getAllWords } from '../db/words';

interface ParsedWord {
  original: string;
  translation: string;
}

const SEPARATOR_REGEX = /\t|(?:\s+[—–\-|]\s+)/;

export function parseWordLines(content: string): ParsedWord[] {
  const lines = content.split(/\r?\n/);
  const parsed: ParsedWord[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const parts = trimmed.split(SEPARATOR_REGEX);
    if (parts.length < 2) continue;

    const original = parts[0].trim();
    const translation = parts.slice(1).join(' ').trim();

    if (!original || !translation) continue;
    if (original.length > 200 || translation.length > 500) continue;

    parsed.push({ original, translation });
  }

  return parsed;
}

export function importWords(content: string): number {
  const words = parseWordLines(content);
  let count = 0;

  for (const word of words) {
    addWord(word.original, word.translation);
    count++;
  }

  return count;
}

export function exportWordsAsText(): string {
  const words = getAllWords();
  return words
    .map((w) => {
      const line = `${w.original}\t${w.translation}`;
      return w.context ? `${line}\t${w.context}` : line;
    })
    .join('\n');
}
