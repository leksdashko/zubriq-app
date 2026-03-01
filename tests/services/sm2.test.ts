import { describe, it, expect } from "vitest";
import { calculateSM2 } from "../../src/services/spaced-repetition/sm2.js";

describe("SM-2 Algorithm", () => {
  it("should handle first successful review (quality 5)", () => {
    const result = calculateSM2({
      quality: 5,
      repetitions: 0,
      easeFactor: 2.5,
      interval: 0,
    });

    expect(result.repetitions).toBe(1);
    expect(result.interval).toBe(1);
    expect(result.easeFactor).toBe(2.6);
  });

  it("should set interval to 6 on second successful review", () => {
    const result = calculateSM2({
      quality: 5,
      repetitions: 1,
      easeFactor: 2.6,
      interval: 1,
    });

    expect(result.repetitions).toBe(2);
    expect(result.interval).toBe(6);
    expect(result.easeFactor).toBe(2.7);
  });

  it("should multiply interval by easeFactor on third+ review", () => {
    const result = calculateSM2({
      quality: 4,
      repetitions: 2,
      easeFactor: 2.5,
      interval: 6,
    });

    expect(result.repetitions).toBe(3);
    expect(result.interval).toBe(15); // 6 * 2.5 = 15
    expect(result.easeFactor).toBe(2.5);
  });

  it("should reset repetitions on quality < 3", () => {
    const result = calculateSM2({
      quality: 2,
      repetitions: 5,
      easeFactor: 2.5,
      interval: 30,
    });

    expect(result.repetitions).toBe(0);
    expect(result.interval).toBe(0);
  });

  it("should reset on quality 0 (no response)", () => {
    const result = calculateSM2({
      quality: 0,
      repetitions: 3,
      easeFactor: 2.5,
      interval: 15,
    });

    expect(result.repetitions).toBe(0);
    expect(result.interval).toBe(0);
    // EF: 2.5 + (0.1 - 5*(0.08 + 5*0.02)) = 2.5 + (0.1 - 0.9) = 1.7
    expect(result.easeFactor).toBe(1.7);
  });

  it("should not let easeFactor drop below 1.3", () => {
    const result = calculateSM2({
      quality: 0,
      repetitions: 3,
      easeFactor: 1.3,
      interval: 1,
    });

    expect(result.easeFactor).toBe(1.3);
  });

  it("should increase easeFactor for quality 5", () => {
    const result = calculateSM2({
      quality: 5,
      repetitions: 3,
      easeFactor: 2.5,
      interval: 15,
    });

    // EF: 2.5 + (0.1 - 0*(0.08 + 0*0.02)) = 2.5 + 0.1 = 2.6
    expect(result.easeFactor).toBe(2.6);
    expect(result.repetitions).toBe(4);
    expect(result.interval).toBe(39); // 15 * 2.6 = 39
  });

  it("should handle quality 3 (correct with difficulty)", () => {
    const result = calculateSM2({
      quality: 3,
      repetitions: 0,
      easeFactor: 2.5,
      interval: 0,
    });

    expect(result.repetitions).toBe(1);
    expect(result.interval).toBe(1);
    // EF: 2.5 + (0.1 - 2*(0.08 + 2*0.02)) = 2.5 + (0.1 - 0.24) = 2.36
    expect(result.easeFactor).toBe(2.36);
  });

  it("should throw for invalid quality", () => {
    expect(() =>
      calculateSM2({
        quality: -1,
        repetitions: 0,
        easeFactor: 2.5,
        interval: 0,
      })
    ).toThrow("Invalid quality rating");

    expect(() =>
      calculateSM2({
        quality: 6,
        repetitions: 0,
        easeFactor: 2.5,
        interval: 0,
      })
    ).toThrow("Invalid quality rating");
  });

  it("should set nextReviewAt in the future for successful review", () => {
    const before = new Date();
    const result = calculateSM2({
      quality: 5,
      repetitions: 0,
      easeFactor: 2.5,
      interval: 0,
    });
    const after = new Date();

    expect(result.nextReviewAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    // 1 day in the future
    const oneDayMs = 24 * 60 * 60 * 1000;
    expect(result.nextReviewAt.getTime() - before.getTime()).toBeGreaterThanOrEqual(
      oneDayMs - 1000
    );
  });

  it("should set nextReviewAt to now for failed review", () => {
    const before = new Date();
    const result = calculateSM2({
      quality: 1,
      repetitions: 3,
      easeFactor: 2.5,
      interval: 15,
    });

    // interval is 0, so nextReviewAt should be approximately now
    expect(result.nextReviewAt.getTime() - before.getTime()).toBeLessThan(1000);
  });
});
