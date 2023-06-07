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
  it("should calc simple", () => {
    const covers = calcFutan(3, undefined, [], [mkTotalTensMap(["H", 300])]);
    expect(covers.patientCharge).equal(900);
    expect(summarize(covers)).deep.equal([["H", {
      hokenCover: { kakari: 3000, patientCharge: 900, futanWari: 3},
      kouhiCovers: [],
    }]])
  })
});
