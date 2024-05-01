import { describe, it, expect } from "vitest"
import { isUnder6 } from "./futan-wari"

describe("futan-wari", () => {
  it("should determine under 6", () => {
    expect(isUnder6("2000-02-02", "2006-03-31")).toBe(true);
    expect(isUnder6("2000-02-02", "2006-04-01")).toBe(false);
    expect(isUnder6("2000-06-02", "2006-03-31")).toBe(true);
    expect(isUnder6("2000-06-02", "2006-04-01")).toBe(true);
    expect(isUnder6("2000-06-02", "2007-03-31")).toBe(true);
    expect(isUnder6("2000-06-02", "2007-04-01")).toBe(false);
    expect(isUnder6("2000-04-01", "2006-03-31")).toBe(true);
    expect(isUnder6("2000-04-01", "2006-04-01")).toBe(false);
  })
})