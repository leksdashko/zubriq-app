# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Zubriq is a Telegram bot for language learning through smart notifications. Users add words with translations, and the bot sends periodic reminders using spaced repetition (SM-2 algorithm). Named from Ukrainian "зубрити" (to cram/memorize).

## Development Commands

```bash
docker compose up -d              # Start PostgreSQL + Redis
npm run dev                       # Bot with hot reload (tsx watch, reads .env)
npm run build                     # Compile TypeScript
npm run start                     # Run compiled JS (reads .env via --env-file)
npm run db:migrate                # Prisma migrations
npm run db:studio                 # Prisma Studio GUI
npm run test                      # Vitest (run once)
npm run test:watch                # Vitest (watch mode)
npx vitest run tests/services/sm2.test.ts  # Run single test file
npm run lint                      # ESLint
```

**Local dev PostgreSQL** is on port **5433** (not 5432) — see docker-compose.yml.

## Tech Stack

- **Bot framework:** grammY v1.x — **never** use telegraf or node-telegram-bot-api
- **Database:** PostgreSQL 16 via Prisma ORM
- **Queue/Scheduler:** BullMQ + Redis 7
- **i18n:** @grammyjs/i18n with Fluent `.ftl` files (not YAML despite what old docs say)
- **Validation:** Zod (config env parsing)
- **Logging:** pino
- **Testing:** Vitest
- **Module system:** CommonJS (`"type": "commonjs"`), NodeNext module resolution — all local imports use `.js` extension

## Architecture

### Request flow
`src/index.ts` bootstraps: config → Prisma → BullMQ scheduler → bot → restore active sessions → start polling. Graceful shutdown tears down in reverse order on SIGINT/SIGTERM.

### Bot middleware order (matters)
1. Error handler (`bot.catch`)
2. Session (in-memory, grammY built-in)
3. Auth middleware — auto-registers users in DB, attaches `ctx.dbUser`
4. i18n middleware — uses `ctx.dbUser.languageCode` for locale negotiation
5. Command handlers
6. Callback router
7. Words handlers (last — catches text messages for conversational /add flow)

### Key patterns
- **Learning methods use Strategy pattern:** extend `LearningMethod` base class in `src/services/learning-methods/`, register in `registry.ts`. Currently only `FlashcardMethod`.
- **Scheduled notifications:** each active session = one repeatable BullMQ job. Job name: `flashcard:user:{userId}:session:{sessionId}`. Jobs use `bot.api.sendMessage` (not `ctx.reply` — no context in scheduled jobs).
- **Callback data convention:** short prefixes for 64-byte limit — `fc:` (flashcard), `w:` (words), `s:` (settings), `l:` (learn).
- **Conversational flows:** use `ctx.session.step` to track multi-message interactions (e.g., /add word flow).

### i18n
Three locales: `src/i18n/{uk,en,ru}.ftl` (Fluent format). Default locale is `uk`. Translation keys use dashes: `section-key` (e.g., `flashcard-know`, `words-added`). Variables use `{ $name }` syntax.

### Database
Schema in `prisma/schema.prisma`. Convention: camelCase TS fields with `@map("snake_case")` for DB columns. All models use `@@map("plural_table_name")`.

## Important Constraints

- All user-facing strings must come from i18n `.ftl` files — zero hardcoded text
- BullMQ jobs must be idempotent
- Prisma fields: camelCase in code, snake_case in DB via `@map`
- CallbackQuery data has 64-byte limit — keep callback prefixes short
- Handle "bot blocked by user" errors in scheduler gracefully (deactivate session)
- SM-2 quality ratings: "Know" = 5, "Hard" = 2, no response = 0

## Production

Deployed via Docker — see `docker-compose.prod.yml` and `Dockerfile`. Deploy script in README.md pulls, rebuilds bot container, copies landing page.
