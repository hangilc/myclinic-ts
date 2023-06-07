import { 負担区分コード, 負担区分コードNameOf, type 負担区分コードCode, type 負担区分コードName } from "./codes";
import { calcFutan, TotalCover } from "./futan-calc";

function mkTotalTensMap(...items: [負担区分コードName, number][]): Map<負担区分コードCode, number> {
  return new Map(items.map(([kubunName, ten]) => [負担区分コード[kubunName], ten]));
}

function summary(totalCover: TotalCover): any {
  const names = Array.from(totalCover.map.keys()).map(code => 負担区分コードNameOf(code)).sort();
}

describe("futan-calc", () => {
  it("should calc simple", () => {
    const covers = calcFutan(3, undefined, [], [mkTotalTensMap(["H", 300])]);
    expect(covers.patientCharge).equal(900);
    expect()
  })
});
