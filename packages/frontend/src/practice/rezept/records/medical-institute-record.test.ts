import { extract都道府県コードfromAddress } from "../util";

describe("都道府県コード", () => {
  it("should be ok", () => {
    const code = extract都道府県コードfromAddress("東京都");
    expect(code).to.be.equal("13");
  })
});
