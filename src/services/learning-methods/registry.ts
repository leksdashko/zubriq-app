import type { LearningMethod } from "./base.js";
import { FlashcardMethod } from "./flashcard.js";

const methods = new Map<string, LearningMethod>();

export function registerMethod(method: LearningMethod): void {
  methods.set(method.id, method);
}

export function getMethod(id: string): LearningMethod | undefined {
  return methods.get(id);
}

export function getAllMethods(): LearningMethod[] {
  return Array.from(methods.values());
}

// Register built-in methods
registerMethod(new FlashcardMethod());
