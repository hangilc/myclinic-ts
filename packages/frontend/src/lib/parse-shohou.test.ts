import { describe, expect, it } from "vitest";
import {
  daysUsage, drugCommandLine, drugGroup, drugIndex, drugsLines, drugNameAndAmount, eol, otherUsage,
  prolog, shohou, shohouCommandLine, timesUsage, usageLine,
  drugLines,
  groupCommandLine
} from "./parse-shohou"

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
    const r = drugsLines().apply(src, 0);
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
    const r = drugsLines().apply(src, 0);
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
    let r = shohouCommandLine().apply(src, 0);
    expect(r).toEqual({
      value: "memo: 高７",
      j: src.length,
    })

    src = " @memo: 高７\n";
    r = shohouCommandLine().apply(src, 0);
    expect(r).toBeUndefined();
  })

  it("should parse drug comment line", () => {
    let src = "　　@comment: ５ｍＬ２本\n";
    let r = drugCommandLine().apply(src, 0);
    expect(r).toEqual({
      value: "comment: ５ｍＬ２本",
      j: src.length,
    })
  })

  it("should handle drug comment", () => {
    let src = "カロナール錠５００　５００ｍｇ　３錠\n" +
      "　　@comment:５ｍＬ２本\n";
    let r = drugLines().apply(src, 0);
    expect(r?.value).toEqual(
      {
        name: "カロナール錠５００　５００ｍｇ",
        amount: "３",
        unit: "錠",
        drugComments: ["５ｍＬ２本"],
      }
    );
    expect(r?.j).toBe(src.length);

    src = "カロナール錠５００　５００ｍｇ　３錠\n" +
      "　　@変更不可\n";
    r = drugLines().apply(src, 0);
    expect(r?.value).toEqual(
      {
        name: "カロナール錠５００　５００ｍｇ",
        amount: "３",
        unit: "錠",
        drugComments: [],
        senpatsu: "henkoufuka",
      }
    );
    expect(r?.j).toBe(src.length);

    src = "カロナール錠５００　５００ｍｇ　３錠\n" +
      "　　@患者希望\n";
    r = drugLines().apply(src, 0);
    expect(r?.value).toEqual(
      {
        name: "カロナール錠５００　５００ｍｇ",
        amount: "３",
        unit: "錠",
        drugComments: [],
        senpatsu: "kanjakibou",
      }
    );
    expect(r?.j).toBe(src.length);

    src = "カロナール錠５００　５００ｍｇ　３錠\n" +
      "　　@変更不可\n" +
      "　　@comment: ５ｍＬ　２本\n";
    r = drugLines().apply(src, 0);
    expect(r?.value).toEqual(
      {
        name: "カロナール錠５００　５００ｍｇ",
        amount: "３",
        unit: "錠",
        drugComments: ["５ｍＬ　２本"],
        senpatsu: "henkoufuka",
      }
    );
    expect(r?.j).toBe(src.length);
  })

  it("should shohou with bikou", () => {
    let src = "院外処方\nＲｐ）\n" +
      "１）カロナール錠５００　５００ｍｇ　３錠\n" +
      "　　分３　毎食後　５日分\n" +
      "@memo:高７";
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
      bikou: ["高７"],
    });
    expect(r?.j).toBe(src.length);
  })

  it("should shohou with effective date", () => {
    let src = "院外処方\nＲｐ）\n" +
      "１）カロナール錠５００　５００ｍｇ　３錠\n" +
      "　　分３　毎食後　５日分\n" +
      "＠有効期限: 2025-03-05";
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
      kigen: "2025-03-05",
    });
    expect(r?.j).toBe(src.length);
  })

  it("should parse group command", () => {
    let src = "　　@comment: １日３回まで\n";
    let r = groupCommandLine().apply(src, 0);
    expect(r?.value).toBe("comment: １日３回まで");
    expect(r?.j).toBe(src.length);
  })

  it("should shohou with group command", () => {
    let src = "院外処方\nＲｐ）\n" +
      "１）カロナール錠５００　５００ｍｇ　３錠\n" +
      "　　分３　毎食後　５日分\n" +
      "　　@comment: １日３回まで\n";
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
          groupComments: ["１日３回まで"],
        }
      ],
      bikou: [],
    });
    expect(r?.j).toBe(src.length);
  })

	it("should parse multiple drugs", () => {
		let text = `院外処方
Ｒｐ）
１）メトプロロール錠（４０）　　　２錠
　　ニトロールＲカプセル（２０）　　　　　　２Ｃ
　　アロプリノール（１００）　　　　　　　　２錠
　　分２　朝夕食後　５６日分
２）アダラートＣＲ（１０）　１錠
　　ブロプレス（２）　１錠
　　分１　朝食後　５６日分
３）リピトール（１０）　１錠
　　分１　朝食後　５６日分`;
		let parsed = shohou().apply(text, 0);
		expect(parsed?.rest).toBe("");
	});

	
})
