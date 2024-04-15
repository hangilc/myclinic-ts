import { calcJikofutan, calcPayments, mkHokenPayer, mkKouhiNanbyou } from "./calc";

describe("futan/calc", () => {
  it("should calc jiko futan", () => {
    const futan = calcJikofutan(2000, [{ payment: 1400 }]);
    expect(futan).toBe(600);
  });

  it("should calc basic case", () => {
    const shaho = mkHokenPayer(3);
    const bill = 2000;
    calcPayments(bill, [shaho]);
    expect(shaho).toMatchObject({ payment: 1400 });
    expect(calcJikofutan(bill, [shaho])).toBe(600);
  });

  it("should handle nanbyou with futanWari 3", () => {
    const hoken = mkHokenPayer(3);
    const nanbyou = mkKouhiNanbyou(5000);
    const bill = 2000;
    calcPayments(bill, [hoken, nanbyou]);
    expect(hoken).toMatchObject({ payment: 1400 });
    expect(nanbyou).toMatchObject({ payment: 200 });
    expect(calcJikofutan(bill, [hoken, nanbyou])).toBe(400);
  });

  it("should handle nanbyou with futanWari 2", () => {
    const hoken = mkHokenPayer(2);
    const nanbyou = mkKouhiNanbyou(5000);
    const bill = 2000;
    calcPayments(bill, [hoken, nanbyou]);
    expect(hoken).toMatchObject({ payment: 1600 });
    expect(nanbyou).toMatchObject({ payment: 0 });
    expect(calcJikofutan(bill, [hoken, nanbyou])).toBe(400);820
  });

  it("should handle nanbyou with futanWari 1", () => {
    const hoken = mkHokenPayer(1);
    const nanbyou = mkKouhiNanbyou(5000);
    const bill = 2000;
    calcPayments(bill, [hoken, nanbyou]);
    expect(hoken).toMatchObject({ payment: 1800 });
    expect(nanbyou).toMatchObject({ payment: 0 });
    expect(calcJikofutan(bill, [hoken, nanbyou])).toBe(200);
  });

  // 難病計算例７０歳未満.pdf

  it("should handle nanbyou case 20", () => {
    const hoken = mkHokenPayer(3, 257180);
    const nanbyou = mkKouhiNanbyou(30000);
    const bill = 1300000;
    calcPayments(bill, [hoken, nanbyou]);
    expect(hoken).toMatchObject({ payment: 1042820 });
    expect(nanbyou).toMatchObject({ payment: 227180 });
    expect(calcJikofutan(bill, [hoken, nanbyou])).toBe(30000);
  });

  it("should handle nanbyou case 20 (multiple visits)", () => {
    const hoken = mkHokenPayer(3, 257180);
    const nanbyou = mkKouhiNanbyou(30000);
    const bill = 1300000;
    const bill1 = 1200000;
    const bill2 = bill - bill1;
    calcPayments(bill1, [hoken, nanbyou]);
    calcPayments(bill2, [hoken, nanbyou]);
    expect(hoken).toMatchObject({ payment: 1042820 });
    expect(nanbyou).toMatchObject({ payment: 227180 });
    expect(calcJikofutan(bill, [hoken, nanbyou])).toBe(30000);
  });

  it("should handle nanbyou case 20 (multiple visits, round 2)", () => {
    const hoken = mkHokenPayer(3, 257180);
    const nanbyou = mkKouhiNanbyou(30000);
    const bill = 1300000;
    const bill2 = 1200000;
    const bill1 = bill - bill2;
    calcPayments(bill1, [hoken, nanbyou]);
    calcPayments(bill2, [hoken, nanbyou]);
    expect(hoken).toMatchObject({ payment: 1042820 });
    expect(nanbyou).toMatchObject({ payment: 227180 });
    expect(calcJikofutan(bill, [hoken, nanbyou])).toBe(30000);
  });
});

