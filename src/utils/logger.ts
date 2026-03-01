import pino from "pino";
import { getConfig } from "../config/index.js";

let _logger: pino.Logger | null = null;

export function getLogger(): pino.Logger {
  if (_logger) return _logger;

  let level: string;
  try {
    level = getConfig().LOG_LEVEL;
  } catch {
    level = "debug";
  }

  _logger = pino({
    level,
    transport:
      process.env.NODE_ENV !== "production"
        ? { target: "pino-pretty", options: { colorize: true } }
        : undefined,
  });

  return _logger;
}

export const logger = getLogger();
