import { calcSeikyuuMonth, extract都道府県コードfromAddress } from "../helper";

describe("都道府県コード", () => {
  it("should be ok", () => {
    const code = extract都道府県コードfromAddress("東京都");
    expect(code).toBe("13");
  });

  it("should calculate seikyuu month", () => {
    const [y, m] = calcSeikyuuMonth(2023, 5);
    expect(y).toBe(2023);
    expect(m).toBe(6);
  })
});
