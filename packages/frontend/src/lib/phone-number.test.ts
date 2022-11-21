import { describe, it, expect } from "vitest";
import { replacePhoneNumber } from "./phone-number";

describe("replace phone number pattern", () => {
  it("should replace single simple phone number", () => {
    expect(replacePhoneNumber("+81312345678", (s) => `*${s}!`)).toBe(
      "*+81312345678!"
    );
  });

  it("should replace multiple simple phone numbers", () => {
    expect(replacePhoneNumber("+81312345678, +81312345601", s => `(${s})`)).toBe(
      "(+81312345678), (+81312345601)"
    )
  });

  it("should replace domestic phone number", () => {
    const src = "03-1234-5678";
    const exp = "+81312345678";
    expect(replacePhoneNumber(src, s => s)).toBe(exp);
  });

  it("should replace local phone number", () => {
    const src = "1234-5678";
    const exp = "+81312345678";
    expect(replacePhoneNumber(src, s => s)).toBe(exp);
  });
});
