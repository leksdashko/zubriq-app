import type { Word } from "@prisma/client";
import { getPrisma } from "../../db/client.js";

const WORDS_PER_PAGE = 10;

export async function addWord(
  userId: number,
  original: string,
  translation: string,
  context?: string
): Promise<Word> {
  const prisma = getPrisma();
  return prisma.word.create({
    data: {
      userId,
      original,
      translation,
      context: context || null,
    },
  });
}

export async function getUserWords(
  userId: number,
  page: number = 0
): Promise<{ words: Word[]; total: number; totalPages: number }> {
  const prisma = getPrisma();

  const [words, total] = await Promise.all([
    prisma.word.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip: page * WORDS_PER_PAGE,
      take: WORDS_PER_PAGE,
    }),
    prisma.word.count({ where: { userId } }),
  ]);

  return {
    words,
    total,
    totalPages: Math.ceil(total / WORDS_PER_PAGE),
  };
}

export async function deleteWord(wordId: number, userId: number): Promise<boolean> {
  const prisma = getPrisma();
  const word = await prisma.word.findFirst({
    where: { id: wordId, userId },
  });

  if (!word) return false;

  await prisma.word.delete({ where: { id: wordId } });
  return true;
}

export async function getWordById(wordId: number): Promise<Word | null> {
  const prisma = getPrisma();
  return prisma.word.findUnique({ where: { id: wordId } });
}

export async function getUserWordCount(userId: number): Promise<number> {
  const prisma = getPrisma();
  return prisma.word.count({ where: { userId } });
}

export async function getAllUserWords(userId: number): Promise<Word[]> {
  const prisma = getPrisma();
  return prisma.word.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });
}

export async function importWords(
  userId: number,
  words: Array<{ original: string; translation: string }>
): Promise<number> {
  const prisma = getPrisma();
  const result = await prisma.word.createMany({
    data: words.map((w) => ({
      userId,
      original: w.original,
      translation: w.translation,
    })),
  });
  return result.count;
}
