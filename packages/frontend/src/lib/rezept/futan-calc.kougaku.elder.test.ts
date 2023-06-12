import { 負担区分コード, type 負担区分コードCode, type 負担区分コードName } from "./codes";
import { calcFutan, KouhiKekkaku, KouhiKouseiIryou, KuniNanbyou, MarutoNanbyou, TotalCover } from "./futan-calc";

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

});

