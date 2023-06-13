import { 負担区分コード, type 負担区分コードCode, type 負担区分コードName } from "./codes";
import { calcFutan, KouhiKekkaku, KouhiKouseiIryou, KuniNanbyou, MarutoNanbyou, SeikatsuHogo, TotalCover, type HokenSelector, type KouhiData, type KouhiProcessorArg } from "./futan-calc";

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

// 高額療養費の自己負担限度額の見直しに係る請求計算事例（高齢受給者）平成30年8月による
describe("高額療養費（高齢受給者）", () => {
  it("事例１　高齢受給者入院", () => {
    const covers = calcFutan(3, "現役並みⅢ", [], [
      mkTen("H", 99260),
    ], { });
    expect(patientChargeOf(covers)).equal(254106);
  });

  it("事例２　高齢受給者入院（多数回該当）", () => {
    const covers = calcFutan(3, "現役並みⅢ", [], [
      mkTen("H", 47600),
    ], { gendogakuTasuuGaitou: true });
    expect(patientChargeOf(covers)).equal(140100);
  });

  it("事例３　高齢受給者入院", () => {
    const covers = calcFutan(3, "現役並みⅡ", [], [
      mkTen("H", 61600),
    ], { });
    expect(patientChargeOf(covers)).equal(167980);
  });

  it("事例４　高齢受給者入院（75歳到達月）", () => {
    const covers = calcFutan(3, "現役並みⅡ", [], [
      mkTen("H", 33600),
    ], { isBirthdayMonth75: true, debug: false });
    expect(patientChargeOf(covers)).equal(84270);
  });

  it("事例５　高齢受給者入院", () => {
    const covers = calcFutan(3, "現役並みⅠ", [], [
      mkTen("H", 27600),
    ], { debug: false });
    expect(patientChargeOf(covers)).equal(80190);
  });

  it("事例６　高齢受給者入院（75歳到達月）（多数回該当）", () => {
    const covers = calcFutan(3, "現役並みⅠ", [], [
      mkTen("H", 15200),
    ], { isBirthdayMonth75: true, gendogakuTasuuGaitou: true, debug: false });
    expect(patientChargeOf(covers)).equal(22200);
  });

  it("事例７　高齢受給者入院・難病医療", () => {
    const covers = calcFutan(3, "現役並みⅢ", [KuniNanbyou], [
      mkTen("H1", 90500),
    ], { gendogaku: { kingaku: 10000, kouhiBangou: 1 }, debug: false });
    expect(patientChargeOf(covers)).equal(10000);
  });

  it("事例８　高齢受給者入院・難病医療（多数回該当）", () => {
    const covers = calcFutan(3, "現役並みⅢ", [KuniNanbyou], [
      mkTens(["H1", 48200], ["H", 47100]),
    ], { gendogaku: { kingaku: 10000, kouhiBangou: 1 }, gendogakuTasuuGaitou: true, debug: false });
    expect(patientChargeOf(covers)).equal(140100);
  });

  it("事例９　高齢受給者入院・難病医療", () => {
    const covers = calcFutan(3, "現役並みⅡ", [KuniNanbyou], [
      mkTen("H1", 67100),
    ], { gendogaku: { kingaku: 10000, kouhiBangou: 1 }, debug: false });
    expect(patientChargeOf(covers)).equal(10000);
  });

  it("事例１０　高齢受給者入院・難病医療（75歳到達月）（多数回該当）", () => {
    const covers = calcFutan(3, "現役並みⅡ", [KuniNanbyou], [
      mkTens(["H1", 67100], ["H", 16599]),
    ], {
      isBirthdayMonth75: true, 
      gendogaku: { kingaku: 10000, kouhiBangou: 1 }, 
      gendogakuTasuuGaitou: true,
      debug: false });
    expect(patientChargeOf(covers)).equal(46500);
  });

  it("事例１１　高齢受給者入院・難病医療（多数回該当）", () => {
    const covers = calcFutan(3, "現役並みⅡ", [KuniNanbyou], [
      mkTens(["H1", 35599], ["H", 2500]),
    ], {
      gendogaku: { kingaku: 10000, kouhiBangou: 1 }, 
      gendogakuTasuuGaitou: true,
      debug: false });
    expect(patientChargeOf(covers)).equal(17500);
  });

  it("事例１２　高齢受給者入院・難病医療", () => {
    const covers = calcFutan(3, "現役並みⅠ", [KuniNanbyou], [
      mkTens(["H1", 28900], ["H", 1200]),
    ], {
      gendogaku: { kingaku: 10000, kouhiBangou: 1 }, 
      debug: false });
    expect(patientChargeOf(covers)).equal(13600);
  });

  it("事例１３　高齢受給者入院・難病医療（多数回該当）", () => {
    const covers = calcFutan(3, "現役並みⅠ", [KuniNanbyou], [
      mkTens(["H1", 9800], ["H", 16800]),
    ], {
      gendogaku: { kingaku: 10000, kouhiBangou: 1 }, 
      gendogakuTasuuGaitou: true,
      debug: false });
    expect(patientChargeOf(covers)).equal(44400);
  });

  it("事例１４　高齢受給者入院・難病医療（75歳到達月）（多数回該当）", () => {
    const covers = calcFutan(3, "現役並みⅠ", [KuniNanbyou], [
      mkTens(["H1", 19900], ["H", 23300]),
    ], {
      gendogaku: { kingaku: 10000, kouhiBangou: 1 }, 
      gendogakuTasuuGaitou: true,
      isBirthdayMonth75: true,
      debug: false });
    expect(patientChargeOf(covers)).equal(22200);
  });

  it("事例１５　高齢受給者入院・更生医療", () => {
    const covers = calcFutan(3, "現役並みⅡ", [KouhiKouseiIryou], [
      mkTens(["H1", 44300]),
    ], {
      debug: false });
    expect(patientChargeOf(covers)).equal(44300);
  });

  it("事例１６　高齢受給者入院・更生医療", () => {
    const covers = calcFutan(3, "現役並みⅠ", [KouhiKouseiIryou], [
      mkTens(["H1", 20900], ["H", 500]),
    ], {
      debug: false });
    expect(patientChargeOf(covers)).equal(22400);
  });

  it("事例１７　高齢受給者入院（特例措置対象者：生年月日が昭和19年4月1日以前）", () => {
    const covers = calcFutan(2, "一般", [], [
      mkTens(["H", 34500]),
    ], {
      isKourei1WariShiteiKouhi: true,
      debug: false 
    });
    expect(patientChargeOf(covers)).equal(34500);
  });

  it("事例１８　高齢受給者入院（75歳到達月）（多数回該当）", () => {
    const covers = calcFutan(2, "一般", [], [
      mkTens(["H", 13500]),
    ], {
      gendogakuTasuuGaitou: true,
      isBirthdayMonth75: true,
      isNyuuin: true,
      debug: false, 
    });
    expect(patientChargeOf(covers)).equal(22200);
  });

  it("事例１９　高齢受給者入院", () => {
    const covers = calcFutan(2, "低所得Ⅱ", [], [
      mkTens(["H", 16700]),
    ], {
      isNyuuin: true,
      debug: false, 
    });
    expect(patientChargeOf(covers)).equal(24600);
  });

  it("事例２０　高齢受給者入院（75歳到達月）（特例措置対象者：生年月日が昭和19年4月1日以前）", () => {
    const covers = calcFutan(2, "低所得Ⅱ", [], [
      mkTens(["H", 5500]),
    ], {
      isNyuuin: true,
      isBirthdayMonth75: true,
      isKourei1WariShiteiKouhi: true,
      debug: false, 
    });
    expect(patientChargeOf(covers)).equal(5500);
  });

  it("事例２１　高齢受給者入院・難病医療", () => {
    const covers = calcFutan(2, "一般", [KuniNanbyou], [
      mkTens(["H1", 41300]),
    ], {
      isNyuuin: true,
      gendogaku: { kingaku: 10000, kouhiBangou: 1 },
      debug: false 
    });
    expect(patientChargeOf(covers)).equal(10000);
  });

  it("事例２２　高齢受給者入院・難病医療", () => {
    const covers = calcFutan(2, "一般", [KuniNanbyou], [
      mkTens(["H1", 5500], ["H", 30000]),
    ], {
      isNyuuin: true,
      gendogaku: { kingaku: 10000, kouhiBangou: 1 },
      debug: false 
    });
    expect(patientChargeOf(covers)).equal(57600);
  });

  it("事例２３　高齢受給者入院・難病医療（75歳到達月）", () => {
    const covers = calcFutan(2, "一般", [KuniNanbyou], [
      mkTens(["H1", 16500], ["H", 15500]),
    ], {
      isNyuuin: true,
      gendogaku: { kingaku: 10000, kouhiBangou: 1 },
      isBirthdayMonth75: true,
      debug: false 
    });
    expect(patientChargeOf(covers)).equal(28800);
  });

  it("事例２４　高齢受給者入院・難病医療（多数回該当）（特例措置対象者：生年月日が昭和19年4月1日以前）", () => {
    const covers = calcFutan(2, "一般", [KuniNanbyou], [
      mkTens(["H1", 23100], ["H", 800]),
    ], {
      isNyuuin: true,
      gendogaku: { kingaku: 10000, kouhiBangou: 1 },
      isKourei1WariShiteiKouhi: true,
      debug: false 
    });
    expect(patientChargeOf(covers)).equal(10800);
  });

  it("事例２５　高齢受給者入院・難病医療（75歳到達月）（多数回該当）", () => {
    const covers = calcFutan(2, "一般", [KuniNanbyou], [
      mkTens(["H1", 14500], ["H", 15100]),
    ], {
      isNyuuin: true,
      gendogaku: { kingaku: 10000, kouhiBangou: 1 },
      isBirthdayMonth75: true,
      gendogakuTasuuGaitou: true,
      debug: false 
    });
    expect(patientChargeOf(covers)).equal(22200);
  });

  it("事例２６　高齢受給者入院・難病医療", () => {
    const covers = calcFutan(2, "低所得Ⅰ", [KuniNanbyou], [
      mkTens(["H1", 22800]),
    ], {
      isNyuuin: true,
      gendogaku: { kingaku: 5000, kouhiBangou: 1 },
      debug: false 
    });
    expect(patientChargeOf(covers)).equal(5000);
  });

  it("事例２７　高齢受給者入院・難病医療（特例措置対象者：生年月日が昭和19年4月1日以前）", () => {
    const covers = calcFutan(2, "低所得Ⅰ", [KuniNanbyou], [
      mkTens(["H1", 15500], ["H", 2300]),
    ], {
      isNyuuin: true,
      gendogaku: { kingaku: 5000, kouhiBangou: 1 },
      isKourei1WariShiteiKouhi: true,
      debug: false 
    });
    expect(patientChargeOf(covers)).equal(7300);
  });

  it("事例２８　高齢受給者入院・難病医療（特例措置対象者：生年月日が昭和19年4月1日以前）", () => {
    const covers = calcFutan(2, "低所得Ⅱ", [KuniNanbyou], [
      mkTens(["H1", 8900], ["H", 2600]),
    ], {
      isNyuuin: true,
      gendogaku: { kingaku: 5000, kouhiBangou: 1 },
      isKourei1WariShiteiKouhi: true,
      debug: false 
    });
    expect(patientChargeOf(covers)).equal(7600);
  });

  it.only("事例２９　高齢受給者入院・難病医療・生活保護", () => {
    const covers = calcFutan(2, "低所得Ⅱ", [KuniNanbyou, SeikatsuHogo()], [
      mkTens(["H1", 15500], ["H2", 9000]),
    ], {
      isNyuuin: true,
      gendogaku: { kingaku: 0, kouhiBangou: 1 },
      debug: true 
    });
    expect(patientChargeOf(covers)).equal(0);
    expect(coveredBy("1", covers)).equal(24600);
    expect(coveredBy("2", covers)).equal(15000);
  });

});

