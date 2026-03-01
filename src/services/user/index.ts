import type { User } from "@prisma/client";
import { getPrisma } from "../../db/client.js";

export async function findUserByTelegramId(telegramId: bigint): Promise<User | null> {
  const prisma = getPrisma();
  return prisma.user.findUnique({ where: { telegramId } });
}

export async function updateUserLanguage(
  userId: number,
  languageCode: string
): Promise<User> {
  const prisma = getPrisma();
  return prisma.user.update({
    where: { id: userId },
    data: { languageCode },
  });
}

export async function updateTargetLanguage(
  userId: number,
  targetLanguage: string
): Promise<User> {
  const prisma = getPrisma();
  return prisma.user.update({
    where: { id: userId },
    data: { targetLanguage },
  });
}
