import { compare負担区分コードName, 負担区分コード, 負担区分コードNameOf, type 負担区分コードCode, type 負担区分コードName } from "./codes";
import { calcFutan, HibakushaNoKo, MaruAoNoFutan, MaruToTaikiosen, Slot, TotalCover } from "./futan-calc";

function mkTotalTensMap(...items: [負担区分コードName, number][]): Map<負担区分コードCode, number> {
  return new Map(items.map(([kubunName, ten]) => [負担区分コード[kubunName], ten]));
}

function summarizeObject(obj: any): any {
  const result: Record<any, any> = {};
  for(let key in obj){
    const val = obj[key];
    if( val !== undefined ){
      result[key] = val;
    }
  }
  return result;
}

function summarizeSlot(slot: Slot): any {
  return summarizeObject({
    hokenCover: summarizeObject(slot.hokenCover),
    kouhiCovers: slot.kouhiCovers.map(summarizeObject),
  });
}

function summarize(totalCover: TotalCover): any {
  const entries: [負担区分コードName, any][] = Array.from(totalCover.map.entries())
    .map(([code, slot]) => [負担区分コードNameOf(code), summarizeSlot(slot)]);
  entries.sort((a, b) => compare負担区分コードName(a[0], b[0]));
  return entries;
}

function dumpJson(arg: any): void {
  console.log(JSON.stringify(arg, undefined, 2));
}

describe("futan-calc", () => {
  it("should handle single visit hoken only", () => {
    const totalTen = 300;
    const futanWari = 3;
    const covers = calcFutan(futanWari, undefined, [], [mkTotalTensMap(["H", totalTen])]);
    expect(covers.patientCharge).equal(totalTen * futanWari);
    expect(summarize(covers)).deep.equal([["H", {
      hokenCover: { kakari: totalTen * 10, patientCharge: totalTen * futanWari, futanWari},
      kouhiCovers: [],
    }]]);
    expect(covers.patientCharge).equal(totalTen * futanWari);
  });

  it("should handle two visits hoken only", () => {
    const covers = calcFutan(3, undefined, [], [
      mkTotalTensMap(["H", 300]),
      mkTotalTensMap(["H", 900]),
    ]);
    expect(covers.patientCharge).equal(3600);
    expect(summarize(covers)).deep.equal([["H", {
      hokenCover: { kakari: 12000, patientCharge: 3600, futanWari: 3},
      kouhiCovers: [],
    }]]);
    expect(covers.patientCharge).equal(3600);
  });

  it("should handle gendogaku of ウ under 70", () => {
    const covers = calcFutan(3, "ウ", [], [
      mkTotalTensMap(["H", 100000])
    ]);
    expect(summarize(covers)).deep.equal([
      ["H", { 
        hokenCover: { kakari: 1000000, patientCharge: 87430, futanWari: 3, gendogakuReached: true},
        kouhiCovers: [],
      }]
    ]);
    expect(covers.patientCharge).equal(87430);
  });

  it("should handle gendogaku of ウ under 70 (case 2)", () => {
    const covers = calcFutan(3, "ウ", [], [
      mkTotalTensMap(["H", 80000])
    ]);
    expect(summarize(covers)).deep.equal([
      ["H", { 
        hokenCover: { kakari: 800000, patientCharge: 85430, futanWari: 3, gendogakuReached: true},
        kouhiCovers: [],
      }]
    ]);
    expect(covers.patientCharge).equal(85430);
  });

  it("should handle gendogaku of ウ under 70 (case 3)", () => {
    const covers = calcFutan(3, "ウ", [], [
      mkTotalTensMap(["H", 26600])
    ]);
    expect(summarize(covers)).deep.equal([
      ["H", { 
        hokenCover: { kakari: 266000, patientCharge: 79800, futanWari: 3},
        kouhiCovers: [],
      }]
    ]);
    expect(covers.patientCharge).equal(79800);
  });

  it("should handle gendogaku of 現役並みⅢ", () => {
    const covers = calcFutan(3, "現役並みⅢ", [], [
      mkTotalTensMap(["H", 100000])
    ]);
    expect(summarize(covers)).deep.equal([
      ["H", { 
        hokenCover: { kakari: 1000000, patientCharge: 254180, futanWari: 3, gendogakuReached: true},
        kouhiCovers: [],
      }]
    ]);
    expect(covers.patientCharge).equal(254180);
  });

  it("should handle gendogaku of 配慮措置", () => {
    const covers = calcFutan(2, "一般Ⅱ", [], [
      mkTotalTensMap(["H", 8000])
    ]);
    expect(summarize(covers)).deep.equal([
      ["H", { 
        hokenCover: { kakari: 80000, patientCharge: 11000, futanWari: 2, gendogakuReached: true},
        kouhiCovers: [],
      }]
    ]);
    expect(covers.patientCharge).equal(11000);
  });

  it("should handle gendogaku of 配慮措置 (case 2)", () => {
    const covers = calcFutan(2, "一般Ⅱ", [], [
      mkTotalTensMap(["H", 13000])
    ]);
    expect(summarize(covers)).deep.equal([
      ["H", { 
        hokenCover: { kakari: 130000, patientCharge: 16000, futanWari: 2, gendogakuReached: true},
        kouhiCovers: [],
      }]
    ]);
    expect(covers.patientCharge).equal(16000);
  });

  it("should handle gendogaku of 配慮措置 at birthday month", () => {
    const covers = calcFutan(2, "一般Ⅱ", [], [
      mkTotalTensMap(["H", 10000])
    ], { isBirthdayMonth75: true });
    expect(summarize(covers)).deep.equal([
      ["H", { 
        hokenCover: { kakari: 100000, patientCharge: 9000, futanWari: 2, gendogakuReached: true},
        kouhiCovers: [],
      }]
    ]);
    expect(covers.patientCharge).equal(9000);
  });

  it("should handle gendogaku of 配慮措置 at birthday month (case 2)", () => {
    const covers = calcFutan(2, "一般Ⅱ", [], [
      mkTotalTensMap(["H", 4000])
    ], { isBirthdayMonth75: true });
    expect(summarize(covers)).deep.equal([
      ["H", { 
        hokenCover: { kakari: 40000, patientCharge: 7000, futanWari: 2, gendogakuReached: true},
        kouhiCovers: [],
      }]
    ]);
    expect(covers.patientCharge).equal(7000);
  });

  it("should handle 公費 被爆者の子", () => {
    const totalTen = 400;
    const futanWari = 3;
    const covers = calcFutan(futanWari, undefined, [HibakushaNoKo], [
      mkTotalTensMap(["H1", totalTen])
    ]);
    expect(summarize(covers)).deep.equal([
      ["H1", { 
        hokenCover: { kakari: totalTen * 10, patientCharge: 1200, futanWari},
        kouhiCovers: [
          { kakari: 1200, patientCharge: 0, }
        ],
      }]
    ]);
    expect(covers.patientCharge).equal(0);
  });

  it("should handle 公費 マル青負担なし", () => {
    const totalTen = 400;
    const futanWari = 3;
    const covers = calcFutan(futanWari, undefined, [MaruAoNoFutan], [
      mkTotalTensMap(["H1", totalTen])
    ]);
    expect(summarize(covers)).deep.equal([
      ["H1", { 
        hokenCover: { kakari: totalTen * 10, patientCharge: 1200, futanWari},
        kouhiCovers: [
          { kakari: 1200, patientCharge: 0, }
        ],
      }]
    ]);
    expect(covers.patientCharge).equal(0);
  });

  it("should handle 公費 大気汚染", () => {
    const totalTen = 400;
    const futanWari = 3;
    const covers = calcFutan(futanWari, undefined, [MaruToTaikiosen(6000)], [
      mkTotalTensMap(["H1", totalTen])
    ]);
    expect(summarize(covers)).deep.equal([
      ["H1", { 
        hokenCover: { kakari: totalTen * 10, patientCharge: 1200, futanWari},
        kouhiCovers: [
          { kakari: 1200, patientCharge: 1200, }
        ],
      }]
    ]);
    expect(covers.patientCharge).equal(1200);
  });

  it("should handle 公費 大気汚染 限度額到達", () => {
    const totalTen = 4000;
    const futanWari = 3;
    const covers = calcFutan(futanWari, undefined, [MaruToTaikiosen(6000)], [
      mkTotalTensMap(["H1", totalTen])
    ]);
    expect(summarize(covers)).deep.equal([
      ["H1", { 
        hokenCover: { kakari: totalTen * 10, patientCharge: 12000, futanWari},
        kouhiCovers: [
          { kakari: 12000, patientCharge: 6000, gendogakuReached: true }
        ],
      }]
    ]);
    expect(covers.patientCharge).equal(6000);
  });

  it("should handle 公費 大気汚染 限度額到達 multiple visits", () => {
    const totalTens = [1000, 3000, 2000];
    const totalTensSum = totalTens.reduce((a, b) => a + b, 0);
    const futanWari = 3;
    const covers = calcFutan(futanWari, undefined, [MaruToTaikiosen(6000)], [
      ...totalTens.map(totalTen => mkTotalTensMap(["H1", totalTen]))
    ]);
    expect(summarize(covers)).deep.equal([
      ["H1", { 
        hokenCover: { kakari: totalTensSum * 10, patientCharge: totalTensSum * futanWari, futanWari},
        kouhiCovers: [
          { kakari: totalTensSum * futanWari, patientCharge: 6000, gendogakuReached: true }
        ],
      }]
    ]);
    expect(covers.patientCharge).equal(6000);
  });
});
