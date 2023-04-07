import { describe, it, expect } from "vitest"

import * as z from "./zenkaku"

describe("zenkaku", () => {
  it("should convert digit", () => {
    expect(z.digitMap['2']).toBe("２");
  });

  it("should convert lower char", () => {
    expect(z.lowerMap['z']).toBe("ｚ");
  });

  it("should convert upper char", () => {
    expect(z.upperMap['Z']).toBe("Ｚ");
  });

  it("should convert custom char", () => {
    expect(z.customMap[',']).toBe("、");
  });

  it("should convert char", () => {
    expect(z.zenkakuMap['2']).toBe("２");
    expect(z.zenkakuMap['z']).toBe("ｚ");
    expect(z.zenkakuMap['Z']).toBe("Ｚ");
    expect(z.zenkakuMap[',']).toBe("、");
  });

  it("shold string to zenkaku", () => {
    expect(z.toZenkaku("abc")).toBe("ａｂｃ");
    expect(z.toZenkaku("me@example.com", ['@'])).toBe("ｍｅ@ｅｘａｍｐｌｅ．ｃｏｍ");
  });

  it("should convert hankaku kana to zenkaku kana", () => {
    expect(z.hankakuKatakanaToZenkakuKatakana("ｱ")).toBe("ア");
    expect(z.hankakuKatakanaToZenkakuKatakana("は")).toBe("は");
    expect(z.zenkakuKatakanaToZenkakuHiragana("ア")).toBe("あ");
    expect(z.convertHankakuKatakanaToZenkakuHiragana("ｱｲｳｴｵ")).toBe("あいうえお");
    expect(z.hankakuKatakanaToZenkakuKatakana("ｼﾞ")).toBe("ジ");
    expect(z.hankakuKatakanaToZenkakuHiragana("ｼﾞ")).toBe("じ");
    expect(z.convertHankakuKatakanaToZenkakuHiragana("ﾌｼﾞﾜﾗ")).toBe("ふじわら");
  });

  it("should convert zenkaku to hankaku", () => {
    expect(z.toHankaku("Ａ－１０４")).toBe("A-104");
  })
});
