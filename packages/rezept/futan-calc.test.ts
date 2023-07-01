import { 負担区分コード, type 負担区分コードCode, type 負担区分コードName } from "./codes";
import { calcFutan, sortFutanKubun, TotalCover, type HokenSelector } from "./futan-calc";
import { MaruAoNoFutan, MarutoHibakushaNoKo, MarutoNanbyou, MaruToTaikiosen } from "./kouhi-registry";

function mkTens(...items: [負担区分コードName, number][]): Map<負担区分コードCode, number> {
  return new Map(items.map(([kubunName, ten]) => [負担区分コード[kubunName], ten]));
}

const round = Math.round;

function patientChargeOf(totalCover: TotalCover): number {
  return round(totalCover.patientCharge);
}

function coveredBy(sel: HokenSelector, totalCover: TotalCover): number {
  return totalCover.slot.kakariOf(sel) - totalCover.slot.patientChargeOf(sel);
}

describe("futan-calc", () => {
  it("should sort futan kubun", () => {
    let futanKubuns: 負担区分コードCode[] = ["1", "2"];
    futanKubuns = sortFutanKubun(futanKubuns);
    expect(futanKubuns).toEqual(["2", "1"]);
  })

  it("should handle single visit hoken only", () => {
    const totalTen = 300;
    const futanWari = 3;
    const covers = calcFutan(futanWari, undefined, [],
      mkTens(["H", totalTen]),
      {});
    expect(patientChargeOf(covers)).toBe(totalTen * futanWari);
  });

  it("should handle gendogaku of ウ under 70", () => {
    const covers = calcFutan(3, "ウ", [],
      mkTens(["H", 100000])
    );
    expect(patientChargeOf(covers)).toBe(87430);
  });

  it("should handle gendogaku of ウ under 70 (case 2)", () => {
    const covers = calcFutan(3, "ウ", [],
      mkTens(["H", 80000])
    );
    expect(patientChargeOf(covers)).toBe(85430);
  });

  it("should handle gendogaku of ウ under 70 (case 3)", () => {
    const covers = calcFutan(3, "ウ", [],
      mkTens(["H", 26600])
    );
    expect(patientChargeOf(covers)).toBe(79800);
  });

  it("should handle gendogaku of 現役並みⅢ", () => {
    const covers = calcFutan(3, "現役並みⅢ", [],
      mkTens(["H", 100000])
    );
    expect(patientChargeOf(covers)).toBe(254180);
  });

  it("should handle gendogaku of 配慮措置", () => {
    const covers = calcFutan(2, "一般Ⅱ", [],
      mkTens(["H", 8000])
    );
    expect(patientChargeOf(covers)).toBe(11000);
  });

  it("should handle gendogaku of 配慮措置 (case 2)", () => {
    const covers = calcFutan(2, "一般Ⅱ", [],
      mkTens(["H", 13000])
    );
    expect(patientChargeOf(covers)).toBe(16000);
  });

  it("should handle gendogaku of 配慮措置 at birthday month", () => {
    const covers = calcFutan(2, "一般Ⅱ", [],
      mkTens(["H", 10000])
      , { isBirthdayMonth75: true });
    expect(patientChargeOf(covers)).toBe(9000);
  });

  it("should handle gendogaku of 配慮措置 at birthday month (case 2)", () => {
    const covers = calcFutan(2, "一般Ⅱ", [],
      mkTens(["H", 4000])
      , { isBirthdayMonth75: true });
    expect(patientChargeOf(covers)).toBe(7000);
  });

  it("should handle 公費 被爆者の子", () => {
    const totalTen = 400;
    const futanWari = 3;
    const covers = calcFutan(futanWari, undefined, [MarutoHibakushaNoKo],
      mkTens(["H1", totalTen])
    );
    expect(patientChargeOf(covers)).toBe(0);
    expect(coveredBy("1", covers)).toBe(1200);
  });

  it("should handle 公費 マル青負担なし", () => {
    const totalTen = 400;
    const futanWari = 3;
    const covers = calcFutan(futanWari, undefined, [MaruAoNoFutan],
      mkTens(["H1", totalTen])
    );
    expect(patientChargeOf(covers)).toBe(0);
    expect(coveredBy("1", covers)).toBe(1200);
  });

  it("should handle 公費 大気汚染", () => {
    const totalTen = 400;
    const futanWari = 3;
    const covers = calcFutan(futanWari, undefined, [MaruToTaikiosen(6000)],
      mkTens(["H1", totalTen])
    );
    expect(patientChargeOf(covers)).toBe(1200);
  });

  it("should handle 公費 大気汚染 限度額到達", () => {
    const totalTen = 4000;
    const futanWari = 3;
    const covers = calcFutan(futanWari, undefined, [MaruToTaikiosen(6000)],
      mkTens(["H1", totalTen])
    );
    expect(patientChargeOf(covers)).toBe(6000);
    expect(coveredBy("1", covers)).toBe(6000);
  });

  it("should handle 公費 マル都 難病", () => {
    const totalTen = 800;
    const futanWari = 3;
    const covers = calcFutan(futanWari, undefined, [MarutoNanbyou],
      mkTens(["H1", totalTen]),
    );
    expect(patientChargeOf(covers)).toBe(totalTen * 2);
    expect(coveredBy("1", covers)).toBe(800);
  });

  it("should handle 公費 マル都 難病 (gendo applied)", () => {
    const totalTen = 4000;
    const futanWari = 3;
    const covers = calcFutan(futanWari, undefined, [MarutoNanbyou],
      mkTens(["H1", totalTen]),
      { gendogaku: { kingaku: 6000, kouhiBangou: 1 } });
    expect(patientChargeOf(covers)).toBe(6000);
    expect(coveredBy("1", covers)).toBe(6000);
  });

  it("should handle マル長", () => {
    const totalTen = 28000;
    const futanWari = 3;
    const covers = calcFutan(futanWari, undefined, [],
      mkTens(["H", totalTen]),
      { marucho: 10000 });
    expect(patientChargeOf(covers)).toBe(10000);
  });

  it("should handle 難病", () => {
    const totalTen = 4000;
    const futanWari = 2;
    const covers = calcFutan(futanWari, "一般Ⅱ", [MarutoNanbyou],
      mkTens(["H", 1000], ["H1", 3000]),
      { gendogaku: { kingaku: 5000, kouhiBangou: 1 } });
    expect(patientChargeOf(covers)).toBe(7000);
    expect(coveredBy("1", covers)).toBe(1000);
  });

  it("should handle 難病 (case 2)", () => {
    const totalTen = 9000;
    const futanWari = 2;
    const covers = calcFutan(futanWari, "一般Ⅱ", [MarutoNanbyou],
      mkTens(["H1", 4000], ["H", 5000]),
      { gendogaku: { kingaku: 5000, kouhiBangou: 1 } });
    expect(patientChargeOf(covers)).toBe(13000);
    expect(coveredBy("1", covers)).toBe(3000);
  });

});
