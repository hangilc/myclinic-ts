import { Payer, PayerObject, calcPayments, mkHokenPayer, mkKouhiNanbyou } from "./calc";

function calcJikofutan(bill: number, payers: Payer[]): number {
  return PayerObject.jikofutanOf(payers);
}

describe("futan/calc-nanbyou", () => {
  it("should calc basic case", () => {
    const shaho = mkHokenPayer();
    const bill = 2000;
    calcPayments([[bill, [shaho]]], { futanWari: 3, isUnder70: false });
    expect(shaho.payment).toMatchObject({ payment: 1400 });
    expect(calcJikofutan(bill, [shaho])).toBe(600);
  });

  it("should handle nanbyou with futanWari 3", () => {
    const hoken = mkHokenPayer();
    const nanbyou = mkKouhiNanbyou(5000);
    const bill = 2000;
    calcPayments([[bill, [hoken, nanbyou]]], { futanWari: 3, isUnder70: false });
    expect(hoken.payment).toMatchObject({ payment: 1400 });
    expect(nanbyou.payment).toMatchObject({ payment: 200 });
    expect(calcJikofutan(bill, [hoken, nanbyou])).toBe(400);
  });

  it("should handle nanbyou with futanWari 2", () => {
    const hoken = mkHokenPayer();
    const nanbyou = mkKouhiNanbyou(5000);
    const bill = 2000;
    calcPayments([[bill, [hoken, nanbyou]]], { futanWari: 2, isUnder70: false });
    expect(hoken.payment).toMatchObject({ payment: 1600 });
    expect(nanbyou.payment).toMatchObject({ payment: 0 });
    expect(calcJikofutan(bill, [hoken, nanbyou])).toBe(400); 820
  });

  it("should handle nanbyou with futanWari 1", () => {
    const hoken = mkHokenPayer();
    const nanbyou = mkKouhiNanbyou(5000);
    const bill = 2000;
    calcPayments([[bill, [hoken, nanbyou]]], { futanWari: 1, isUnder70: false });
    expect(hoken.payment).toMatchObject({ payment: 1800 });
    expect(nanbyou.payment).toMatchObject({ payment: 0 });
    expect(calcJikofutan(bill, [hoken, nanbyou])).toBe(200);
  });

  // 難病計算例７０歳未満.pdf

  it("should handle nanbyou case 20", () => {
    const hoken = mkHokenPayer();
    const nanbyou = mkKouhiNanbyou(30000);
    const bill = 1300000;
    const payments = calcPayments([[bill, [hoken, nanbyou]]], { 
      futanWari: 3, shotokuKubun: "ア", isUnder70: true });
    console.log("payments", payments);
    expect(hoken.payment.payment).toBe(1042820);
    expect(nanbyou.payment.payment).toBe(227180);
    expect(calcJikofutan(bill, [hoken, nanbyou])).toBe(30000);
  });

});

