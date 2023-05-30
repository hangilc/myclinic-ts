import { calcSeikyuuMonth, extract都道府県コードfromAddress } from "../util";

describe("都道府県コード", () => {
  it("should be ok", () => {
    const code = extract都道府県コードfromAddress("東京都");
    expect(code).to.be.equal("13");
  });

  it("should calculate seikyuu month", () => {
    const [y, m] = calcSeikyuuMonth(2023, 5);
    expect(y).equal(2023);
    expect(m).equal(6);
  })
});
