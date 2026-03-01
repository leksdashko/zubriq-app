# CLAUDE.md — Zubriq: Telegram Language Learning Bot

## Project Overview

Zubriq is a Telegram bot for language learning through smart notifications.
The name comes from Ukrainian "зубрити" (to cram/memorize) + "q" for a modern tech feel.
Users add words/phrases with translations, and the bot sends periodic reminders
with spaced repetition (SM-2 algorithm). The architecture supports multiple
learning methods and languages.

Current scope: Ukrainian ↔ English interface, any language pair for words.
First learning method: Flashcard Push Notifications.

## Tech Stack

- **Runtime:** Node.js 20+ with TypeScript (strict mode)
- **Bot Framework:** grammY v1.x (NOT telegraf, NOT node-telegram-bot-api)
- **Database:** PostgreSQL 16 via Prisma ORM
- **Queue/Scheduler:** BullMQ + Redis 7
- **i18n:** @grammyjs/i18n
- **Validation:** Zod
- **Logging:** pino
- **Testing:** Vitest
- **Containerization:** Docker Compose (postgres + redis for dev)

## Project Structure

```
zubriq/
├── CLAUDE.md
├── docker-compose.yml          # PostgreSQL + Redis for development
├── package.json
├── tsconfig.json
├── prisma/
│   └── schema.prisma
├── src/
│   ├── index.ts                # Entry point: bootstrap bot + workers
│   ├── config/
│   │   └── index.ts            # Zod-validated env config
│   ├── bot/
│   │   ├── index.ts            # Bot instance creation & middleware setup
│   │   ├── context.ts          # Custom context type definition
│   │   ├── handlers/
│   │   │   ├── start.ts        # /start — onboarding, language selection
│   │   │   ├── help.ts         # /help — command reference
│   │   │   ├── words.ts        # /add, /words, /import, /export — word CRUD
│   │   │   ├── learn.ts        # /learn — method selection, start/stop
│   │   │   ├── settings.ts     # /settings — language, timezone
│   │   │   └── stats.ts        # /stats — learning progress
│   │   ├── keyboards/
│   │   │   └── index.ts        # Reusable InlineKeyboard builders
│   │   ├── middlewares/
│   │   │   ├── i18n.ts         # Language middleware setup
│   │   │   ├── auth.ts         # User auto-registration middleware
│   │   │   └── error.ts        # Global error handler
│   │   └── callbacks/
│   │       ├── router.ts       # CallbackQuery router
│   │       ├── flashcard.ts    # Flashcard-specific callbacks
│   │       └── words.ts        # Word management callbacks
│   ├── services/
│   │   ├── learning-methods/
│   │   │   ├── base.ts         # Abstract LearningMethod class
│   │   │   ├── flashcard.ts    # Flashcard push notification method
│   │   │   └── registry.ts     # Method registry (Strategy pattern)
│   │   ├── scheduler/
│   │   │   ├── index.ts        # BullMQ queue & worker setup
│   │   │   ├── jobs.ts         # Job definitions & processors
│   │   │   └── frequencies.ts  # Frequency enum & interval calculations
│   │   ├── spaced-repetition/
│   │   │   └── sm2.ts          # SM-2 algorithm implementation
│   │   ├── dictionary/
│   │   │   ├── index.ts        # Word service (CRUD)
│   │   │   └── import.ts       # CSV/text file import parser
│   │   └── user/
│   │       └── index.ts        # User service
│   ├── db/
│   │   └── client.ts           # Prisma client singleton
│   ├── i18n/
│   │   ├── uk.yaml             # Ukrainian translations
│   │   └── en.yaml             # English translations
│   ├── utils/
│   │   ├── logger.ts           # Pino logger instance
│   │   └── helpers.ts          # Shared utility functions
│   └── types/
│       └── index.ts            # Shared type definitions
└── tests/
    ├── services/
    │   └── sm2.test.ts
    └── ...
```

## Database Schema (Prisma)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id              Int       @id @default(autoincrement())
  telegramId      BigInt    @unique @map("telegram_id")
  firstName       String?   @map("first_name")
  languageCode    String    @default("uk") @map("language_code")    // Interface lang
  targetLanguage  String    @default("en") @map("target_language")  // Learning lang
  timezone        String    @default("Europe/Kyiv")
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  words           Word[]
  sessions        LearningSession[]

  @@map("users")
}

model Word {
  id          Int       @id @default(autoincrement())
  userId      Int       @map("user_id")
  original    String                        // Word in target language
  translation String                        // Translation in user's language
  context     String?                       // Example sentence (optional)
  tags        String[]  @default([])        // Categories/tags
  createdAt   DateTime  @default(now()) @map("created_at")

  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  progress    WordProgress[]

  @@index([userId])
  @@map("words")
}

model WordProgress {
  id            Int       @id @default(autoincrement())
  wordId        Int       @map("word_id")
  methodType    String    @map("method_type")     // e.g. "flashcard"
  easeFactor    Float     @default(2.5) @map("ease_factor")  // SM-2
  interval      Int       @default(0)             // Days until next review
  repetitions   Int       @default(0)             // Successful reps in a row
  nextReviewAt  DateTime  @default(now()) @map("next_review_at")
  isLearned     Boolean   @default(false) @map("is_learned")
  lastReviewAt  DateTime? @map("last_review_at")

  word          Word      @relation(fields: [wordId], references: [id], onDelete: Cascade)

  @@unique([wordId, methodType])
  @@index([nextReviewAt])
  @@map("word_progress")
}

model LearningSession {
  id          Int       @id @default(autoincrement())
  userId      Int       @map("user_id")
  methodType  String    @map("method_type")       // "flashcard"
  frequency   String                               // "1min"|"5min"|"30min"|"random"
  isActive    Boolean   @default(false) @map("is_active")
  startedAt   DateTime? @map("started_at")
  stoppedAt   DateTime? @map("stopped_at")
  createdAt   DateTime  @default(now()) @map("created_at")

  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, isActive])
  @@map("learning_sessions")
}
```

## Key Implementation Details

### 1. Custom Context (grammY)

```typescript
import { Context, SessionFlavor } from "grammy";
import { I18nFlavor } from "@grammyjs/i18n";

interface SessionData {
  step?: string;              // Current conversation step
  addingWord?: {              // Temp state for /add flow
    original?: string;
    translation?: string;
  };
}

type BotContext = Context & SessionFlavor<SessionData> & I18nFlavor;
```

### 2. Learning Method — Strategy Pattern

```typescript
// src/services/learning-methods/base.ts
export abstract class LearningMethod {
  abstract readonly id: string;
  abstract readonly nameKey: string;        // i18n key
  abstract readonly descriptionKey: string; // i18n key

  abstract getFrequencyOptions(): FrequencyOption[];
  abstract selectWord(userId: number): Promise<Word | null>;
  abstract formatMessage(word: Word, locale: string): MessagePayload;
  abstract handleResponse(wordId: number, quality: number): Promise<void>;
}

// MessagePayload structure:
interface MessagePayload {
  text: string;                    // Visible in push notification (word only!)
  replyMarkup: InlineKeyboard;    // "Show translation" + "I know this ✅"
  parseMode?: ParseMode;
}
```

### 3. Flashcard Method — Push Notification Flow

The notification message MUST show ONLY the word (no translation):
```
📝 "ephemeral"

[Показати переклад 👀]  [Знаю ✅]  [Складно 🔄]
```

When user taps "Показати переклад" → edit message to:
```
📝 "ephemeral"
💡 ефемерний, тимчасовий

[Знаю ✅]  [Складно 🔄]  [Видалити 🗑]
```

Quality ratings for SM-2:
- "Знаю ✅" = quality 5 (perfect response)
- "Складно 🔄" = quality 2 (incorrect, remembered after seeing)
- No response = quality 0 (on next review)

### 4. SM-2 Algorithm

```typescript
// src/services/spaced-repetition/sm2.ts
interface SM2Result {
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewAt: Date;
}

function calculateSM2(
  quality: number,        // 0-5
  repetitions: number,
  easeFactor: number,
  interval: number
): SM2Result {
  // quality < 3 = reset repetitions
  // quality >= 3 = increase interval
  // easeFactor adjusts based on quality
  // Minimum easeFactor = 1.3
}
```

### 5. Scheduler (BullMQ)

Each active learning session = one repeatable BullMQ job.

```typescript
// Job data structure
interface FlashcardJobData {
  userId: number;
  telegramId: number;
  sessionId: number;
  methodType: string;
}

// Frequency to interval mapping
const FREQUENCY_MAP = {
  "1min": { every: 60_000 },
  "5min": { every: 300_000 },
  "30min": { every: 1_800_000 },
  "random": () => ({ every: randomBetween(300_000, 3_600_000) }),
};
```

Job naming convention: `flashcard:user:{userId}:session:{sessionId}`

When session stops → remove the repeatable job by key.
When bot restarts → restore all active sessions from DB.

### 6. i18n Structure

```yaml
# src/i18n/uk.yaml
start:
  welcome: "👋 Вітаю, {name}! Я допоможу тобі вивчати нові слова."
  choose_language: "Обери мову інтерфейсу:"
  choose_target: "Яку мову ти вивчаєш?"

words:
  add_prompt: "Напиши слово іноземною мовою:"
  add_translation: "Тепер напиши переклад:"
  add_context: "Додай приклад речення (або натисни /skip):"
  added: "✅ Слово «{word}» додано!"
  empty: "У тебе поки немає слів. Додай перше через /add"
  list_header: "📚 Твій словник ({count} слів):"
  deleted: "🗑 Слово видалено"
  import_prompt: "Надішли текстовий файл. Формат: одне слово — один рядок, слово та переклад через тире або табуляцію."
  import_success: "✅ Імпортовано {count} слів!"

learn:
  choose_method: "Обери метод вивчення:"
  flashcard_name: "📬 Пуш-картки"
  flashcard_desc: "Отримуй сповіщення зі словами через встановлені інтервали"
  choose_frequency: "Як часто надсилати слова?"
  freq_1min: "Щохвилини (тест)"
  freq_5min: "Кожні 5 хвилин"
  freq_30min: "Кожні 30 хвилин"
  freq_random: "Рандомно (5-60 хв)"
  started: "🚀 Вивчення запущено! Очікуй перше слово..."
  stopped: "⏸ Вивчення зупинено."
  no_words: "Спочатку додай слова через /add"

flashcard:
  show_translation: "Показати переклад 👀"
  know: "Знаю ✅"
  hard: "Складно 🔄"
  delete_word: "Видалити 🗑"

settings:
  title: "⚙️ Налаштування"
  interface_lang: "Мова інтерфейсу: {lang}"
  target_lang: "Мова вивчення: {lang}"
  timezone: "Часовий пояс: {tz}"

stats:
  title: "📊 Твоя статистика"
  total_words: "Всього слів: {count}"
  learned: "Вивчено: {count}"
  in_progress: "В процесі: {count}"
  streak: "Серія днів: {days}"

errors:
  generic: "😔 Щось пішло не так. Спробуй ще раз."
  no_active_session: "У тебе немає активної сесії. Натисни /learn"
```

### 7. Callback Data Convention

Use prefixed callback data for routing:
```
fc:show:{wordId}        — Show translation
fc:know:{wordId}        — Mark as known (quality 5)
fc:hard:{wordId}        — Mark as hard (quality 2)
fc:delete:{wordId}      — Delete word
w:page:{pageNum}        — Word list pagination
w:delete:{wordId}       — Delete word from list
s:lang:{code}           — Set interface language
s:target:{code}         — Set target language
l:method:{methodId}     — Select learning method
l:freq:{frequency}      — Select frequency
l:start                 — Start session
l:stop                  — Stop session
```

### 8. Error Handling

- All handlers wrapped in try-catch
- Errors logged with pino (include telegramId, handler name)
- User sees friendly error message from i18n
- Bot API errors (blocked by user, chat not found) handled gracefully
- Scheduler: failed jobs retried 3 times with exponential backoff

### 9. Word Import Format

Support these formats in text files:
```
hello - привіт
world — світ
cat	кіт
dog | собака
```
Parser should handle: dash, em-dash, tab, pipe as separators.
Skip empty lines and lines starting with # (comments).

### 10. Graceful Shutdown

```typescript
// On SIGINT/SIGTERM:
// 1. Stop accepting new bot updates
// 2. Wait for current handlers to finish
// 3. Close BullMQ workers (wait for active jobs)
// 4. Close BullMQ queue
// 5. Disconnect Redis
// 6. Disconnect Prisma
// 7. Exit
```

## Commands Summary

| Command   | Description                          |
|-----------|--------------------------------------|
| /start    | Onboarding: language selection       |
| /add      | Add new word (conversational flow)   |
| /words    | View word list (paginated, 10/page)  |
| /learn    | Choose method → frequency → start    |
| /settings | Change language, timezone             |
| /stats    | View learning statistics             |
| /help     | List all commands with descriptions  |
| /import   | Import words from text file          |
| /export   | Export words as text file            |
| /stop     | Quick stop active learning session   |

## Development Commands

```bash
docker compose up -d          # Start PostgreSQL + Redis
npm run dev                   # Start bot with hot reload (tsx watch)
npm run build                 # Compile TypeScript
npm run start                 # Run compiled JS (production)
npm run db:migrate            # Run Prisma migrations
npm run db:studio             # Open Prisma Studio (DB GUI)
npm run test                  # Run tests
npm run lint                  # ESLint
```

## Environment Variables

```
BOT_TOKEN=               # Telegram Bot API token (required)
DATABASE_URL=             # PostgreSQL connection string (required) e.g. postgresql://zubriq:zubriq_secret@localhost:5432/zubriq
REDIS_URL=                # Redis connection string (required)
NODE_ENV=development      # development | production
LOG_LEVEL=debug           # debug | info | warn | error
```

## Design Principles

1. **Extensibility first:** New learning method = new class extending LearningMethod + register in registry. No other code changes needed.
2. **i18n everywhere:** Zero hardcoded user-facing strings. All text from YAML locale files.
3. **Type safety:** Strict TypeScript, Zod for runtime validation, Prisma for DB types.
4. **Reliability:** BullMQ persists jobs in Redis. Bot restart = all sessions restored automatically.
5. **User experience:** Minimal clicks, conversational flows, inline keyboards.

## Future Methods (Architecture-Ready)

- **QuizMethod:** Send word + 4 translation options (3 wrong from user's other words)
- **ReverseFlashcard:** Send translation, user recalls original word
- **ListeningMethod:** Send voice message via TTS API
- **ContextGuessMethod:** Send sentence with blank, user guesses word
- **DailyChallengeMethod:** Mix of methods, streak tracking

## Important Notes for Claude Code

- Always use grammY, never telegraf or node-telegram-bot-api
- Use `bot.api.sendMessage` for notifications (not ctx.reply — there's no ctx in scheduled jobs)
- BullMQ jobs must be idempotent (same job running twice = safe)
- Test SM-2 algorithm with unit tests (edge cases: quality 0, first review, etc.)
- Prisma: always use `@map` for snake_case DB columns with camelCase TS fields
- CallbackQuery data has 64 byte limit — keep prefixes short
- For "random" frequency: after each job completes, schedule next with random delay
- Handle "bot blocked by user" error in scheduler gracefully (deactivate session)
