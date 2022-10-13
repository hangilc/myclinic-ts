import { describe, it, expect } from "vitest"
import { sm } from "@/lib/sm"
import { isShohousen, stripShohousenProlog, isPartStart, cut,
  splitToParts
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

  it("should parse part", () => {
    const s = sm`
    １）カロナール錠３００ｍｇ　３錠
    　　分３　毎食後　５日分
    @_local
    以上、一包化
    @_comment: コメント
    @global
    `
    expect(p.parsePart(s)).toStrictEqual({
      lines: [
        "カロナール錠３００ｍｇ　３錠",
        "分３　毎食後　５日分"
      ],
      trails: ["以上、一包化"],
      localCommands: ["@_local"],
      globalCommands: ["@global"]
    })
  });
  
});