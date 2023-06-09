import { truncate } from "fs";
import { optionMap } from "../option";
import { 負担区分コード, 負担区分コードNameOf, type 負担区分コードCode, type 負担区分コードName } from "./codes";
import { calcFutan, MarutoNanbyou, TotalCover } from "./futan-calc";

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
    const kouhiCovers = slot.kouhiCovers.map(c => c === undefined ? "undefined" : ({
      kakari: c.kakari,
      charge: c.patientCharge,
    }))
    return [fn, hokenCover, kouhiCovers];
  });
}

function dumpJson(arg: any): void {
  console.log(JSON.stringify(arg, undefined, 2));
}

describe("高額療養費", () => {
  it.only("should handle 事例1　本人入院（標準報酬月額83万円以上）", () => {
    const covers = calcFutan(3, "ア", [], [
      mkTen("H", 8800),
    ], { });
    expect(rep(covers)).deep.equal([
      ["H", { kakari: 88000, charge: 26400 }, []]
    ])
  });



  it("should handle 事例2　本人入院外（一般所得）", () => {
    const covers = calcFutan(3, "一般", [], [
      mkTen("H", 30000),
    ], { });
    expect(rep(covers)).deep.equal([
      ["H", { kakari: 300000, charge: 80430 }, []]
    ])
  });

  it("should handle simple case", () => {
    const covers = calcFutan(3, "ア", [], [
      mkTen("H", 87300),
    ], { });
    expect(rep(covers)).deep.equal([
      ["H", { kakari: 873000, charge: 252910 }, []]
    ])
  });

  it("should handle ７５歳到達月、多数該当", () => {
    const covers = calcFutan(3, "ア", [], [
      mkTen("H", 24800)
    ], { gendogakuTasuuGaitou: true, isBirthdayMonth75: true });
    expect(rep(covers)).deep.equal([
      ["H", { kakari: 248000, charge: 70050 }, []]
    ])
  });

  it("should handle 多数該当", () => {
    const covers = calcFutan(3, "イ", [], [
      mkTen("H", 34600),
    ], { gendogakuTasuuGaitou: true });
    expect(rep(covers)).deep.equal([
      ["H", { kakari: 346000, charge: 93000 }, []]
    ])
  });

  it("should handle 難病、多数該当", () => {
    const covers = calcFutan(3, "ア", [MarutoNanbyou], [
      mkTens(
        ["H1", 13500],
        ["H", 47000],
      )
    ], { gendogaku: { kingaku: 10000, kouhiBangou: 1 }, gendogakuTasuuGaitou: true, debug: false });
    console.log(dumpJson(rep(covers)));
    expect(rep(covers)).deep.equal([
      ["H1", { kakari: 135000, charge: 10000 }, [{ kakari: 100}]],
      ["H", { kakari: 470000, charge: 140000}]
    ])
  });
});