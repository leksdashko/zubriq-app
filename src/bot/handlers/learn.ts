import type { Composer } from "grammy";
import type { BotContext } from "../context.js";
import type { AuthContext } from "../middlewares/auth.js";
import { methodKeyboard, frequencyKeyboard } from "../keyboards/index.js";
import { getPrisma } from "../../db/client.js";
import { getUserWordCount } from "../../services/dictionary/index.js";
import { startSession, stopSession } from "../../services/scheduler/index.js";
import { logger } from "../../utils/logger.js";

export function registerLearnHandlers(bot: Composer<BotContext>): void {
  // /learn — start learning flow
  bot.command("learn", async (ctx) => {
    const authCtx = ctx as AuthContext;

    try {
      // Check if user has words
      const wordCount = await getUserWordCount(authCtx.dbUser.id);
      if (wordCount === 0) {
        await ctx.reply(ctx.t("learn-no_words"));
        return;
      }

      // Check for active session
      const prisma = getPrisma();
      const activeSession = await prisma.learningSession.findFirst({
        where: { userId: authCtx.dbUser.id, isActive: true },
      });

      if (activeSession) {
        await ctx.reply(ctx.t("learn-already_active"));
        return;
      }

      await ctx.reply(ctx.t("learn-choose_method"), {
        reply_markup: methodKeyboard(),
      });
    } catch (err) {
      logger.error({ err, telegramId: ctx.from?.id }, "Error in /learn handler");
      await ctx.reply(ctx.t("errors-generic")).catch(() => {});
    }
  });

  // /stop — stop active session
  bot.command("stop", async (ctx) => {
    const authCtx = ctx as AuthContext;

    try {
      const prisma = getPrisma();
      const activeSession = await prisma.learningSession.findFirst({
        where: { userId: authCtx.dbUser.id, isActive: true },
      });

      if (!activeSession) {
        await ctx.reply(ctx.t("learn-no_active_session"));
        return;
      }

      await stopSession(activeSession.id, authCtx.dbUser.id);

      await prisma.learningSession.update({
        where: { id: activeSession.id },
        data: { isActive: false, stoppedAt: new Date() },
      });

      await ctx.reply(ctx.t("learn-stopped"));
    } catch (err) {
      logger.error({ err, telegramId: ctx.from?.id }, "Error in /stop handler");
      await ctx.reply(ctx.t("errors-generic")).catch(() => {});
    }
  });
}
