import { extractChunks, formatShohousen } from "./parse-shohousen"
import { parseFirstLine } from "./parsed-line";

describe("shohousen parser", () => {
  it("should extract chunks", () => {
    const result = extractChunks("Ｒｐ）\n１）カロナール錠５００ｍｇ　３錠\n　分３　毎食後　５日分\n@memo:オンライン対応");
    expect(result.prolog).equal("Ｒｐ）\n");
    expect(result.chunks.length).equal(2);
    expect(result.chunks[0]).equal("１）カロナール錠５００ｍｇ　３錠\n　分３　毎食後　５日分\n");
    expect(result.chunks[1]).equal("@memo:オンライン対応");
  });

  it("should format prolog", () => {
    const f = formatShohousen("院外処方\nＲｐ）\n１）カロナール");
    expect(f).matches(/^院外処方\nＲｐ）/);
  });

  it("should parse first line (1)", () => {
    const f = parseFirstLine("カロナール錠５００ｍｇ　３錠");
    expect(f.kind).equal("first");
    expect(f.drug).equal("カロナール錠５００ｍｇ");
    expect(f.amountPart).not.undefined
    expect(f.amountPart?.amount).equal("３");
    expect(f.amountPart?.unit).equal("錠");
  })

  it("should parse first line (2)", () => {
    const f = parseFirstLine("デルモベート軟膏０．０５％５ｇ　５ｇ");
    expect(f.kind).equal("first");
    expect(f.drug).equal("デルモベート軟膏０．０５％５ｇ");
    expect(f.amountPart).not.undefined
    expect(f.amountPart?.amount).equal("５");
    expect(f.amountPart?.unit).equal("ｇ");
  })

  it("should parse first line (3)", () => {
    const f = parseFirstLine("アローゼン顆粒　０．５ｇ");
    expect(f.kind).equal("first");
    expect(f.drug).equal("アローゼン顆粒");
    expect(f.amountPart).not.undefined
    expect(f.amountPart?.amount).equal("０．５");
    expect(f.amountPart?.unit).equal("ｇ");
  })
})