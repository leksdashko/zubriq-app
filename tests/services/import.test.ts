import { describe, it, expect } from "vitest";
import { parseWordLines } from "../../src/services/dictionary/import.js";

describe("Word Import Parser", () => {
  it("should parse dash-separated words", () => {
    const result = parseWordLines("hello - привіт\nworld - світ");
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ original: "hello", translation: "привіт" });
    expect(result[1]).toEqual({ original: "world", translation: "світ" });
  });

  it("should parse em-dash separated words", () => {
    const result = parseWordLines("hello — привіт");
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ original: "hello", translation: "привіт" });
  });

  it("should parse tab-separated words", () => {
    const result = parseWordLines("cat\tкіт");
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ original: "cat", translation: "кіт" });
  });

  it("should parse pipe-separated words", () => {
    const result = parseWordLines("dog | собака");
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ original: "dog", translation: "собака" });
  });

  it("should skip empty lines", () => {
    const result = parseWordLines("hello - привіт\n\n\nworld - світ");
    expect(result).toHaveLength(2);
  });

  it("should skip comment lines", () => {
    const result = parseWordLines("# This is a comment\nhello - привіт");
    expect(result).toHaveLength(1);
  });

  it("should skip lines without separator", () => {
    const result = parseWordLines("noseparator\nhello - привіт");
    expect(result).toHaveLength(1);
  });

  it("should handle Windows line endings", () => {
    const result = parseWordLines("hello - привіт\r\nworld - світ");
    expect(result).toHaveLength(2);
  });

  it("should return empty array for empty input", () => {
    const result = parseWordLines("");
    expect(result).toHaveLength(0);
  });

  it("should skip words exceeding length limits", () => {
    const longWord = "a".repeat(201);
    const result = parseWordLines(`${longWord} - test\nhello - привіт`);
    expect(result).toHaveLength(1);
    expect(result[0].original).toBe("hello");
  });
});
