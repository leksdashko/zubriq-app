import { Queue, Worker } from "bullmq";
import { getPrisma } from "../../db/client.js";
import { logger } from "../../utils/logger.js";
import { processFlashcardJob } from "./jobs.js";
import { getIntervalMs } from "./frequencies.js";
import type { FlashcardJobData } from "../../types/index.js";

const QUEUE_NAME = "langbot-flashcard";

let queue: Queue | null = null;
let worker: Worker | null = null;

export function getQueue(): Queue {
  if (!queue) throw new Error("Queue not initialized");
  return queue;
}

export function initScheduler(redisUrl: string): {
  queue: Queue;
  worker: Worker;
} {
  const connection = { url: redisUrl };

  queue = new Queue(QUEUE_NAME, {
    connection,
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: "exponential", delay: 5000 },
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 50 },
    },
  });

  worker = new Worker(
    QUEUE_NAME,
    processFlashcardJob,
    { connection, concurrency: 5 }
  );

  worker.on("failed", (job, err) => {
    logger.error(
      { jobId: job?.id, err },
      "Flashcard job failed"
    );
  });

  worker.on("completed", (job) => {
    logger.debug({ jobId: job.id }, "Flashcard job completed");
  });

  return { queue, worker };
}

export async function startSession(
  sessionId: number,
  userId: number,
  telegramId: bigint,
  methodType: string,
  frequency: string
): Promise<void> {
  const q = getQueue();
  const jobName = `flashcard:user:${userId}:session:${sessionId}`;
  const intervalMs = getIntervalMs(frequency);

  const jobData: FlashcardJobData = {
    userId,
    telegramId: Number(telegramId),
    sessionId,
    methodType,
  };

  await q.add(jobName, jobData, {
    repeat: {
      every: intervalMs,
    },
    jobId: jobName,
  });

  logger.info({ sessionId, frequency, intervalMs }, "Session scheduled");
}

export async function stopSession(
  sessionId: number,
  userId: number
): Promise<void> {
  const q = getQueue();
  const jobName = `flashcard:user:${userId}:session:${sessionId}`;

  // Remove repeatable job
  const repeatableJobs = await q.getRepeatableJobs();
  for (const job of repeatableJobs) {
    if (job.name === jobName) {
      await q.removeRepeatableByKey(job.key);
      logger.info({ sessionId, key: job.key }, "Repeatable job removed");
    }
  }
}

export async function restoreActiveSessions(): Promise<void> {
  const prisma = getPrisma();
  const activeSessions = await prisma.learningSession.findMany({
    where: { isActive: true },
    include: { user: true },
  });

  logger.info({ count: activeSessions.length }, "Restoring active sessions");

  for (const session of activeSessions) {
    try {
      await startSession(
        session.id,
        session.userId,
        session.user.telegramId,
        session.methodType,
        session.frequency
      );
    } catch (err) {
      logger.error(
        { err, sessionId: session.id },
        "Failed to restore session"
      );
    }
  }
}

export async function closeScheduler(): Promise<void> {
  if (worker) {
    await worker.close();
    worker = null;
  }
  if (queue) {
    await queue.close();
    queue = null;
  }
}
