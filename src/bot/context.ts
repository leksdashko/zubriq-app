import type { Context, SessionFlavor } from "grammy";
import type { I18nFlavor } from "@grammyjs/i18n";

export interface SessionData {
  step?: string;
  addingWord?: {
    original?: string;
    translation?: string;
  };
  pendingMethod?: string;
  pendingFrequency?: string;
}

export type BotContext = Context & SessionFlavor<SessionData> & I18nFlavor;
