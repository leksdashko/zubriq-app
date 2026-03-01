import { type Composer, InputFile } from "grammy";
import type { BotContext } from "../context.js";
import type { AuthContext } from "../middlewares/auth.js";
import {
  addWord,
  getUserWords,
  getAllUserWords,
  importWords,
} from "../../services/dictionary/index.js";
import { parseWordLines } from "../../services/dictionary/import.js";
import { wordListKeyboard } from "../keyboards/index.js";
import { logger } from "../../utils/logger.js";

export function registerWordsHandlers(bot: Composer<BotContext>): void {
  // /add — start conversational flow
  bot.command("add", async (ctx) => {
    try {
      ctx.session.step = "add:original";
      ctx.session.addingWord = {};
      await ctx.reply(ctx.t("words-add_prompt"));
    } catch (err) {
      logger.error({ err, telegramId: ctx.from?.id }, "Error in /add handler");
      await ctx.reply(ctx.t("errors-generic")).catch(() => {});
    }
  });

  // /words — paginated word list
  bot.command("words", async (ctx) => {
    const authCtx = ctx as AuthContext;
    try {
      const { words, total, totalPages } = await getUserWords(authCtx.dbUser.id, 0);

      if (total === 0) {
        await ctx.reply(ctx.t("words-empty"));
        return;
      }

      const lines = [ctx.t("words-list_header", { count: String(total) }), ""];
      for (const word of words) {
        lines.push(`• ${word.original} — ${word.translation}`);
      }

      await ctx.reply(lines.join("\n"), {
        reply_markup: wordListKeyboard(words, 0, totalPages),
      });
    } catch (err) {
      logger.error({ err, telegramId: ctx.from?.id }, "Error in /words handler");
      await ctx.reply(ctx.t("errors-generic")).catch(() => {});
    }
  });

  // /import — prompt for file
  bot.command("import", async (ctx) => {
    try {
      await ctx.reply(ctx.t("words-import_prompt"));
    } catch (err) {
      logger.error({ err, telegramId: ctx.from?.id }, "Error in /import handler");
      await ctx.reply(ctx.t("errors-generic")).catch(() => {});
    }
  });

  // /export — send words as text file
  bot.command("export", async (ctx) => {
    const authCtx = ctx as AuthContext;
    try {
      const words = await getAllUserWords(authCtx.dbUser.id);

      if (words.length === 0) {
        await ctx.reply(ctx.t("words-export_empty"));
        return;
      }

      const content = words
        .map((w) => `${w.original} — ${w.translation}`)
        .join("\n");

      const buffer = Buffer.from(content, "utf-8");
      const inputFile = new InputFile(new Uint8Array(buffer), "zubriq_words.txt");

      await ctx.replyWithDocument(inputFile, {
        caption: ctx.t("words-export_header"),
      });
    } catch (err) {
      logger.error({ err, telegramId: ctx.from?.id }, "Error in /export handler");
      await ctx.reply(ctx.t("errors-generic")).catch(() => {});
    }
  });

  // /skip — skip context step in word adding
  bot.command("skip", async (ctx) => {
    if (ctx.session.step === "add:context") {
      const authCtx = ctx as AuthContext;
      const { original, translation } = ctx.session.addingWord ?? {};

      if (!original || !translation) {
        ctx.session.step = undefined;
        ctx.session.addingWord = undefined;
        return;
      }

      try {
        await addWord(authCtx.dbUser.id, original, translation);
        await ctx.reply(ctx.t("words-added", { word: original }));
      } catch (err) {
        logger.error({ err }, "Error saving word");
        await ctx.reply(ctx.t("errors-generic")).catch(() => {});
      }

      ctx.session.step = undefined;
      ctx.session.addingWord = undefined;
    }
  });

  // Handle file uploads for import
  bot.on("message:document", async (ctx) => {
    const authCtx = ctx as AuthContext;
    const doc = ctx.message.document;

    if (!doc.file_name?.match(/\.(txt|csv)$/i)) {
      return;
    }

    try {
      const file = await ctx.getFile();
      const url = `https://api.telegram.org/file/bot${ctx.api.token}/${file.file_path}`;

      const response = await fetch(url);
      const text = await response.text();

      const parsed = parseWordLines(text);

      if (parsed.length === 0) {
        await ctx.reply(ctx.t("words-import_empty"));
        return;
      }

      const count = await importWords(authCtx.dbUser.id, parsed);
      await ctx.reply(ctx.t("words-import_success", { count: String(count) }));
    } catch (err) {
      logger.error({ err, telegramId: ctx.from?.id }, "Error importing words");
      await ctx.reply(ctx.t("words-import_error")).catch(() => {});
    }
  });

  // Handle text messages for conversational flow
  bot.on("message:text", async (ctx) => {
    const authCtx = ctx as AuthContext;
    const step = ctx.session.step;

    if (!step?.startsWith("add:")) return;

    const text = ctx.message.text.trim();

    try {
      if (step === "add:original") {
        if (text.length > 200) {
          await ctx.reply(ctx.t("words-too_long"));
          return;
        }
        ctx.session.addingWord = { original: text };
        ctx.session.step = "add:translation";
        await ctx.reply(ctx.t("words-add_translation"));
      } else if (step === "add:translation") {
        if (text.length > 500) {
          await ctx.reply(ctx.t("words-too_long"));
          return;
        }
        if (ctx.session.addingWord) {
          ctx.session.addingWord.translation = text;
        }
        ctx.session.step = "add:context";
        await ctx.reply(ctx.t("words-add_context"));
      } else if (step === "add:context") {
        const { original, translation } = ctx.session.addingWord ?? {};
        if (!original || !translation) {
          ctx.session.step = undefined;
          ctx.session.addingWord = undefined;
          return;
        }

        await addWord(authCtx.dbUser.id, original, translation, text);
        await ctx.reply(ctx.t("words-added", { word: original }));

        ctx.session.step = undefined;
        ctx.session.addingWord = undefined;
      }
    } catch (err) {
      logger.error({ err, telegramId: ctx.from?.id }, "Error in add word flow");
      await ctx.reply(ctx.t("errors-generic")).catch(() => {});
      ctx.session.step = undefined;
      ctx.session.addingWord = undefined;
    }
  });
}
