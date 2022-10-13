import { describe, it, expect } from "vitest"

import * as z from "./zenkaku"

describe("zenkaku", () => {
  it("should convert digit", () => {
    expect(z.digitMap.get('2')).toBe("２");
  });

  it("should convert lower char", () => {
    expect(z.lowerMap.get('z')).toBe("ｚ");
  });
});