import { describe, expect, it } from "vitest";
import { daysUsage, drugGroup, drugIndex, drugLines, drugNameAndAmount, eol, otherUsage, prolog, shohou, shohouCommentLine, timesUsage, usageLine } from "./parse-shohou"

describe("parse-shohou", () => {
  it("should parse eol", () => {
    let r = eol().apply("\n", 0);
    expect(r).toEqual({
      value: "\n",
      j: 1
    });

    r = eol().apply("", 0);
    expect(r).toEqual({
      value: "",
      j: 0
    })
  })

  it("should parse prolog", () => {
    const src = "院外処方\nＲｐ）\n";
    const r = prolog().apply(src, 0);
    expect(r).not.toBeUndefined();
    expect(r?.value).toBeUndefined();
    expect(r?.j).toBe(src.length);
  })

  it("should parse drugIndex", () => {
    const src = "１）";
    const r = drugIndex().apply(src, 0);
    expect(r).not.toBeUndefined();
    expect(r?.value).toBeUndefined();
    expect(r?.j).toBe(src.length);
  })

  it("should parse drug name and amount", () => {
    const src = "カロナール錠５００　５００ｍｇ　３錠";
    const r = drugNameAndAmount().apply(src + "　　", 0);
    expect(r).not.toBeUndefined();
    expect(r?.value).toEqual({
      name: "カロナール錠５００　５００ｍｇ",
      amount: "３",
      unit: "錠",
    });
    expect(r?.j).toBe(src.length);
  })

  it("should parse usage days", () => {
    const src = "分３　毎食後　５日分";
    const r = daysUsage().apply(src + "　　", 0);
    expect(r).toEqual({
      value: {
        kind: "days",
        usage: "分３　毎食後",
        days: "５"
      },
      j: src.length,
    })
  })

  it("should parse usage times", () => {
    const src = "疼痛時、１回１錠　１０回分";
    const r = timesUsage().apply(src + "  ", 0);
    expect(r).toEqual({
      value: {
        kind: "times",
        usage: "疼痛時、１回１錠",
        times: "１０",
      },
      j: src.length,
    })
  })

  it("should parse other usage", () => {
    const src = "１日１回、１回１枚、患部に貼付";
    const r = otherUsage().apply(src, 0);
    expect(r).toEqual({
      value: {
        kind: "other",
        usage: src,
      },
      j: src.length
    })
  })

  it("should parse single drug line", () => {
    const src = "カロナール錠５００　５００ｍｇ　３錠";
    const r = drugLines().apply(src, 0);
    expect(r?.value).toEqual(
      [
        {
          name: "カロナール錠５００　５００ｍｇ",
          amount: "３",
          unit: "錠",
          drugComments: [],
        }
      ]
    );
    expect(r?.j).toBe(src.length);
  })

  it("should parse multiple drug lines", () => {
    const src = "カロナール錠５００　５００ｍｇ　３錠\n　　アンブロキソール錠１５ｍｇ　３錠\n";
    const r = drugLines().apply(src, 0);
    expect(r?.value).toEqual(
      [
        {
          name: "カロナール錠５００　５００ｍｇ",
          amount: "３",
          unit: "錠",
          drugComments: [],
        },
        {
          name: "アンブロキソール錠１５ｍｇ",
          amount: "３",
          unit: "錠",
          drugComments: [],
        }
      ]
    );
    expect(r?.j).toBe(src.length);
  })

  it("should parse usage", () => {
    let src = "　　分３　毎食後　５日分\n";
    let r = usageLine().apply(src, 0);
    expect(r?.value).toEqual({
      kind: "days",
      usage: "分３　毎食後",
      days: "５"
    });
    expect(r?.j).toBe(src.length);

    src = "　　疼痛時、１回１錠　１０回分\n";
    r = usageLine().apply(src, 0);
    expect(r?.value).toEqual({
      kind: "times",
      usage: "疼痛時、１回１錠",
      times: "１０",
    });
    expect(r?.j).toBe(src.length);

    src = "　　１日１回、１回１枚、患部に貼付\n";
    r = usageLine().apply(src, 0);
    expect(r?.value).toEqual({
      kind: "other",
      usage: "１日１回、１回１枚、患部に貼付",
    });
    expect(r?.j).toBe(src.length);
  })

  it("should parse drug group with single drug", () => {
    let src = "１）カロナール錠５００　５００ｍｇ　３錠\n" +
      "　　分３　毎食後　５日分\n";
    let r = drugGroup().apply(src, 0);
    expect(r?.value).toEqual({
      drugs: [
        {
          name: "カロナール錠５００　５００ｍｇ",
          amount: "３",
          unit: "錠",
          drugComments: [],
        }
      ],
      usage: {
        kind: "days",
        usage: "分３　毎食後",
        days: "５"
      },
      groupComments: [],
    });
    expect(r?.j).toBe(src.length);
  })

  it("should parse simple shohou", () => {
    let src = "院外処方\nＲｐ）\n" +
      "１）カロナール錠５００　５００ｍｇ　３錠\n" +
      "　　分３　毎食後　５日分";
    let r = shohou().apply(src, 0);
    expect(r?.value).toEqual({
      groups: [
        {
          drugs: [
            {
              name: "カロナール錠５００　５００ｍｇ",
              amount: "３",
              unit: "錠",
              drugComments: [],
            }
          ],
          usage: {
            kind: "days",
            usage: "分３　毎食後",
            days: "５"
          },
          groupComments: [],

        }
      ],
      bikou: [],
    });
    expect(r?.j).toBe(src.length);
  })

  it("should parse shohou comment line", () => {
    let src = "@memo: 高７\n";
    let r = shohouCommentLine().apply(src, 0);
    expect(r).toEqual({
      value: "memo: 高７",
      j: src.length,
    })

    src = " @memo: 高７\n";
    r = shohouCommentLine().apply(src, 0);
    expect(r).toBeUndefined();
  })
})