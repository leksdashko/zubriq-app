import { loadConfig } from "./config/index.js";
import { logger } from "./utils/logger.js";
import { getPrisma, disconnectPrisma } from "./db/client.js";
import { createBot } from "./bot/index.js";
import {
  initScheduler,
  restoreActiveSessions,
  closeScheduler,
} from "./services/scheduler/index.js";
import { setBotInstance } from "./services/scheduler/jobs.js";

async function main(): Promise<void> {
  // 1. Load and validate config
  const config = loadConfig();
  logger.info({ env: config.NODE_ENV }, "Config loaded");

  // 2. Initialize Prisma
  const prisma = getPrisma();
  await prisma.$connect();
  logger.info("Database connected");

  // 3. Initialize BullMQ scheduler with Redis URL
  initScheduler(config.REDIS_URL);
  logger.info("Scheduler initialized");

  // 4. Create and start bot
  const bot = await createBot(config.BOT_TOKEN);

  // Share bot instance with scheduler jobs
  setBotInstance(bot);

  // 5. Restore active sessions from DB
  await restoreActiveSessions();

  // 6. Start bot polling
  await bot.start({
    onStart: () => {
      logger.info("Bot started polling");
    },
  });

  // 7. Graceful shutdown
  const shutdown = async (signal: string): Promise<void> => {
    logger.info({ signal }, "Shutting down...");

    try {
      // Stop bot polling
      await bot.stop();
      logger.info("Bot stopped");

      // Close BullMQ (worker + queue + their Redis connections)
      await closeScheduler();
      logger.info("Scheduler closed");

      // Disconnect Prisma
      await disconnectPrisma();
      logger.info("Database disconnected");
    } catch (err) {
      logger.error({ err }, "Error during shutdown");
    }

    process.exit(0);
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

main().catch((err) => {
  logger.fatal({ err }, "Failed to start bot");
  process.exit(1);
});
