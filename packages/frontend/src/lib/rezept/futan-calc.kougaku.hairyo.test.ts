import { 負担区分コード, type 負担区分コードCode, type 負担区分コードName } from "./codes";
import { calcFutan, KuniNanbyou, type HokenSelector, type TotalCover } from "./futan-calc";

function mkTens(...items: [負担区分コードName, number][]): Map<負担区分コードCode, number> {
  return new Map(items.map(([kubunName, ten]) => [負担区分コード[kubunName], ten]));
}

function mkTen(futanCodeName: 負担区分コードName, ten: number): Map<負担区分コードCode, number> {
  return mkTens([futanCodeName, ten]);
}

const round = Math.round;

function patientChargeOf(totalCover: TotalCover): number {
  return round(totalCover.patientCharge);
}

function coveredBy(sel: HokenSelector, totalCover: TotalCover): number {
  return totalCover.slot.kakariOf(sel) - totalCover.slot.patientChargeOf(sel);
}

// 後期高齢者医療制度の負担割合見直しに係る計算事例集（令和５年４月）
describe("高額療養費配慮措置", () => {
  it("【事例１】後期高齢者２割負担外来", () => {
    const covers = calcFutan(2, "一般Ⅱ", [], [
      mkTen("H", 2000),
    ], {});
    expect(patientChargeOf(covers)).equal(4000);
  });

  it("【事例2】後期高齢者２割負担外来", () => {
    const covers = calcFutan(2, "一般Ⅱ", [], [
      mkTen("H", 20000),
    ], {});
    expect(patientChargeOf(covers)).equal(18000);
  });

  it("【事例3】後期高齢者２割負担外来（配慮措置）", () => {
    const covers = calcFutan(2, "一般Ⅱ", [], [
      mkTen("H", 8000),
    ], {});
    expect(patientChargeOf(covers)).equal(11000);
  });

  it("【事例4】後期高齢者２割負担外来（配慮措置）", () => {
    const covers = calcFutan(2, "一般Ⅱ", [], [
      mkTen("H", 13000),
    ], {});
    expect(patientChargeOf(covers)).equal(16000);
  });

  it("【事例5】後期高齢者２割負担外来（75歳到達月）", () => {
    const covers = calcFutan(2, "一般Ⅱ", [], [
      mkTen("H", 10000),
    ], {
      isBirthdayMonth75: true,
    });
    expect(patientChargeOf(covers)).equal(9000);
  });

  it("【事例6】後期高齢者２割負担外来（配慮措置）（75歳到達月）", () => {
    const covers = calcFutan(2, "一般Ⅱ", [], [
      mkTen("H", 4000),
    ], {
      isBirthdayMonth75: true,
      debug: false,
    });
    expect(patientChargeOf(covers)).equal(7000);
  });

  it("【事例7】後期高齢者２割負担外来（配慮措置）（75歳到達月）", () => {
    const covers = calcFutan(2, "一般Ⅱ", [], [
      mkTen("H", 5000),
    ], {
      isBirthdayMonth75: true,
      debug: false,
    });
    expect(patientChargeOf(covers)).equal(8000);
  });

  it("【事例8】後期高齢者２割負担外来（マル長）", () => {
    const covers = calcFutan(2, "一般Ⅱ", [], [
      mkTen("H", 15000),
    ], {
      marucho: 10000,
      debug: false,
    });
    expect(patientChargeOf(covers)).equal(10000);
  });

  it("【事例9】後期高齢者２割負担外来（マル長）（75歳到達月）", () => {
    const covers = calcFutan(2, "一般Ⅱ", [], [
      mkTen("H", 7000),
    ], {
      marucho: 10000,
      isBirthdayMonth75: true,
      debug: false,
    });
    expect(patientChargeOf(covers)).equal(5000);
  });

  it("【事例10】後期高齢者２割負担外来（難病）", () => {
    const covers = calcFutan(2, "一般Ⅱ", [KuniNanbyou], [
      mkTen("H1", 10000),
    ], {
      gendogaku: { kingaku: 5000, kouhiBangou: 1 },
      debug: true,
    });
    expect(patientChargeOf(covers)).equal(5000);
    expect(coveredBy("1", covers)).equal(13000);
  });

});
