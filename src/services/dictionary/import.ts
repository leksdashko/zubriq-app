import type { ParsedWordLine } from "../../types/index.js";

const SEPARATOR_REGEX = /\s*(?:\t|—|–|-|\|)\s*/;

export function parseWordLines(content: string): ParsedWordLine[] {
  const lines = content.split(/\r?\n/);
  const result: ParsedWordLine[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();

    // Skip empty lines and comments
    if (!line || line.startsWith("#")) continue;

    const parts = line.split(SEPARATOR_REGEX);
    if (parts.length < 2) continue;

    const original = parts[0].trim();
    const translation = parts.slice(1).join(", ").trim();

    if (!original || !translation) continue;
    if (original.length > 200 || translation.length > 500) continue;

    result.push({ original, translation });
  }

  return result;
}
