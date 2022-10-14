import { describe, it, expect } from "vitest"
import { sm } from "@/lib/sm"
import { isShohousen, stripShohousenProlog, isPartStart, cut,
  splitToParts, exportForTesting as priv
} from "./parse-shohousen"
import * as p from "./parse-shohousen"

describe("parse-shohousen", () => {
  it("should detect shohousen", () => {
    const s = sm`
    院外処方
    Ｒｐ）
    １）カロナール錠３００ｍｇ　３錠
    　　分３　毎食後　５日分
    `
    expect(isShohousen(s)).toBe(true);
  });

  it("should detect non-shohousen", () => {
    const s = sm`
    頭痛がする。
    `
    expect(isShohousen(s)).toBe(false);
  });

  it("should remove shohousen prolog", () => {
    const s = sm`
    院外処方
    Ｒｐ）
    １）カロナール錠３００ｍｇ　３錠
    　　分３　毎食後　５日分
    `
    const t = sm`
    １）カロナール錠３００ｍｇ　３錠
    　　分３　毎食後　５日分
    `
    expect(stripShohousenProlog(s)).toBe(t)
  });

  it("should detect item start", () => {
    const s = sm`
    １）カロナール錠３００ｍｇ　３錠
    　　分３　毎食後　５日分
    `
    expect(isPartStart(s)).toBe(true);
    const t = sm`
    　１）カロナール錠３００ｍｇ　３錠
    　　分３　毎食後　５日分
    `
  });
  
  it("should detect non item start", () => {
    const s = sm`
    １　カロナール錠３００ｍｇ　３錠
    　　分３　毎食後　５日分
    `
    expect(isPartStart(s)).toBe(false);
  });

  it("should cut by regexps", () => {
    const s = "prologApart1Apart2";
    expect(cut(s, /A/)).toStrictEqual(["prolog", ["Apart1", "Apart2"]]);
    const t = sm`
    院外処方
    Ｒｐ）
    １）カロナール錠３００ｍｇ　３錠
    　　分３　毎食後　５日分
    　２）フロモックス錠３００ｍｇ　３錠
    　　分３　毎食後　５日分
    `
    expect(splitToParts(t)).toStrictEqual(
      [
        "院外処方\nＲｐ）\n",
        [sm`
        １）カロナール錠３００ｍｇ　３錠
        　　分３　毎食後　５日分
        `, sm`
        |
        　２）フロモックス錠３００ｍｇ　３錠
        　　分３　毎食後　５日分
        `.substring(2)]
      ]
    )
  });

  it("should parse part template", () => {
    const s = sm`
    １）カロナール錠３００ｍｇ　３錠
    　　分３　毎食後　５日分
    @_local
    以上、一包化
    @_comment: コメント
    @global
    `
    expect(p.parsePartTemplate(s)).toStrictEqual({
      lines: [
        "カロナール錠３００ｍｇ　３錠",
        "分３　毎食後　５日分"
      ],
      trails: ["以上、一包化"],
      localCommands: ["@_local"],
      globalCommands: ["@global"]
    })
  });

  it("should match drug part", () => {
    let m = priv.reDrugPattern.exec("カロナール錠３００ｍｇ　３錠");
    expect(m).not.toBeNull();
    expect(m[1]).toBe("カロナール錠３００ｍｇ");
    expect(m[2]).toBe("３錠");
    m = priv.reDrugPattern.exec("カロナール錠３００ｍｇ　１回０．５錠　");
    expect(m).not.toBeNull();
    expect(m[1]).toBe("カロナール錠３００ｍｇ");
    expect(m[2]).toBe("１回０．５錠");
  });

  it("should parse drug part", () => {
    const [drugPart, rem] = p.parseDrugPart("カロナール錠３００ｍｇ　３錠");
    expect(drugPart).toStrictEqual({ name: "カロナール錠３００ｍｇ", amount: "３錠" });
    expect(rem).toBe("");
  })
  
});