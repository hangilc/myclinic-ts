import { optionMap } from "../option";
import { 負担区分コード, 負担区分コードNameOf, type 負担区分コードCode, type 負担区分コードName } from "./codes";
import { calcFutan, TotalCover } from "./futan-calc";

function mkTens(...items: [負担区分コードName, number][]): Map<負担区分コードCode, number> {
  return new Map(items.map(([kubunName, ten]) => [負担区分コード[kubunName], ten]));
}

function mkTen(futanCodeName: 負担区分コードName, ten: number): Map<負担区分コードCode, number> {
  return mkTens([futanCodeName, ten]);
}

function rep(totalCover: TotalCover): any {
  const futanCodeNames = Array.from(totalCover.map.keys())
    .map(c => 負担区分コードNameOf(c)!)
    .sort()
    .reverse();
  return futanCodeNames.map(fn => {
    const futanCode = 負担区分コード[fn];
    const slot = totalCover.map.get(futanCode)!;
    const hokenCover = optionMap(slot.hokenCover, c => {
      return { kakari: c.kakari, charge: c.patientCharge }
    })
    return [fn, hokenCover, ];
  });
}

describe("高額療養費", () => {
  it("should handle simple case", () => {
    const covers = calcFutan(3, "ア", [], [
      mkTen("H", 87300),
    ]);
    expect(rep(covers)).deep.equal([
      ["H", { kakari: 873000, charge: 252910 }]
    ])
    assert(true);
  });
});