import { describe, it, expect } from "vitest";
import { sm } from "@/lib/sm";
import {
  isShohousen,
  stripShohousenProlog,
  isPartStart,
  cut,
  splitToParts,
  exportForTesting as priv,
  parseShohousen,
  DrugPart,
  Part,
  // setDebug,
} from "./parse-shohousen";
import * as p from "./parse-shohousen";

describe("parse-shohousen", () => {
  it("should detect shohousen", () => {
    const s = sm`
    院外処方
    Ｒｐ）
    １）カロナール錠３００ｍｇ　３錠
    　　分３　毎食後　５日分
    `;
    expect(isShohousen(s)).toBe(true);
  });

  it("should detect non-shohousen", () => {
    const s = sm`
    頭痛がする。
    `;
    expect(isShohousen(s)).toBe(false);
  });

  it("should remove shohousen prolog", () => {
    const s = sm`
    院外処方
    Ｒｐ）
    １）カロナール錠３００ｍｇ　３錠
    　　分３　毎食後　５日分
    `;
    const t = sm`
    １）カロナール錠３００ｍｇ　３錠
    　　分３　毎食後　５日分
    `;
    expect(stripShohousenProlog(s)).toBe(t);
  });

  it("should detect item start", () => {
    const s = sm`
    １）カロナール錠３００ｍｇ　３錠
    　　分３　毎食後　５日分
    `;
    expect(isPartStart(s)).toBe(true);
  });

  it("should detect non item start", () => {
    const s = sm`
    １　カロナール錠３００ｍｇ　３錠
    　　分３　毎食後　５日分
    `;
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
    `;
    expect(splitToParts(t)).toStrictEqual([
      "院外処方\nＲｐ）\n",
      [
        sm`
        １）カロナール錠３００ｍｇ　３錠
        　　分３　毎食後　５日分
        `,
        sm`
        |
        　２）フロモックス錠３００ｍｇ　３錠
        　　分３　毎食後　５日分
        `.substring(2),
      ],
    ]);
  });

  it("should parse part template", () => {
    const s = sm`
    １）カロナール錠３００ｍｇ　３錠
    　　分３　毎食後　５日分
    @_local
    以上、一包化
    @_comment: コメント
    @global
    `;
    expect(p.parsePartTemplate(s)).toStrictEqual({
      lines: ["カロナール錠３００ｍｇ　３錠", "分３　毎食後　５日分"].join(
        "\n"
      ),
      trails: ["以上、一包化"],
      localCommands: ["@_local"],
      globalCommands: ["@global"],
    });
  });

  it("should match drug part", () => {
    let m = priv.reDrugPattern.exec("カロナール錠３００ｍｇ　３錠");
    expect(m).not.toBeNull();
    if (m != null) {
      expect(m[1]).toBe("カロナール錠３００ｍｇ");
      expect(m[2]).toBe("３錠");
    }
    m = priv.reDrugPattern.exec("カロナール錠３００ｍｇ　１回０．５錠　");
    expect(m).not.toBeNull();
    if (m != null) {
      expect(m[1]).toBe("カロナール錠３００ｍｇ");
      expect(m[2]).toBe("１回０．５錠");
    }
  });

  it("should parse drug part", () => {
    let [drugPart, rem] = p.parseDrugPart("カロナール錠３００ｍｇ　３錠");
    expect(drugPart).toStrictEqual(
      new DrugPart("カロナール錠３００ｍｇ", "３錠")
    );
    expect(rem).toBe("");

    [drugPart, rem] = p.parseDrugPart(
      "カロナール錠３００ｍｇ　３錠\n分３　毎食後　５日分"
    );
    expect(drugPart).toStrictEqual(
      new DrugPart("カロナール錠３００ｍｇ", "３錠")
    );
    expect(rem).toBe("分３　毎食後　５日分");
  });

  it("should parse usage pattern", () => {
    let m = priv.reUsagePattern.exec("分３　毎食後　７日分");
    expect(m).not.toBeNull();
    if (m != null) {
      expect(m[1]).toBe("分３　毎食後");
      expect(m[2]).toBe("７日分");
    }
  });

  it("should parse drug lines", () => {
    let s = sm`
    カロナール錠３００ｍｇ　３錠
    分３　毎食後　５日分
    `;
    let part = p.parseDrugLines(s);
    expect(part).toStrictEqual({
      drugs: [new DrugPart("カロナール錠３００ｍｇ", "３錠")],
      usage: new p.UsagePart("分３　毎食後", "５日分"),
      more: "",
    });
  });

  it("should parse multiple drug lines", () => {
    let s = sm`
    カロナール錠３００ｍｇ　３錠
    フロモックス錠１００ｍｇ　３錠
    分３　毎食後　５日分
    `;
    let part = p.parseDrugLines(s);
    expect(part).toStrictEqual({
      drugs: [
        new DrugPart("カロナール錠３００ｍｇ", "３錠"),
        new DrugPart("フロモックス錠１００ｍｇ", "３錠"),
      ],
      usage: new p.UsagePart("分３　毎食後", "５日分"),
      more: "",
    });
  });

  it("should parse drug lines with more", () => {
    let s = sm`
    カロナール錠３００ｍｇ　３錠
    フロモックス錠１００ｍｇ　３錠
    分３　毎食後　５日分
    （後発品に変更不可）`;
    let part = p.parseDrugLines(s);
    expect(part).toStrictEqual({
      drugs: [
        new DrugPart("カロナール錠３００ｍｇ", "３錠"),
        new DrugPart("フロモックス錠１００ｍｇ", "３錠"),
      ],
      usage: new p.UsagePart("分３　毎食後", "５日分"),
      more: "（後発品に変更不可）",
    });
  });

  it("should parse shohousen", () => {
    let s = sm`
    院外処方
    Ｒｐ）
    １）カロナール錠３００ｍｇ　３錠
    　　分３　毎食後　５日分
    `;
    let parsed: p.Shohousen = parseShohousen(s);
    expect(parsed).toStrictEqual(
      new p.Shohousen(
        "院外処方\nＲｐ）\n",
        [
          new Part(
            [new DrugPart("カロナール錠３００ｍｇ", "３錠")],
            new p.UsagePart("分３　毎食後", "５日分"),
            "",
            [],
            []
          ),
        ],
        []
      )
    );
  });

  it("should parse ロキソニンテープ", () => {
    let s = sm`
    院外処方
    Ｒｐ）
    １）レンドルミンＤ錠０．２５ｍｇ　　　　　１錠
    　　分１　就寝前　　　　　　　　　　　　　３０日分
    ２）ロキソニンテープ１００ｍｇ（１０ｃｍｘ１５ｃｍ） 
    　　６３枚
    　　１日１回、１回１枚、膝に貼付
    `;
    let parsed: p.Shohousen = parseShohousen(s);
    expect(parsed.formatForSave()).toBe(
      `院外処方
Ｒｐ）
１）レンドルミンＤ錠０．２５ｍｇ　１錠
　　分１　就寝前　３０日分
２）ロキソニンテープ１００ｍｇ（１０ｃｍｘ１５ｃｍ）　　
　　６３枚
　　１日１回、１回１枚、膝に貼付`);
  });

  it("should parse 9 drugs", () => {
    let s = sm`
    院外処方
    Ｒｐ）
    １）アムロジピン（２．５）　１錠
    　　分１　朝食後　６０日分
    ２）カンデサルタン（８）　１錠
    　　イリボー（５）　２錠
    　　分１　朝食後　６０日分
    ３）アロプリノール（１００）　２錠
    　　分２　朝夕食後　６０日分
    ４）アテノロール（２５）　１錠
    　　分１　朝食後　６０日分
    ５）ニフェジピンＣＲ（１０）　１錠
    　　分１　寝る前　６０日分
    ６）オメプラゾール（２０）　１錠
    　　分１　朝食後　１４日分
    ７）チアトン（５）　２カプセル
    　　分２　朝夕食後　１４日分
    　　（後発品に変更不可）
    ８）アドエア２５０ディスカス２８吸入用　２８ブリスター
    　　１キット
    　　１回１吸入、１日２回（朝、夕）
    ９）モーラステープ２％（７ｘ１０ｃｍ）　６３枚
    　　１日１回、１回２枚、背部に貼付
    @memo:高７
    @memo:イリボーを増量しました。`;
    let parsed: p.Shohousen = parseShohousen(s);
    let out = parsed.formatForSave();
    expect(out).toBe(sm`
    院外処方
    Ｒｐ）
    １）アムロジピン（２．５）　１錠
    　　分１　朝食後　６０日分
    ２）カンデサルタン（８）　１錠
    　　イリボー（５）　２錠
    　　分１　朝食後　６０日分
    ３）アロプリノール（１００）　２錠
    　　分２　朝夕食後　６０日分
    ４）アテノロール（２５）　１錠
    　　分１　朝食後　６０日分
    ５）ニフェジピンＣＲ（１０）　１錠
    　　分１　寝る前　６０日分
    ６）オメプラゾール（２０）　１錠
    　　分１　朝食後　１４日分
    ７）チアトン（５）　２カプセル
    　　分２　朝夕食後　１４日分
    　　（後発品に変更不可）
    ８）アドエア２５０ディスカス２８吸入用　２８ブリスター
    　　１キット
    　　１回１吸入、１日２回（朝、夕）
    ９）モーラステープ２％（７ｘ１０ｃｍ）　６３枚
    　　１日１回、１回２枚、背部に貼付
    @memo:高７
    @memo:イリボーを増量しました。`);
  });
});
