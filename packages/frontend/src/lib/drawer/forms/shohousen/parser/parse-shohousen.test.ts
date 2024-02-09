import { extractChunks, parseShohousen } from "./parse-shohousen"
import { parseFirstLine, parseNonFirstLine } from "./parsed-line";
import { renderDrugAmount } from "./render";

describe("shohousen parser", () => {
  it("should extract chunks", () => {
    const result = extractChunks("Ｒｐ）\n１）カロナール錠５００ｍｇ　３錠\n　分３　毎食後　５日分\n@memo:オンライン対応");
    expect(result.prolog).equal("Ｒｐ）\n");
    expect(result.chunks.length).equal(2);
    expect(result.chunks[0]).equal("１）カロナール錠５００ｍｇ　３錠\n　分３　毎食後　５日分\n");
    expect(result.chunks[1]).equal("@memo:オンライン対応");
  });

  it("should parse first line (1)", () => {
    const f = parseFirstLine("カロナール錠５００ｍｇ　３錠");
    expect(f).deep.equal({
      kind: "drug-amount",
      drug: "カロナール錠５００ｍｇ",
      amount: "３",
      unit: "錠",
    })
  })

  it("should parse first line (2)", () => {
    const f = parseFirstLine("デルモベート軟膏０．０５％５ｇ　５ｇ");
    expect(f).deep.equal({
      kind: "drug-amount",
      drug: "デルモベート軟膏０．０５％５ｇ",
      amount: "５",
      unit: "ｇ",
    })
  })

  it("should parse first line (3)", () => {
    const f = parseFirstLine("アローゼン顆粒　０．５ｇ");
    expect(f).deep.equal({
      kind: "drug-amount",
      drug: "アローゼン顆粒",
      amount: "０．５",
      unit: "ｇ",
    })
  })

  it("should parse days line (1)", () => {
    const p = parseNonFirstLine("　　分３　毎食後　５日分");
    expect(p).deep.equal({ kind: "days", str: "　　分３　毎食後", days: "５", unit: "日分", extra: "" })
  })

  it("should parse shohousen (1)", () => {
    const p = parseShohousen("院外処方\nＲｐ）\n１）カロナール錠５００ｍｇ　３錠\n分３　毎食後　５日分\n");
    expect(p.prolog).deep.equal(["院外処方", "Ｒｐ）"]);
    expect(p.drugs).deep.equal([
      [
        { kind: "drug-amount", drug: "カロナール錠５００ｍｇ", amount: "３", unit: "錠" },
        { kind: "days", str: "分３　毎食後", days: "５", unit: "日分", extra: "" }
      ]
    ])
  })

  it("should render drug amount (1)", () => {
    const r = renderDrugAmount("カロナール錠５００ｍｇ", "３", "錠", 31, 21);
    expect(r).matches(/^カロナール錠５００ｍｇ　{9}３錠$/)
  })
})