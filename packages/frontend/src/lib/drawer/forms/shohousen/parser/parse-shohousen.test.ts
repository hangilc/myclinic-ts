import { extractChunks } from "./parse-shohousen"

describe("shohousen parser", () => {
  it("should extract chunks", () => {
    const chunks = extractChunks("Ｒｐ）\n１）カロナール錠５００ｍｇ　３錠\n　分３　毎食後　５日分\n@memo:オンライン対応");
    console.log(chunks);
    expect(chunks.length).equal(2);
    expect(chunks[0]).equal("１）カロナール錠５００ｍｇ　３錠\n　分３　毎食後　５日分\n");
    expect(chunks[1]).equal("@memo:オンライン対応");
  })
})