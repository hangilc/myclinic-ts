export {}
// import { 負担区分コード, type 負担区分コードCode, type 負担区分コードName } from "./codes";
// import { calcFutan, TotalCover } from "./futan-calc";
// import { KouhiKekkaku, KouhiKouseiIryou } from "./kouhi-registry";

// function mkTens(...items: [負担区分コードName, number][]): Map<負担区分コードCode, number> {
//   return new Map(items.map(([kubunName, ten]) => [負担区分コード[kubunName], ten]));
// }

// function mkTen(futanCodeName: 負担区分コードName, ten: number): Map<負担区分コードCode, number> {
//   return mkTens([futanCodeName, ten]);
// }

// const round = Math.round;

// function patientChargeOf(totalCover: TotalCover): number {
//   return round(totalCover.patientCharge);
// }

// // 高額療養費の自己負担限度額の 見直しに係る計算事例 （平成27年1月）による
// describe("高額療養費（70歳未満）", () => {
//   it("事例1　本人入院（標準報酬月額83万円以上）", () => {
//     const covers = calcFutan(3, "ア", [],
//       mkTen("H", 8800),
//       {});
//     expect(patientChargeOf(covers)).toBe(26400);
//   });

//   it("事例2　本人入院（標準報酬月額83万円以上）", () => {
//     const covers = calcFutan(3, "ア", [],
//       mkTen("H", 94576),
//       {});
//     expect(patientChargeOf(covers)).toBe(253638);
//   });

//   it("事例3　本人入院（標準報酬月額53万～79万円）", () => {
//     const covers = calcFutan(3, "イ", [],
//       mkTen("H", 72641),
//       {});
//     expect(patientChargeOf(covers)).toBe(169084);
//   });

//   it("事例4　本人入院（標準報酬月額28万～50万円）", () => {
//     const covers = calcFutan(3, "ウ", [],
//       mkTen("H", 36452),
//       {});
//     expect(patientChargeOf(covers)).toBe(81075);
//   });

//   it("事例5　本人入院（標準報酬月額26万円以下）", () => {
//     const covers = calcFutan(3, "エ", [],
//       mkTen("H", 21635),
//       {});
//     expect(patientChargeOf(covers)).toBe(57600);
//   });

//   it("事例6　本人入院（低所得者）", () => {
//     const covers = calcFutan(3, "オ", [],
//       mkTen("H", 18795),
//       {});
//     expect(patientChargeOf(covers)).toBe(35400);
//   });

//   it("事例7　本人入院（標準報酬月額83万円以上）（多数回該当）", () => {
//     const covers = calcFutan(3, "ア", [],
//       mkTen("H", 94576),
//       { gendogakuTasuuGaitou: true });
//     expect(patientChargeOf(covers)).toBe(140100);
//   });

//   it("事例8　本人入院（標準報酬月額53万～79万円）（多数回該当）", () => {
//     const covers = calcFutan(3, "イ", [],
//       mkTen("H", 72641),
//       { gendogakuTasuuGaitou: true });
//     expect(patientChargeOf(covers)).toBe(93000);
//   });

//   it("事例9　本人入院（標準報酬月額28万～50万円）（多数回該当）", () => {
//     const covers = calcFutan(3, "ウ", [],
//       mkTen("H", 36452),
//       { gendogakuTasuuGaitou: true });
//     expect(patientChargeOf(covers)).toBe(44400);
//   });

//   it("事例10　本人入院（標準報酬月額26万円以下）（多数回該当）", () => {
//     const covers = calcFutan(3, "エ", [],
//       mkTen("H", 21635),
//       { gendogakuTasuuGaitou: true });
//     expect(patientChargeOf(covers)).toBe(44400);
//   });

//   it("事例11　本人入院（低所得者）（多数回該当）", () => {
//     const covers = calcFutan(3, "オ", [],
//       mkTen("H", 18795),
//       { gendogakuTasuuGaitou: true });
//     expect(patientChargeOf(covers)).toBe(24600);
//   });

//   it("事例12　本人入院（長）", () => {
//     const covers = calcFutan(3, "ウ", [],
//       mkTen("H", 17500),
//       { marucho: 10000 });
//     expect(patientChargeOf(covers)).toBe(10000);
//   });

//   it("事例13　本人入院（標準報酬月額83万円以上）・公費（結核患者の適正医療）", () => {
//     const covers = calcFutan(3, "ア", [KouhiKekkaku],
//       mkTens(
//         ["H1", 6000], ["H", 9000]
//       ),
//     );
//     expect(patientChargeOf(covers)).toBe(30000);
//   });

//   it("事例14　本人入院（標準報酬月額83万円以上）・公費（結核患者の適正医療）", () => {
//     const covers = calcFutan(3, "ア", [KouhiKekkaku],
//       mkTens(
//         ["H1", 85000], ["H", 5000]
//       ),
//       { debug: false });
//     expect(patientChargeOf(covers)).toBe(57500);
//   });

//   it("事例15　本人入院（標準報酬月額83万円以上）・公費（結核患者の適正医療）", () => {
//     const covers = calcFutan(3, "ア", [KouhiKekkaku],
//       mkTens(
//         ["H1", 5000], ["H", 95000]
//       ),
//       { debug: false });
//     expect(patientChargeOf(covers)).toBe(256180);
//   });

//   it("事例16　本人入院（標準報酬月額83万円以上）・公費（結核患者の適正医療）", () => {
//     const covers = calcFutan(3, "ア", [KouhiKekkaku],
//       mkTens(
//         ["H1", 10000], ["H", 110000]
//       ),
//       { debug: false });
//     expect(patientChargeOf(covers)).toBe(256180);
//   });

//   it("事例17　本人入院（標準報酬月額83万円以上）・公費（結核患者の適正医療）", () => {
//     const covers = calcFutan(3, "ア", [KouhiKekkaku],
//       mkTens(
//         ["H1", 85000], ["H", 95000]
//       ),
//       { debug: false });
//     expect(patientChargeOf(covers)).toBe(262180);
//   });

//   it("事例18　本人入院外（標準報酬月額53万～79万円）・公費（結核患者の適正医療）", () => {
//     const covers = calcFutan(3, "イ", [KouhiKekkaku],
//       mkTens(
//         ["H1", 85000], ["H", 5000]
//       ),
//       { debug: false });
//     expect(patientChargeOf(covers)).toBe(57500);
//   });

//   it("事例19　本人入院外（標準報酬月額53万～79万円）・公費（結核患者の適正医療）", () => {
//     const covers = calcFutan(3, "イ", [KouhiKekkaku],
//       mkTens(
//         ["H1", 5000], ["H", 95000]
//       ),
//       { debug: false });
//     expect(patientChargeOf(covers)).toBe(173820);
//   });

//   it("事例20　本人入院外（標準報酬月額53万～79万円）・公費（結核患者の適正医療）", () => {
//     const covers = calcFutan(3, "イ", [KouhiKekkaku],
//       mkTens(
//         ["H1", 10000], ["H", 110000]
//       ),
//       { debug: false });
//     expect(patientChargeOf(covers)).toBe(173820);
//   });

//   it("事例21　本人入院外（標準報酬月額53万～79万円）・公費（結核患者の適正医療）", () => {
//     const covers = calcFutan(3, "イ", [KouhiKekkaku],
//       mkTens(
//         ["H1", 85000], ["H", 95000]
//       ),
//       { debug: false });
//     expect(patientChargeOf(covers)).toBe(179820);
//   });

//   it("事例22　本人入院（標準報酬月額28万円～50万円）・公費（更生医療）", () => {
//     const covers = calcFutan(3, "ウ", [KouhiKouseiIryou],
//       mkTens(
//         ["H1", 20000], ["H", 40000]
//       ),
//       { gendogaku: { kingaku: 20000, kouhiBangou: 1 }, debug: false });
//     expect(patientChargeOf(covers)).toBe(83430);
//   });

//   it("事例23　本人入院（標準報酬月額28万円～50万円）・公費（更生医療）", () => {
//     const covers = calcFutan(3, "ウ", [KouhiKouseiIryou],
//       mkTens(
//         ["H1", 30000], ["H", 30000]
//       ),
//       { gendogaku: { kingaku: 30000, kouhiBangou: 1 }, debug: false });
//     expect(patientChargeOf(covers)).toBe(83430);
//   });

//   it("事例24　本人入院（標準報酬月額26万円以下）・公費（更生医療）", () => {
//     const covers = calcFutan(3, "エ", [KouhiKouseiIryou],
//       mkTens(
//         ["H1", 30000]
//       ),
//       { gendogaku: { kingaku: 5000, kouhiBangou: 1 }, debug: false });
//     expect(patientChargeOf(covers)).toBe(5000);
//   });

//   it("事例25　本人入院（標準報酬月額26万円以下）・公費（更生医療）", () => {
//     const covers = calcFutan(3, "エ", [KouhiKouseiIryou],
//       mkTens(
//         ["H1", 10000], ["H", 20000]
//       ),
//       { gendogaku: { kingaku: 5000, kouhiBangou: 1 }, debug: false });
//     expect(patientChargeOf(covers)).toBe(57600);
//   });

//   it("事例26　本人入院（標準報酬月額26万円以下）・公費（更生医療）", () => {
//     const covers = calcFutan(3, "エ", [KouhiKouseiIryou],
//       mkTens(
//         ["H1", 30000], ["H", 30000]
//       ),
//       { gendogaku: { kingaku: 5000, kouhiBangou: 1 }, debug: false });
//     expect(patientChargeOf(covers)).toBe(57600);
//   });

//   it("事例27　本人入院（低所得者）・公費（更生医療）", () => {
//     const covers = calcFutan(3, "オ", [KouhiKouseiIryou],
//       mkTens(
//         ["H1", 10000], ["H", 20000]
//       ),
//       { gendogaku: { kingaku: 0, kouhiBangou: 1 }, debug: false });
//     expect(patientChargeOf(covers)).toBe(35400);
//   });

//   it("事例28　本人入院（低所得者）・公費（更生医療）", () => {
//     const covers = calcFutan(3, "オ", [KouhiKouseiIryou],
//       mkTens(
//         ["H1", 30000], ["H", 10000]
//       ),
//       { gendogaku: { kingaku: 0, kouhiBangou: 1 }, debug: false });
//     expect(patientChargeOf(covers)).toBe(30000);
//   });

//   it("事例29　本人入院（低所得者）・公費（更生医療）", () => {
//     const covers = calcFutan(3, "オ", [KouhiKouseiIryou],
//       mkTens(
//         ["H1", 30000], ["H", 30000]
//       ),
//       { gendogaku: { kingaku: 0, kouhiBangou: 1 }, debug: false });
//     expect(patientChargeOf(covers)).toBe(35400);
//   });

//   it("事例30　本人入院（低所得者）・公費（更生医療）", () => {
//     const covers = calcFutan(3, "オ", [KouhiKouseiIryou],
//       mkTens(
//         ["H1", 10000], ["H", 20000]
//       ),
//       { gendogaku: { kingaku: 5000, kouhiBangou: 1 }, debug: false });
//     expect(patientChargeOf(covers)).toBe(35400);
//   });

//   it("事例31　本人入院（低所得者）・公費（更生医療）", () => {
//     const covers = calcFutan(3, "オ", [KouhiKouseiIryou],
//       mkTens(
//         ["H1", 30000], ["H", 30000]
//       ),
//       { gendogaku: { kingaku: 5000, kouhiBangou: 1 }, debug: false });
//     expect(patientChargeOf(covers)).toBe(35400);
//   });


// });

