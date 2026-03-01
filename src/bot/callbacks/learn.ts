import type { Composer } from "grammy";
import type { BotContext } from "../context.js";
import type { AuthContext } from "../middlewares/auth.js";
import { frequencyKeyboard } from "../keyboards/index.js";
import { getPrisma } from "../../db/client.js";
import { getUserWordCount } from "../../services/dictionary/index.js";
import {
  startSession,
  stopSession,
} from "../../services/scheduler/index.js";
import { logger } from "../../utils/logger.js";

export function registerLearnCallbacks(bot: Composer<BotContext>): void {
  // l:method:{methodId} — select learning method
  bot.callbackQuery(/^l:method:(\w+)$/, async (ctx) => {
    const methodId = ctx.match[1];

    try {
      ctx.session.pendingMethod = methodId;
      await ctx.editMessageText(ctx.t("learn-choose_frequency"), {
        reply_markup: frequencyKeyboard(),
      });
      await ctx.answerCallbackQuery();
    } catch (err) {
      logger.error({ err, methodId }, "Error selecting method");
      await ctx.answerCallbackQuery(ctx.t("errors-generic"));
    }
  });

  // l:freq:{frequency} — select frequency and start
  bot.callbackQuery(/^l:freq:(\w+)$/, async (ctx) => {
    const authCtx = ctx as unknown as AuthContext;
    const frequency = ctx.match[1];
    const methodType = ctx.session.pendingMethod ?? "flashcard";

    try {
      const prisma = getPrisma();

      // Double-check no active session
      const existing = await prisma.learningSession.findFirst({
        where: { userId: authCtx.dbUser.id, isActive: true },
      });

      if (existing) {
        await ctx.answerCallbackQuery(ctx.t("learn-already_active"));
        return;
      }

      // Check user has words
      const wordCount = await getUserWordCount(authCtx.dbUser.id);
      if (wordCount === 0) {
        await ctx.editMessageText(ctx.t("learn-no_words"));
        await ctx.answerCallbackQuery();
        return;
      }

      // Create session in DB
      const session = await prisma.learningSession.create({
        data: {
          userId: authCtx.dbUser.id,
          methodType,
          frequency,
          isActive: true,
          startedAt: new Date(),
        },
      });

      // Schedule BullMQ job
      await startSession(
        session.id,
        authCtx.dbUser.id,
        authCtx.dbUser.telegramId,
        methodType,
        frequency
      );

      ctx.session.pendingMethod = undefined;
      ctx.session.pendingFrequency = undefined;

      await ctx.editMessageText(ctx.t("learn-started"));
      await ctx.answerCallbackQuery();
    } catch (err) {
      logger.error({ err, frequency, methodType }, "Error starting session");
      await ctx.answerCallbackQuery(ctx.t("errors-generic"));
    }
  });

  // l:stop — stop session (from inline keyboard)
  bot.callbackQuery("l:stop", async (ctx) => {
    const authCtx = ctx as unknown as AuthContext;

    try {
      const prisma = getPrisma();
      const activeSession = await prisma.learningSession.findFirst({
        where: { userId: authCtx.dbUser.id, isActive: true },
      });

      if (!activeSession) {
        await ctx.answerCallbackQuery(ctx.t("learn-no_active_session"));
        return;
      }

      await stopSession(activeSession.id, authCtx.dbUser.id);

      await prisma.learningSession.update({
        where: { id: activeSession.id },
        data: { isActive: false, stoppedAt: new Date() },
      });

      await ctx.editMessageText(ctx.t("learn-stopped"));
      await ctx.answerCallbackQuery();
    } catch (err) {
      logger.error({ err }, "Error stopping session via callback");
      await ctx.answerCallbackQuery(ctx.t("errors-generic"));
    }
  });
}
