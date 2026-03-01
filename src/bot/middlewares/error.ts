import type { BotError } from "grammy";
import { logger } from "../../utils/logger.js";
import type { BotContext } from "../context.js";

export async function errorHandler(err: BotError<BotContext>): Promise<void> {
  const ctx = err.ctx;
  const e = err.error;

  const telegramId = ctx.from?.id;
  logger.error(
    {
      err: e,
      telegramId,
      updateType: ctx.update?.update_id,
    },
    "Bot error"
  );

  try {
    await ctx.reply(ctx.t("errors-generic"));
  } catch (replyErr) {
    logger.error({ err: replyErr }, "Failed to send error message to user");
  }
}
