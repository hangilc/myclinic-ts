import { describe, it, expect } from "vitest"
import { pad } from "./pad"

describe("pad", () => {
  it("should pad string", () => {
    expect(pad(12, 3)).toBe("012")
  });
});
