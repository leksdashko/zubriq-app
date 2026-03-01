import type { Composer } from "grammy";
import type { BotContext } from "../context.js";
import type { AuthContext } from "../middlewares/auth.js";
import { getPrisma } from "../../db/client.js";
import { getFrequencyLabel } from "../../services/scheduler/frequencies.js";
import { logger } from "../../utils/logger.js";

export function registerStatsHandler(bot: Composer<BotContext>): void {
  bot.command("stats", async (ctx) => {
    const authCtx = ctx as AuthContext;

    try {
      const prisma = getPrisma();
      const userId = authCtx.dbUser.id;

      const [totalWords, learnedCount, activeSession] = await Promise.all([
        prisma.word.count({ where: { userId } }),
        prisma.wordProgress.count({
          where: { word: { userId }, isLearned: true },
        }),
        prisma.learningSession.findFirst({
          where: { userId, isActive: true },
        }),
      ]);

      const inProgress = totalWords - learnedCount;

      const lines = [
        ctx.t("stats-title"),
        "",
        ctx.t("stats-total_words", { count: String(totalWords) }),
        ctx.t("stats-learned", { count: String(learnedCount) }),
        ctx.t("stats-in_progress", { count: String(inProgress) }),
        "",
        activeSession
          ? ctx.t("stats-active_session", {
              method: activeSession.methodType,
              frequency: getFrequencyLabel(activeSession.frequency),
            })
          : ctx.t("stats-no_session"),
      ];

      await ctx.reply(lines.join("\n"));
    } catch (err) {
      logger.error({ err, telegramId: ctx.from?.id }, "Error in /stats handler");
      await ctx.reply(ctx.t("errors-generic")).catch(() => {});
    }
  });
}
