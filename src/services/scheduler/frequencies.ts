import { randomBetween } from "../../utils/helpers.js";
import type { FrequencyOption } from "../../types/index.js";

export const FREQUENCIES = {
  "1min": 60_000,
  "5min": 300_000,
  "30min": 1_800_000,
  "random": () => randomBetween(300_000, 3_600_000),
} as const;

export type FrequencyId = keyof typeof FREQUENCIES;

export function getIntervalMs(frequency: string): number {
  const freq = FREQUENCIES[frequency as FrequencyId];
  if (!freq) {
    return 300_000; // Default 5min
  }
  return typeof freq === "function" ? freq() : freq;
}

export function getFrequencyOptions(): FrequencyOption[] {
  return [
    { id: "1min", labelKey: "learn-freq_1min", intervalMs: FREQUENCIES["1min"] },
    { id: "5min", labelKey: "learn-freq_5min", intervalMs: FREQUENCIES["5min"] },
    { id: "30min", labelKey: "learn-freq_30min", intervalMs: FREQUENCIES["30min"] },
    { id: "random", labelKey: "learn-freq_random", intervalMs: FREQUENCIES["random"] },
  ];
}

export function getFrequencyLabel(frequency: string): string {
  const map: Record<string, string> = {
    "1min": "1 min",
    "5min": "5 min",
    "30min": "30 min",
    "random": "random",
  };
  return map[frequency] ?? frequency;
}
