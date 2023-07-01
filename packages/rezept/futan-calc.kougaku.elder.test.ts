import { 負担区分コード, type 負担区分コードCode, type 負担区分コードName } from "./codes";
import { calcFutan, TotalCover, type HokenSelector } from "./futan-calc";
import { KouhiKouseiIryou, KuniNanbyou, KuniSeishinTsuuin, SeikatsuHogo, } from "./kouhi-registry";

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
    const covers = calcFutan(3, "現役並みⅢ", [],
      mkTen("H", 99260),
      {});
    expect(patientChargeOf(covers)).toBe(254106);
  });

  it("事例２　高齢受給者入院（多数回該当）", () => {
    const covers = calcFutan(3, "現役並みⅢ", [],
      mkTen("H", 47600),
      { gendogakuTasuuGaitou: true });
    expect(patientChargeOf(covers)).toBe(140100);
  });

  it("事例３　高齢受給者入院", () => {
    const covers = calcFutan(3, "現役並みⅡ", [],
      mkTen("H", 61600),
      {});
    expect(patientChargeOf(covers)).toBe(167980);
  });

  it("事例４　高齢受給者入院（75歳到達月）", () => {
    const covers = calcFutan(3, "現役並みⅡ", [],
      mkTen("H", 33600),
      { isBirthdayMonth75: true, debug: false });
    expect(patientChargeOf(covers)).toBe(84270);
  });

  it("事例５　高齢受給者入院", () => {
    const covers = calcFutan(3, "現役並みⅠ", [],
      mkTen("H", 27600),
      { debug: false });
    expect(patientChargeOf(covers)).toBe(80190);
  });

  it("事例６　高齢受給者入院（75歳到達月）（多数回該当）", () => {
    const covers = calcFutan(3, "現役並みⅠ", [],
      mkTen("H", 15200),
      { isBirthdayMonth75: true, gendogakuTasuuGaitou: true, debug: false });
    expect(patientChargeOf(covers)).toBe(22200);
  });

  it("事例７　高齢受給者入院・難病医療", () => {
    const covers = calcFutan(3, "現役並みⅢ", [KuniNanbyou],
      mkTen("H1", 90500),
      { gendogaku: { kingaku: 10000, kouhiBangou: 1 }, debug: false });
    expect(patientChargeOf(covers)).toBe(10000);
  });

  it("事例８　高齢受給者入院・難病医療（多数回該当）", () => {
    const covers = calcFutan(3, "現役並みⅢ", [KuniNanbyou],
      mkTens(["H1", 48200], ["H", 47100]),
      { gendogaku: { kingaku: 10000, kouhiBangou: 1 }, gendogakuTasuuGaitou: true, debug: false });
    expect(patientChargeOf(covers)).toBe(140100);
  });

  it("事例９　高齢受給者入院・難病医療", () => {
    const covers = calcFutan(3, "現役並みⅡ", [KuniNanbyou],
      mkTen("H1", 67100),
      { gendogaku: { kingaku: 10000, kouhiBangou: 1 }, debug: false });
    expect(patientChargeOf(covers)).toBe(10000);
  });

  it("事例１０　高齢受給者入院・難病医療（75歳到達月）（多数回該当）", () => {
    const covers = calcFutan(3, "現役並みⅡ", [KuniNanbyou],
      mkTens(["H1", 67100], ["H", 16599]),
      {
        isBirthdayMonth75: true,
        gendogaku: { kingaku: 10000, kouhiBangou: 1 },
        gendogakuTasuuGaitou: true,
        debug: false
      });
    expect(patientChargeOf(covers)).toBe(46500);
  });

  it("事例１１　高齢受給者入院・難病医療（多数回該当）", () => {
    const covers = calcFutan(3, "現役並みⅡ", [KuniNanbyou],
      mkTens(["H1", 35599], ["H", 2500]),
      {
        gendogaku: { kingaku: 10000, kouhiBangou: 1 },
        gendogakuTasuuGaitou: true,
        debug: false
      });
    expect(patientChargeOf(covers)).toBe(17500);
  });

  it("事例１２　高齢受給者入院・難病医療", () => {
    const covers = calcFutan(3, "現役並みⅠ", [KuniNanbyou],
      mkTens(["H1", 28900], ["H", 1200]),
      {
        gendogaku: { kingaku: 10000, kouhiBangou: 1 },
        debug: false
      });
    expect(patientChargeOf(covers)).toBe(13600);
  });

  it("事例１３　高齢受給者入院・難病医療（多数回該当）", () => {
    const covers = calcFutan(3, "現役並みⅠ", [KuniNanbyou],
      mkTens(["H1", 9800], ["H", 16800]),
      {
        gendogaku: { kingaku: 10000, kouhiBangou: 1 },
        gendogakuTasuuGaitou: true,
        debug: false
      });
    expect(patientChargeOf(covers)).toBe(44400);
  });

  it("事例１４　高齢受給者入院・難病医療（75歳到達月）（多数回該当）", () => {
    const covers = calcFutan(3, "現役並みⅠ", [KuniNanbyou],
      mkTens(["H1", 19900], ["H", 23300]),
      {
        gendogaku: { kingaku: 10000, kouhiBangou: 1 },
        gendogakuTasuuGaitou: true,
        isBirthdayMonth75: true,
        debug: false
      });
    expect(patientChargeOf(covers)).toBe(22200);
  });

  it("事例１５　高齢受給者入院・更生医療", () => {
    const covers = calcFutan(3, "現役並みⅡ", [KouhiKouseiIryou],
      mkTens(["H1", 44300]),
      {
        debug: false
      });
    expect(patientChargeOf(covers)).toBe(44300);
  });

  it("事例１６　高齢受給者入院・更生医療", () => {
    const covers = calcFutan(3, "現役並みⅠ", [KouhiKouseiIryou],
      mkTens(["H1", 20900], ["H", 500]),
      {
        debug: false
      });
    expect(patientChargeOf(covers)).toBe(22400);
  });

  it("事例１７　高齢受給者入院（特例措置対象者：生年月日が昭和19年4月1日以前）", () => {
    const covers = calcFutan(2, "一般", [],
      mkTens(["H", 34500]),
      {
        isKourei1WariShiteiKouhi: true,
        debug: false
      });
    expect(patientChargeOf(covers)).toBe(34500);
  });

  it("事例１８　高齢受給者入院（75歳到達月）（多数回該当）", () => {
    const covers = calcFutan(2, "一般", [],
      mkTens(["H", 13500]),
      {
        gendogakuTasuuGaitou: true,
        isBirthdayMonth75: true,
        isNyuuin: true,
        debug: false,
      });
    expect(patientChargeOf(covers)).toBe(22200);
  });

  it("事例１９　高齢受給者入院", () => {
    const covers = calcFutan(2, "低所得Ⅱ", [],
      mkTens(["H", 16700]),
      {
        isNyuuin: true,
        debug: false,
      });
    expect(patientChargeOf(covers)).toBe(24600);
  });

  it("事例２０　高齢受給者入院（75歳到達月）（特例措置対象者：生年月日が昭和19年4月1日以前）", () => {
    const covers = calcFutan(2, "低所得Ⅱ", [],
      mkTens(["H", 5500]),
      {
        isNyuuin: true,
        isBirthdayMonth75: true,
        isKourei1WariShiteiKouhi: true,
        debug: false,
      });
    expect(patientChargeOf(covers)).toBe(5500);
  });

  it("事例２１　高齢受給者入院・難病医療", () => {
    const covers = calcFutan(2, "一般", [KuniNanbyou],
      mkTens(["H1", 41300]),
      {
        isNyuuin: true,
        gendogaku: { kingaku: 10000, kouhiBangou: 1 },
        debug: false
      });
    expect(patientChargeOf(covers)).toBe(10000);
  });

  it("事例２２　高齢受給者入院・難病医療", () => {
    const covers = calcFutan(2, "一般", [KuniNanbyou],
      mkTens(["H1", 5500], ["H", 30000]),
      {
        isNyuuin: true,
        gendogaku: { kingaku: 10000, kouhiBangou: 1 },
        debug: false
      });
    expect(patientChargeOf(covers)).toBe(57600);
  });

  it("事例２３　高齢受給者入院・難病医療（75歳到達月）", () => {
    const covers = calcFutan(2, "一般", [KuniNanbyou],
      mkTens(["H1", 16500], ["H", 15500]),
      {
        isNyuuin: true,
        gendogaku: { kingaku: 10000, kouhiBangou: 1 },
        isBirthdayMonth75: true,
        debug: false
      });
    expect(patientChargeOf(covers)).toBe(28800);
  });

  it("事例２４　高齢受給者入院・難病医療（多数回該当）（特例措置対象者：生年月日が昭和19年4月1日以前）", () => {
    const covers = calcFutan(2, "一般", [KuniNanbyou],
      mkTens(["H1", 23100], ["H", 800]),
      {
        isNyuuin: true,
        gendogaku: { kingaku: 10000, kouhiBangou: 1 },
        isKourei1WariShiteiKouhi: true,
        debug: false
      });
    expect(patientChargeOf(covers)).toBe(10800);
  });

  it("事例２５　高齢受給者入院・難病医療（75歳到達月）（多数回該当）", () => {
    const covers = calcFutan(2, "一般", [KuniNanbyou],
      mkTens(["H1", 14500], ["H", 15100]),
      {
        isNyuuin: true,
        gendogaku: { kingaku: 10000, kouhiBangou: 1 },
        isBirthdayMonth75: true,
        gendogakuTasuuGaitou: true,
        debug: false
      });
    expect(patientChargeOf(covers)).toBe(22200);
  });

  it("事例２６　高齢受給者入院・難病医療", () => {
    const covers = calcFutan(2, "低所得Ⅰ", [KuniNanbyou],
      mkTens(["H1", 22800]),
      {
        isNyuuin: true,
        gendogaku: { kingaku: 5000, kouhiBangou: 1 },
        debug: false
      });
    expect(patientChargeOf(covers)).toBe(5000);
  });

  it("事例２７　高齢受給者入院・難病医療（特例措置対象者：生年月日が昭和19年4月1日以前）", () => {
    const covers = calcFutan(2, "低所得Ⅰ", [KuniNanbyou],
      mkTens(["H1", 15500], ["H", 2300]),
      {
        isNyuuin: true,
        gendogaku: { kingaku: 5000, kouhiBangou: 1 },
        isKourei1WariShiteiKouhi: true,
        debug: false
      });
    expect(patientChargeOf(covers)).toBe(7300);
  });

  it("事例２８　高齢受給者入院・難病医療（特例措置対象者：生年月日が昭和19年4月1日以前）", () => {
    const covers = calcFutan(2, "低所得Ⅱ", [KuniNanbyou],
      mkTens(["H1", 8900], ["H", 2600]),
      {
        isNyuuin: true,
        gendogaku: { kingaku: 5000, kouhiBangou: 1 },
        isKourei1WariShiteiKouhi: true,
        debug: false
      });
    expect(patientChargeOf(covers)).toBe(7600);
  });

  it("事例２９　高齢受給者入院・難病医療・生活保護", () => {
    const covers = calcFutan(2, "低所得Ⅱ", [KuniNanbyou, SeikatsuHogo()],
      mkTens(["H1", 15500], ["H2", 9000]),
      {
        isNyuuin: true,
        gendogaku: { kingaku: 0, kouhiBangou: 1 },
      });
    expect(patientChargeOf(covers)).toBe(0);
    expect(coveredBy("1", covers)).toBe(24600);
    expect(coveredBy("2", covers)).toBe(15000);
  });

  it("事例３０　高齢受給者入院・難病医療・生活保護", () => {
    const covers = calcFutan(2, "低所得Ⅰ", [KuniNanbyou, SeikatsuHogo()],
      mkTens(["H1", 9600], ["H2", 7800]),
      {
        isNyuuin: true,
        gendogaku: { kingaku: 0, kouhiBangou: 1 },
        debug: false
      });
    expect(patientChargeOf(covers)).toBe(0);
    expect(coveredBy("1", covers)).toBe(15000);
    expect(coveredBy("2", covers)).toBe(15000);
  });

  it("事例３１　高齢受給者外来", () => {
    const covers = calcFutan(3, "現役並みⅢ", [],
      mkTens(["H", 87300]),
      {
        debug: false
      });
    expect(patientChargeOf(covers)).toBe(252910);
  });

  it("事例３２　高齢受給者外来（75歳到達月）（多数回該当）", () => {
    const covers = calcFutan(3, "現役並みⅢ", [],
      mkTens(["H", 24800]),
      {
        isBirthdayMonth75: true,
        gendogakuTasuuGaitou: true,
        debug: false
      });
    expect(patientChargeOf(covers)).toBe(70050);
  });

  it("事例３３　高齢受給者外来（多数回該当）", () => {
    const covers = calcFutan(3, "現役並みⅡ", [],
      mkTens(["H", 34600]),
      {
        gendogakuTasuuGaitou: true,
        debug: false
      });
    expect(patientChargeOf(covers)).toBe(93000);
  });

  it("事例３４　高齢受給者外来", () => {
    const covers = calcFutan(3, "現役並みⅠ", [],
      mkTens(["H", 30300]),
      {
        debug: false
      });
    expect(patientChargeOf(covers)).toBe(80460);
  });

  it("事例３５　高齢受給者外来・難病医療（多数回該当）", () => {
    const covers = calcFutan(3, "現役並みⅢ", [KuniNanbyou],
      mkTens(["H1", 13500], ["H", 47000]),
      {
        gendogakuTasuuGaitou: true,
        gendogaku: { kingaku: 10000, kouhiBangou: 1 },
        debug: false
      });
    expect(patientChargeOf(covers)).toBe(140100);
  });

  it("事例３６　高齢受給者外来・難病医療（多数回該当）", () => {
    const covers = calcFutan(3, "現役並みⅡ", [KuniNanbyou],
      mkTens(["H1", 13500], ["H", 47000]),
      {
        gendogakuTasuuGaitou: true,
        gendogaku: { kingaku: 5000, kouhiBangou: 1 },
        debug: false
      });
    expect(patientChargeOf(covers)).toBe(93000);
  });

  it("事例３７　高齢受給者外来・難病医療", () => {
    const covers = calcFutan(3, "現役並みⅠ", [KuniNanbyou],
      mkTens(["H1", 31100]),
      {
        gendogaku: { kingaku: 10000, kouhiBangou: 1 },
      });
    expect(patientChargeOf(covers)).toBe(10000);
    expect(coveredBy("1", covers)).toBe(70540);
  });

  it("事例３８　高齢受給者外来・難病医療（多数回該当）", () => {
    const covers = calcFutan(3, "現役並みⅠ", [KuniNanbyou],
      mkTens(["H1", 1800], ["H", 18600]),
      {
        gendogaku: { kingaku: 3600, kouhiBangou: 1 },
        gendogakuTasuuGaitou: true,
      });
    expect(patientChargeOf(covers)).toBe(44400);
    expect(coveredBy("1", covers)).toBe(1800);
  });

  it("事例３９　高齢受給者外来", () => {
    const covers = calcFutan(2, "一般", [],
      mkTens(["H", 11000]),
      {
        gendogaku: { kingaku: 3600, kouhiBangou: 1 },
        gendogakuTasuuGaitou: true,
      });
    expect(patientChargeOf(covers)).toBe(18000);
  });

  it("事例４０　高齢受給者外来（特例措置対象者：生年月日が昭和19年4月1日以前）", () => {
    const covers = calcFutan(2, "一般", [],
      mkTens(["H", 9900]),
      {
        isKourei1WariShiteiKouhi: true,
      });
    expect(patientChargeOf(covers)).toBe(9900);
  });

  it("事例４１　高齢受給者外来（75歳到達月）（特例措置対象者：生年月日が昭和19年4月1日以前）", () => {
    const covers = calcFutan(2, "一般", [],
      mkTens(["H", 6300]),
      {
        isKourei1WariShiteiKouhi: true,
        isBirthdayMonth75: true,
      });
    expect(patientChargeOf(covers)).toBe(6300);
  });

  it("事例４２　高齢受給者外来（特例措置対象者：生年月日が昭和19年4月1日以前）", () => {
    const covers = calcFutan(2, "低所得Ⅱ", [],
      mkTens(["H", 4600]),
      {
        isKourei1WariShiteiKouhi: true,
      });
    expect(patientChargeOf(covers)).toBe(4600);
  });

  it("事例４３　高齢受給者外来", () => {
    const covers = calcFutan(2, "低所得Ⅰ", [],
      mkTens(["H", 5100]),
      {
      });
    expect(patientChargeOf(covers)).toBe(8000);
  });

  it("事例４４　高齢受給者外来・難病医療", () => {
    const covers = calcFutan(2, "一般", [KuniNanbyou],
      mkTens(["H1", 9500]),
      {
        gendogaku: { kingaku: 5000, kouhiBangou: 1 },
      });
    expect(patientChargeOf(covers)).toBe(5000);
    expect(coveredBy("1", covers)).toBe(13000);
  });

  it("事例４５　高齢受給者外来・難病医療", () => {
    const covers = calcFutan(2, "一般", [KuniNanbyou],
      mkTens(["H1", 5500], ["H", 10000]),
      {
        gendogaku: { kingaku: 5000, kouhiBangou: 1 },
      });
    expect(patientChargeOf(covers)).toBe(18000);
    expect(coveredBy("1", covers)).toBe(6000);
  });

  it("事例４６　高齢受給者外来・難病医療（特例措置対象者：生年月日が昭和19年4月1日以前）", () => {
    const covers = calcFutan(2, "一般", [KuniNanbyou],
      mkTens(["H1", 9800], ["H", 11800]),
      {
        gendogaku: { kingaku: 5000, kouhiBangou: 1 },
        isKourei1WariShiteiKouhi: true,
      });
    expect(coveredBy("1", covers)).toBe(13000);
    expect(patientChargeOf(covers)).toBe(16800);
  });

  it("事例４７　高齢受給者外来・難病医療（75歳到達月）", () => {
    const covers = calcFutan(2, "一般", [KuniNanbyou],
      mkTens(["H1", 9800]),
      {
        gendogaku: { kingaku: 5000, kouhiBangou: 1 },
        isBirthdayMonth75: true,
      });
    expect(coveredBy("1", covers)).toBe(4000);
    expect(patientChargeOf(covers)).toBe(5000);
  });

  it("事例４８　高齢受給者外来・難病医療", () => {
    const covers = calcFutan(2, "一般", [KuniNanbyou],
      mkTens(["H1", 12000], ["H", 1200]),
      {
        gendogaku: { kingaku: 5000, kouhiBangou: 1 },
      });
    expect(coveredBy("1", covers)).toBe(13000);
    expect(patientChargeOf(covers)).toBe(7400);
  });

  it("事例４９　高齢受給者外来・難病医療", () => {
    const covers = calcFutan(2, "一般", [KuniNanbyou],
      mkTens(["H1", 12400], ["H", 9600]),
      {
        gendogaku: { kingaku: 5000, kouhiBangou: 1 },
      });
    expect(coveredBy("1", covers)).toBe(13000);
    expect(patientChargeOf(covers)).toBe(18000);
  });

  it("事例５０　高齢受給者外来・難病医療（75歳到達月）", () => {
    const covers = calcFutan(2, "一般", [KuniNanbyou],
      mkTens(["H1", 5100], ["H", 7400]),
      {
        gendogaku: { kingaku: 5000, kouhiBangou: 1 },
        isBirthdayMonth75: true,
      });
    expect(coveredBy("1", covers)).toBe(4000);
    expect(patientChargeOf(covers)).toBe(9000);
  });

  it("事例５１　高齢受給者外来・更生医療", () => {
    const covers = calcFutan(2, "一般", [KouhiKouseiIryou],
      mkTens(["H1", 10800]),
      {
      });
    expect(coveredBy("1", covers)).toBe(7200);
    expect(patientChargeOf(covers)).toBe(10800);
  });

  it("事例５２　高齢受給者外来・更生医療", () => {
    const covers = calcFutan(2, "一般", [KouhiKouseiIryou],
      mkTens(["H1", 16400], ["H", 11400]),
      {
      });
    expect(coveredBy("1", covers)).toBe(1600);
    expect(patientChargeOf(covers)).toBe(18000);
  });

  it("事例５３　高齢受給者外来・精神通院（特例措置対象者：生年月日が昭和19年4月1日以前）", () => {
    const covers = calcFutan(2, "一般", [KuniSeishinTsuuin],
      mkTens(["H1", 4300], ["H", 9600]),
      {
        isKourei1WariShiteiKouhi: true,
      });
    expect(coveredBy("1", covers)).toBe(4300);
    expect(patientChargeOf(covers)).toBe(13900);
  });

  it("事例５４　高齢受給者外来・精神通院（特例措置対象者：生年月日が昭和19年4月1日以前）", () => {
    const covers = calcFutan(2, "一般", [KuniSeishinTsuuin],
      mkTens(["H1", 9500], ["H", 400]),
      {
        isKourei1WariShiteiKouhi: true,
      });
    expect(coveredBy("1", covers)).toBe(8500);
    expect(patientChargeOf(covers)).toBe(9900);
  });

  it("事例５５　高齢受給者外来・精神通院（特例措置対象者：生年月日が昭和19年4月1日以前）", () => {
    const covers = calcFutan(2, "一般", [KuniSeishinTsuuin],
      mkTens(["H1", 9300], ["H", 5100]),
      {
        isKourei1WariShiteiKouhi: true,
      });
    expect(coveredBy("1", covers)).toBe(8700);
    expect(patientChargeOf(covers)).toBe(14400);
  });

  it("事例５６　高齢受給者外来・難病医療・生活保護", () => {
    const covers = calcFutan(2, "低所得Ⅰ", [KuniNanbyou, SeikatsuHogo()],
      mkTens(["H1", 4800], ["H2", 4500]),
      {
        gendogaku: { kingaku: 0, kouhiBangou: 1 },
      });
    expect(coveredBy("1", covers)).toBe(8000);
    expect(patientChargeOf(covers)).toBe(0);
  });

});

