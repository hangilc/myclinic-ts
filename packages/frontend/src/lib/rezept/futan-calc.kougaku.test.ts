import { optionMap } from "../option";
import { 負担区分コード, 負担区分コードNameOf, type 負担区分コードCode, type 負担区分コードName } from "./codes";
import { AllHokenSelectors, calcFutan, KouhiKekkaku, MarutoNanbyou, TotalCover } from "./futan-calc";

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

// 高額療養費の自己負担限度額の 見直しに係る計算事例 （平成27年1月）による
describe("高額療養費（70歳未満）", () => {
  it("事例1　本人入院（標準報酬月額83万円以上）", () => {
    const covers = calcFutan(3, "ア", [], [
      mkTen("H", 8800),
    ], { });
    expect(patientChargeOf(covers)).equal(26400);
  });

  it("事例2　本人入院（標準報酬月額83万円以上）", () => {
    const covers = calcFutan(3, "ア", [], [
      mkTen("H", 94576),
    ], { });
    expect(patientChargeOf(covers)).equal(253638);
  });

  it("事例3　本人入院（標準報酬月額53万～79万円）", () => {
    const covers = calcFutan(3, "イ", [], [
      mkTen("H", 72641 ), 
    ], { });
    expect(patientChargeOf(covers)).equal(169084);
  });

  it("事例4　本人入院（標準報酬月額28万～50万円）", () => {
    const covers = calcFutan(3, "ウ", [], [
      mkTen("H", 36452 ), 
    ], { });
    expect(patientChargeOf(covers)).equal(81075);
  });

  it("事例5　本人入院（標準報酬月額26万円以下）", () => {
    const covers = calcFutan(3, "エ", [], [
      mkTen("H", 21635 ), 
    ], { });
    expect(patientChargeOf(covers)).equal(57600);
  });

  it("事例6　本人入院（低所得者）", () => {
    const covers = calcFutan(3, "オ", [], [
      mkTen("H", 18795 ), 
    ], { });
    expect(patientChargeOf(covers)).equal(35400);
  });

  it("事例7　本人入院（標準報酬月額83万円以上）（多数回該当）", () => {
    const covers = calcFutan(3, "ア", [], [
      mkTen("H", 94576),
    ], { gendogakuTasuuGaitou: true });
    expect(patientChargeOf(covers)).equal(140100);
  });

  it("事例8　本人入院（標準報酬月額53万～79万円）（多数回該当）", () => {
    const covers = calcFutan(3, "イ", [], [
      mkTen("H", 72641 ), 
    ], { gendogakuTasuuGaitou: true });
    expect(patientChargeOf(covers)).equal(93000);
  });

  it("事例9　本人入院（標準報酬月額28万～50万円）（多数回該当）", () => {
    const covers = calcFutan(3, "ウ", [], [
      mkTen("H", 36452 ), 
    ], { gendogakuTasuuGaitou: true });
    expect(patientChargeOf(covers)).equal(44400);
  });

  it("事例10　本人入院（標準報酬月額26万円以下）（多数回該当）", () => {
    const covers = calcFutan(3, "エ", [], [
      mkTen("H", 21635 ), 
    ], { gendogakuTasuuGaitou: true });
    expect(patientChargeOf(covers)).equal(44400);
  });

  it("事例11　本人入院（低所得者）（多数回該当）", () => {
    const covers = calcFutan(3, "オ", [], [
      mkTen("H", 18795 ), 
    ], { gendogakuTasuuGaitou: true });
    expect(patientChargeOf(covers)).equal(24600);
  });

  it("事例12　本人入院（長）", () => {
    const covers = calcFutan(3, "ウ", [], [
      mkTen("H", 17500 ), 
    ], { marucho: 10000 });
    expect(patientChargeOf(covers)).equal(10000);
  });

  it("事例13　本人入院（標準報酬月額83万円以上）・公費（結核患者の適正医療）", () => {
    const covers = calcFutan(3, "ア", [KouhiKekkaku], [
      mkTens(
        ["H1", 6000], ["H", 9000]
      ) 
    ]);
    expect(patientChargeOf(covers)).equal(30000);
  });

  it("事例14　本人入院（標準報酬月額83万円以上）・公費（結核患者の適正医療）", () => {
    const covers = calcFutan(3, "ア", [KouhiKekkaku], [
      mkTens(
        ["H1", 85000], ["H", 5000]
      ) 
    ], { debug: true });
    expect(patientChargeOf(covers)).equal(57500);
  });


});

