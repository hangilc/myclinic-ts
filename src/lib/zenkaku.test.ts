import { describe, it, expect } from "vitest"

import * as z from "./zenkaku"

describe("zenkaku", () => {
  it("should convert digit", () => {
    expect(z.digitMap.get('2')).toBe("２");
  });

  it("should convert lower char", () => {
    expect(z.lowerMap.get('z')).toBe("ｚ");
  });

  it("should convert upper char", () => {
    expect(z.upperMap.get('Z')).toBe("Ｚ");
  });

  it("should convert custom char", () => {
    expect(z.customMap.get(',')).toBe("、");
  });

  it("should convert char", () => {
    expect(z.zenkakuMap.get('2')).toBe("２");
    expect(z.zenkakuMap.get('z')).toBe("ｚ");
    expect(z.zenkakuMap.get('Z')).toBe("Ｚ");
    expect(z.zenkakuMap.get(',')).toBe("、");
  });

  it("shold string to zenkaku", () => {
    expect(z.toZenkaku("abc")).toBe("ａｂｃ");
    expect(z.toZenkaku("me@example.com", ['@'])).toBe("ｍｅ@ｅｘａｍｐｌｅ．ｃｏｍ");
  });
});
