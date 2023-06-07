import { compare負担区分コードName, 負担区分コード, 負担区分コードNameOf, type 負担区分コードCode, type 負担区分コードName } from "./codes";
import { calcFutan, Slot, TotalCover } from "./futan-calc";

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
    const covers = calcFutan(3, undefined, [], [mkTotalTensMap(["H", 300])]);
    expect(covers.patientCharge).equal(900);
    expect(summarize(covers)).deep.equal([["H", {
      hokenCover: { kakari: 3000, patientCharge: 900, futanWari: 3},
      kouhiCovers: [],
    }]])
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
    }]])
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
    ])
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
    ])
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
    ])
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
    ])
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
    ])
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
    ])
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
    ])
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
    ])
  });
});
