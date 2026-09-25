import { describe, it, expect } from "vitest";
import { randomHex32, shortHex, isZeroHex } from "./bid";

describe("randomHex32", () => {
  it("returns 64 lowercase hex characters", () => {
    const hex = randomHex32();
    expect(hex).toMatch(/^[0-9a-f]{64}$/);
  });

  it("is not deterministic across calls", () => {
    expect(randomHex32()).not.toEqual(randomHex32());
  });
});

describe("shortHex", () => {
  it("truncates a long hex string with an ellipsis", () => {
    const hex = "a".repeat(64);
    expect(shortHex(hex)).toBe(`${"a".repeat(8)}…${"a".repeat(6)}`);
  });

  it("respects custom lead/tail lengths", () => {
    const hex = "0123456789abcdef";
    expect(shortHex(hex, 4, 4)).toBe("0123…cdef");
  });

  it("returns short input unchanged rather than truncating it", () => {
    expect(shortHex("abcd")).toBe("abcd");
  });
});

describe("isZeroHex", () => {
  it("is true for an all-zero string", () => {
    expect(isZeroHex("0".repeat(64))).toBe(true);
  });

  it("is true for an empty string", () => {
    expect(isZeroHex("")).toBe(true);
  });

  it("is false once any non-zero digit appears", () => {
    expect(isZeroHex(`${"0".repeat(63)}1`)).toBe(false);
  });
});
