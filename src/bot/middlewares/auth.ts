import type { NextFunction } from "grammy";
import type { User } from "@prisma/client";
import { getPrisma } from "../../db/client.js";
import { logger } from "../../utils/logger.js";
import type { BotContext } from "../context.js";

// Extend context with dbUser
declare module "../context.js" {
  interface BotContextExtras {
    dbUser: User;
  }
}

export type AuthContext = BotContext & { dbUser: User };

export async function authMiddleware(
  ctx: BotContext,
  next: NextFunction
): Promise<void> {
  if (!ctx.from) {
    return;
  }

  const prisma = getPrisma();
  const telegramId = BigInt(ctx.from.id);

  try {
    let user = await prisma.user.findUnique({
      where: { telegramId },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          telegramId,
          firstName: ctx.from.first_name || null,
          languageCode: ctx.from.language_code?.startsWith("uk")
            ? "uk"
            : ctx.from.language_code?.startsWith("ru")
              ? "ru"
              : "en",
        },
      });
      logger.info({ telegramId: Number(telegramId) }, "New user registered");
    } else if (user.firstName !== ctx.from.first_name) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { firstName: ctx.from.first_name || null },
      });
    }

    (ctx as AuthContext).dbUser = user;
  } catch (err) {
    logger.error({ err, telegramId: Number(telegramId) }, "Auth middleware error");
  }

  await next();
}
