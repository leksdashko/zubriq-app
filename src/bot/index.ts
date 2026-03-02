import { Bot, session } from "grammy";
import type { BotContext, SessionData } from "./context.js";
import { createI18n } from "./middlewares/i18n.js";
import { authMiddleware } from "./middlewares/auth.js";
import { errorHandler } from "./middlewares/error.js";
import { registerStartHandler } from "./handlers/start.js";
import { registerHelpHandler } from "./handlers/help.js";
import { registerWordsHandlers } from "./handlers/words.js";
import { registerLearnHandlers } from "./handlers/learn.js";
import { registerSettingsHandler } from "./handlers/settings.js";
import { registerStatsHandler } from "./handlers/stats.js";
import { registerCallbackRouter } from "./callbacks/router.js";

export async function createBot(token: string): Promise<Bot<BotContext>> {
  const bot = new Bot<BotContext>(token);

  // Register command menu in Telegram UI
  await bot.api.setMyCommands([
    { command: "start", description: "Почати роботу з ботом" },
    { command: "add", description: "Додати нове слово" },
    { command: "words", description: "Переглянути словник" },
    { command: "learn", description: "Почати вивчення" },
    { command: "stop", description: "Зупинити вивчення" },
    { command: "settings", description: "Налаштування" },
    { command: "stats", description: "Статистика" },
    { command: "import", description: "Імпортувати слова з файлу" },
    { command: "export", description: "Експортувати словник" },
    { command: "help", description: "Довідка" },
  ]);

  // Bot description — shown on the start screen before user presses "Start"
  // Default (English)
  await bot.api.setMyDescription(
    "Welcome to Zubriq!\n" +
    "🧠 Helping you memorize words effectively with spaced repetition.\n" +
    "🔔 How it works: add a word with translation → choose pace → get Telegram notifications with words.\n" +
    "🌍 Supports any language pair — learn what you need.\n" +
    "📦 Import and export your dictionary.\n" +
    "⚡️ Free. No registration. Just press Start."
  );
  // Ukrainian
  await bot.api.setMyDescription(
    "Ласкаво просимо до Zubriq!\n" +
    "🧠 Допомагаю ефективно запам'ятовувати слова за допомогою інтервального повторення.\n" +
    "🔔 Як працює: додай слово з перекладом → обери темп → отримуй сповіщення зі словами у Telegram.\n" +
    "🌍 Підтримує будь-яку пару мов — вчи те, що потрібно саме тобі.\n" +
    "📦 Імпортуй та експортуй свій словник.\n" +
    "⚡️ Безкоштовно. Без реєстрації. Просто натисни Start.",
    { language_code: "uk" }
  );
  // Russian
  await bot.api.setMyDescription(
    "Добро пожаловать в Zubriq!\n" +
    "🧠 Помогаю эффективно запоминать слова с помощью интервального повторения.\n" +
    "🔔 Как работает: добавь слово с переводом → выбери темп → получай уведомления со словами в Telegram.\n" +
    "🌍 Поддерживает любую пару языков — учи то, что нужно именно тебе.\n" +
    "📦 Импортируй и экспортируй свой словарь.\n" +
    "⚡️ Бесплатно. Без регистрации. Просто нажми Start.",
    { language_code: "ru" }
  );

  // Short description — shown in the bot's profile / search results
  await bot.api.setMyShortDescription(
    "Telegram bot for learning words with smart notifications. SM-2 spaced repetition. Any language. Free."
  );
  await bot.api.setMyShortDescription(
    "Telegram-бот для вивчення слів через розумні сповіщення. Інтервальне повторення SM-2. Будь-яка мова. Безкоштовно.",
    { language_code: "uk" }
  );
  await bot.api.setMyShortDescription(
    "Telegram-бот для изучения слов через умные уведомления. Интервальное повторение SM-2. Любой язык. Бесплатно.",
    { language_code: "ru" }
  );

  // Error handler
  bot.catch(errorHandler);

  // Session middleware
  bot.use(
    session<SessionData, BotContext>({
      initial: (): SessionData => ({}),
    })
  );

  // Auth middleware — must run before i18n so localeNegotiator can access dbUser
  bot.use(authMiddleware);

  // i18n middleware
  const i18n = createI18n();
  bot.use(i18n);

  // Command handlers
  registerStartHandler(bot);
  registerHelpHandler(bot);
  registerLearnHandlers(bot);
  registerSettingsHandler(bot);
  registerStatsHandler(bot);

  // Callback query router (before words handler which catches text)
  registerCallbackRouter(bot);

  // Words handlers (includes text message handler, must be last)
  registerWordsHandlers(bot);

  return bot;
}
