import {
  mkHokenPayer, mkKouhiHibakusha, mkKouhiMaruaoFutanNash, mkMaruToTaikiosen,
  mkKouhiNanbyou, mkKouhiMarucho, Payer, calcPayments, PayerObject,
  totalJikofutanOf, PaymentSetting, reorderPayers, mkHokenHairyosochi
} from "./calc";
import { ShotokuKubunCode } from "../codes";

function calc(totalTen: number, shotokuKubun: ShotokuKubunCode | undefined, futanWari: number, jikofutan: number,
  setting: Partial<PaymentSetting> = {}, kouhiList: Payer[] = []): Payer {
  const hoken = shotokuKubun === "一般Ⅱ" ? mkHokenHairyosochi() :  mkHokenPayer();
  const payers = [hoken, ...kouhiList];
  calcPayments([[totalTen * 10, payers]], {
    futanWari,
    shotokuKubun,
    isUnder70: setting.isUnder70 ?? (["ア", "イ", "ウ", "エ", "オ"].includes(shotokuKubun ?? "")),
    isBirthdayMonth75: setting.isBirthdayMonth75 ?? false,
  });
  expect(PayerObject.jikofutanOf(payers)).toBe(jikofutan);
  return hoken;
}

describe("futan-calc", () => {

  it("should handle single visit hoken only", () => {
    calc(300, undefined, 3, 900);
  });

  it("should reorder payers", () => {
    let payers: Payer[] = [];
    expect(reorderPayers(payers)).toEqual(payers);
    const hoken = mkHokenPayer();
  });

  it("should handle gendogaku of ウ under 70", () => {
    calc(100000, "ウ", 3, 87430);
  });

  it("should handle gendogaku of ウ under 70 (case 2)", () => {
    calc(80000, "ウ", 3, 85430);
  });

  it("should handle gendogaku of ウ under 70 (case 3)", () => {
    calc(26600, "ウ", 3, 79800);
  });

  it("should handle gendogaku of 現役並みⅢ", () => {
    calc(100000, "現役並みⅢ", 3, 254180);
  });

  it("should handle gendogaku of 配慮措置", () => {
    calc(8000, "一般Ⅱ", 2, 11000);
  });

  it("should handle gendogaku of 配慮措置 (case 2)", () => {
    calc(13000, "一般Ⅱ", 2, 16000);
  });

  it("should handle gendogaku of 配慮措置 at birthday month", () => {
    calc(10000, "一般Ⅱ", 2, 9000, { isBirthdayMonth75: true });
  });

  it("should handle gendogaku of 配慮措置 at birthday month (case 2)", () => {
    calc(4000, "一般Ⅱ", 2, 7000, { isBirthdayMonth75: true });
  });

  it("should handle 公費 被爆者の子", () => {
    const hibakusha: Payer = mkKouhiHibakusha();
    calc(400, undefined, 3, 0, {}, [hibakusha]);
    expect(hibakusha.payment.payment).toBe(1200);
  });

  it("should handle 公費 マル青負担なし", () => {
    const maruao = mkKouhiMaruaoFutanNash();
    calc(400, undefined, 3, 0, {}, [maruao]);
    expect(maruao.payment.payment).toBe(1200);
  });

  it("should handle 公費 大気汚染", () => {
    const kouhi = mkMaruToTaikiosen(6000);
    calc(400, undefined, 3, 1200, {}, [kouhi]);
  });

  it("should handle 公費 大気汚染 限度額到達", () => {
    const kouhi = mkMaruToTaikiosen(6000);
    calc(4000, undefined, 3, 6000, {}, [kouhi]);
    expect(kouhi.payment.payment).toBe(6000);
  });

  it("should handle 公費 マル都 難病", () => {
    const kouhi = mkKouhiNanbyou(6000);
    calc(800, undefined, 3, 1600, {}, [kouhi]);
    expect(kouhi.payment.payment).toBe(800);
  });

  it("should handle 公費 マル都 難病 (gendo applied)", () => {
    const kouhi = mkKouhiNanbyou(6000);
    calc(4000, undefined, 3, 6000, {}, [kouhi]);
    expect(kouhi.payment.payment).toBe(6000);
  });

  it("should handle マル長", () => {
    const kouhi = mkKouhiMarucho(10000);
    calc(28000, undefined, 3, 10000, {}, [kouhi]);
  });

  it("should handle 難病", () => {
    const hoken = mkHokenPayer();
    const kouhi = mkKouhiNanbyou(5000);
    const paymentsList = calcPayments(
      [
        [3000 * 10, [hoken, kouhi]],
        [1000 * 10, [hoken]],
      ], { futanWari: 2, shotokuKubun: "一般Ⅱ", isUnder70: false });
    expect(totalJikofutanOf(paymentsList)).toBe(7000);
    expect(kouhi.payment.payment).toBe(1000);
  });

  it("should handle 難病 (case 2)", () => {
    const hoken = mkHokenPayer();
    const kouhi = mkKouhiNanbyou(5000);
    const paymentsList = calcPayments(
      [
        [4000 * 10, [hoken, kouhi]],
        [5000 * 10, [hoken]],
      ], { futanWari: 2, shotokuKubun: "一般Ⅱ", isUnder70: false });
    expect(totalJikofutanOf(paymentsList)).toBe(13000);
    expect(kouhi.payment.payment).toBe(3000);
  });

});
