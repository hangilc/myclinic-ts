import { 負担区分コード, type 負担区分コードCode, type 負担区分コードName } from "./codes";
import { calcFutan, KouhiKekkaku, KouhiKouseiIryou, MarutoNanbyou, TotalCover } from "./futan-calc";

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

});