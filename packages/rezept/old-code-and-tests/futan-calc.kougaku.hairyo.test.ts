export {}
// import { 負担区分コード, type 負担区分コードCode, type 負担区分コードName } from "./codes";
// import { calcFutan, type HokenSelector, type TotalCover } from "./futan-calc";
// import { KouhiGroup1Group2Infection, KouhiHepatitis, KouhiKekkaku, KouhiKouseiIryou, KuniNanbyou } from "./kouhi-registry";

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

// function coveredBy(sel: HokenSelector, totalCover: TotalCover): number {
//   return totalCover.slot.kakariOf(sel) - totalCover.slot.patientChargeOf(sel);
// }

// // 後期高齢者医療制度の負担割合見直しに係る計算事例集（令和５年４月）
// describe("高額療養費配慮措置", () => {
//   it("【事例１】後期高齢者２割負担外来", () => {
//     const covers = calcFutan(2, "一般Ⅱ", [],
//       mkTen("H", 2000),
//       {});
//     expect(patientChargeOf(covers)).toBe(4000);
//   });

//   it("【事例2】後期高齢者２割負担外来", () => {
//     const covers = calcFutan(2, "一般Ⅱ", [],
//       mkTen("H", 20000),
//       {});
//     expect(patientChargeOf(covers)).toBe(18000);
//   });

//   it("【事例3】後期高齢者２割負担外来（配慮措置）", () => {
//     const covers = calcFutan(2, "一般Ⅱ", [],
//       mkTen("H", 8000),
//       {});
//     expect(patientChargeOf(covers)).toBe(11000);
//   });

//   it("【事例4】後期高齢者２割負担外来（配慮措置）", () => {
//     const covers = calcFutan(2, "一般Ⅱ", [],
//       mkTen("H", 13000),
//       {});
//     expect(patientChargeOf(covers)).toBe(16000);
//   });

//   it("【事例5】後期高齢者２割負担外来（75歳到達月）", () => {
//     const covers = calcFutan(2, "一般Ⅱ", [],
//       mkTen("H", 10000),
//       {
//         isBirthdayMonth75: true,
//       });
//     expect(patientChargeOf(covers)).toBe(9000);
//   });

//   it("【事例6】後期高齢者２割負担外来（配慮措置）（75歳到達月）", () => {
//     const covers = calcFutan(2, "一般Ⅱ", [],
//       mkTen("H", 4000),
//       {
//         isBirthdayMonth75: true,
//         debug: false,
//       });
//     expect(patientChargeOf(covers)).toBe(7000);
//   });

//   it("【事例7】後期高齢者２割負担外来（配慮措置）（75歳到達月）", () => {
//     const covers = calcFutan(2, "一般Ⅱ", [],
//       mkTen("H", 5000),
//       {
//         isBirthdayMonth75: true,
//         debug: false,
//       });
//     expect(patientChargeOf(covers)).toBe(8000);
//   });

//   it("【事例8】後期高齢者２割負担外来（マル長）", () => {
//     const covers = calcFutan(2, "一般Ⅱ", [],
//       mkTen("H", 15000),
//       {
//         marucho: 10000,
//         debug: false,
//       });
//     expect(patientChargeOf(covers)).toBe(10000);
//   });

//   it("【事例9】後期高齢者２割負担外来（マル長）（75歳到達月）", () => {
//     const covers = calcFutan(2, "一般Ⅱ", [],
//       mkTen("H", 7000),
//       {
//         marucho: 10000,
//         isBirthdayMonth75: true,
//         debug: false,
//       });
//     expect(patientChargeOf(covers)).toBe(5000);
//   });

//   it("【事例10】後期高齢者２割負担外来（難病）", () => {
//     const covers = calcFutan(2, "一般Ⅱ", [KuniNanbyou],
//       mkTen("H1", 10000),
//       {
//         gendogaku: { kingaku: 5000, kouhiBangou: 1 },
//         debug: false,
//       });
//     expect(patientChargeOf(covers)).toBe(5000);
//     expect(coveredBy("1", covers)).toBe(13000);
//   });

//   it("【事例11】後期高齢者２割負担外来（難病）", () => {
//     const covers = calcFutan(2, "一般Ⅱ", [KuniNanbyou],
//       mkTen("H1", 8000),
//       {
//         gendogaku: { kingaku: 5000, kouhiBangou: 1 },
//         debug: false,
//       });
//     expect(patientChargeOf(covers)).toBe(5000);
//     expect(coveredBy("1", covers)).toBe(11000);
//   });

//   it("【事例12】後期高齢者２割負担外来（難病）（75歳到達月）", () => {
//     const covers = calcFutan(2, "一般Ⅱ", [KuniNanbyou],
//       mkTen("H1", 8000),
//       {
//         gendogaku: { kingaku: 5000, kouhiBangou: 1 },
//         isBirthdayMonth75: true,
//         debug: false,
//       });
//     expect(patientChargeOf(covers)).toBe(5000);
//     expect(coveredBy("1", covers)).toBe(4000);
//   });

//   it("【事例14】後期高齢者２割負担外来（マル長）（更生医療）", () => {
//     const covers = calcFutan(2, "一般Ⅱ", [KouhiKouseiIryou],
//       mkTen("H1", 6000),
//       {
//         marucho: 10000,
//         debug: false,
//       });
//     expect(patientChargeOf(covers)).toBe(6000);
//     expect(coveredBy("1", covers)).toBe(4000);
//   });

//   it("【事例15】後期高齢者２割負担外来（難病）", () => {
//     const covers = calcFutan(2, "一般Ⅱ", [KuniNanbyou],
//       mkTens(["H1", 3000], ["H", 1000]),
//       {
//         gendogaku: { kingaku: 5000, kouhiBangou: 1 },
//       });
//     expect(patientChargeOf(covers)).toBe(7000);
//     expect(coveredBy("1", covers)).toBe(1000);
//   });

//   it("【事例16】後期高齢者２割負担外来（難病）（配慮措置）", () => {
//     const covers = calcFutan(2, "一般Ⅱ", [KuniNanbyou],
//       mkTens(["H1", 4000], ["H", 5000]),
//       {
//         gendogaku: { kingaku: 5000, kouhiBangou: 1 },
//       });
//     expect(patientChargeOf(covers)).toBe(13000);
//     expect(coveredBy("1", covers)).toBe(3000);
//   });

//   it("【事例17】後期高齢者２割負担外来（難病）（配慮措置）", () => {
//     const covers = calcFutan(2, "一般Ⅱ", [KuniNanbyou],
//       mkTens(["H1", 3500], ["H", 10500]),
//       {
//         gendogaku: { kingaku: 5000, kouhiBangou: 1 },
//       });
//     expect(patientChargeOf(covers)).toBe(18000);
//     expect(coveredBy("1", covers)).toBe(2000);
//   });

//   it("【事例18】後期高齢者２割負担外来（結核）（配慮措置）", () => {
//     const covers = calcFutan(2, "一般Ⅱ", [KouhiKekkaku],
//       mkTens(["H1", 6000], ["H", 8000]),
//       {
//       });
//     expect(patientChargeOf(covers)).toBe(14000);
//     expect(coveredBy("1", covers)).toBe(9000);
//   });

//   it("【事例19】後期高齢者２割負担外来（難病・肝炎）（配慮措置）", () => {
//     const covers = calcFutan(2, "一般Ⅱ", [KuniNanbyou, KouhiHepatitis],
//       mkTens(["H1", 4000], ["H2", 3500], ["H", 4500]),
//       {
//         gendogaku: [
//           { kingaku: 5000, kouhiBangou: 1 },
//           { kingaku: 1000, kouhiBangou: 2 },
//         ],
//       });
//     expect(patientChargeOf(covers)).toBe(13500);
//     expect(coveredBy("1", covers)).toBe(3000);
//     expect(coveredBy("2", covers)).toBe(6000);
//   });

//   it("【事例20】後期高齢者２割負担外来（難病・肝炎）（配慮措置）", () => {
//     const covers = calcFutan(2, "一般Ⅱ", [KuniNanbyou, KouhiHepatitis],
//       mkTens(["H1", 3200], ["H2", 2000], ["H", 9600]),
//       {
//         gendogaku: [
//           { kingaku: 5000, kouhiBangou: 1 },
//           { kingaku: 1000, kouhiBangou: 2 },
//         ],
//       });
//     expect(patientChargeOf(covers)).toBe(18000);
//     expect(coveredBy("1", covers)).toBe(1400);
//     expect(coveredBy("2", covers)).toBe(3000);
//   });

//   it("【事例21】後期高齢者２割負担外来（マル長）", () => {
//     const covers = calcFutan(2, "一般Ⅱ", [],
//       mkTens(["H", 4000]),
//       {
//         marucho: 10000,
//       });
//     expect(patientChargeOf(covers)).toBe(8000);
//   });

//   it("【事例22】後期高齢者２割負担外来（新型コロナ感染症）", () => {
//     const covers = calcFutan(2, "一般Ⅱ", [KouhiGroup1Group2Infection],
//       mkTens(["H1", 8500], ["H", 2500]),
//       {
//       });
//     expect(patientChargeOf(covers)).toBe(5000);
//     expect(coveredBy("1", covers)).toBe(17000);
//   });

//   it("【事例23】後期高齢者２割負担外来（新型コロナ感染症）（配慮措置）", () => {
//     const covers = calcFutan(2, "一般Ⅱ", [KouhiGroup1Group2Infection],
//       mkTens(["H1", 8000], ["H", 5500]),
//       {
//       });
//     expect(patientChargeOf(covers)).toBe(8500);
//     expect(coveredBy("1", covers)).toBe(16000);
//   });

// });
