import { I18n } from "@grammyjs/i18n";
import path from "node:path";
import type { BotContext } from "../context.js";

export function createI18n(): I18n<BotContext> {
  const i18n = new I18n<BotContext>({
    defaultLocale: "uk",
    directory: path.resolve(process.cwd(), "src/i18n"),
    useSession: false,
    globalTranslationContext(ctx) {
      return {
        name: ctx.from?.first_name ?? "",
      };
    },
    localeNegotiator(ctx) {
      // First check DB user languageCode stored in ctx (set by auth middleware)
      const dbLocale = (ctx as BotContext & { dbUser?: { languageCode: string } }).dbUser
        ?.languageCode;
      if (dbLocale && (dbLocale === "uk" || dbLocale === "en" || dbLocale === "ru")) {
        return dbLocale;
      }
      // Fallback to Telegram language_code
      const tgLang = ctx.from?.language_code;
      if (tgLang?.startsWith("uk")) return "uk";
      if (tgLang?.startsWith("ru")) return "ru";
      if (tgLang?.startsWith("en")) return "en";
      return "uk";
    },
  });

  return i18n;
}
