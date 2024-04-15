export {}
// import { applyGendogaku, type Cover, type KouhiData, type KouhiProcessor, type KouhiProcessorArg } from "./futan-calc";

// function mkGendogakuLimitProcessor(gendogaku: number): KouhiProcessor {
//   return ({ kakari, prevPatientCharge }: KouhiProcessorArg): Cover => {
//     const patientCharge = applyGendogaku(kakari, prevPatientCharge, gendogaku);
//     return {
//       kakari,
//       remaining: patientCharge,
//     }
//   }
// }

// function nanbyouProcessor(arg: KouhiProcessorArg): Cover {
//   if (arg.debug) {
//     console.log("    enter 公費難病");
//     console.log("      ", JSON.stringify(arg));
//   }
//   const { kakari, totalTen, hokenFutanWari, prevPatientCharge, gendogakuApplied, debug } = arg;
//   let patientCharge = kakari;
//   if (gendogakuApplied !== undefined) {
//     patientCharge = gendogakuApplied - prevPatientCharge;
//     if (patientCharge < 0) {
//       throw new Error("Cannot happen in MarutoNanbyou");
//     }
//   } else {
//     if (hokenFutanWari === 3) {
//       patientCharge -= totalTen;
//     }
//   }
//   return {
//     kakari,
//     remaining: patientCharge,
//   }
// }

// export function KouhiFutanNashi(houbetsu: number): KouhiData {
//   return {
//     houbetsu,
//     processor: ({ kakari }: KouhiProcessorArg): Cover => {
//       return { kakari, remaining: 0 };
//     }
//   }
// }

// // マル都　被爆者の子
// export const MarutoHibakushaNoKo: KouhiData = KouhiFutanNashi(82);

// // マル都（大気汚染）
// export function MaruToTaikiosen(gendogaku: number): KouhiData {
//   return {
//     houbetsu: 82,
//     processor: mkGendogakuLimitProcessor(gendogaku),
//   }
// }

// // マル青
// export const MaruAoNoFutan: KouhiData = KouhiFutanNashi(89);

// // マル都（難病）
// export const MarutoNanbyou: KouhiData = {
//   houbetsu: 82,
//   processor: nanbyouProcessor,
// }

// // 難病（国, 54）
// export const KuniNanbyou: KouhiData = { houbetsu: 54, processor: nanbyouProcessor };

// // 結核患者の適正医療
// export const KouhiKekkaku: KouhiData = {
//   houbetsu: 10,
//   processor: ({ kakari, totalTen }: KouhiProcessorArg): Cover => {
//     return {
//       kakari,
//       remaining: totalTen * 0.5,
//     }
//   }
// }

// // 更生医療
// export const KouhiKouseiIryou: KouhiData = {
//   houbetsu: 15,
//   processor: ({ kakari, totalTen, gendogakuApplied, prevPatientCharge }: KouhiProcessorArg):
//     Cover => {
//     let remaining = totalTen * 1;
//     if (gendogakuApplied !== undefined) {
//       remaining = applyGendogaku(remaining, prevPatientCharge, gendogakuApplied);
//     }
//     return { kakari, remaining }
//   }
// }

// // 生活保護
// export function SeikatsuHogo(jikofutan: number = 0): KouhiData {
//   function processor({ kakari, prevPatientCharge }: KouhiProcessorArg): Cover {
//     const remaining = applyGendogaku(kakari, prevPatientCharge, jikofutan);
//     return { kakari, remaining };
//   }

//   return { houbetsu: 12, processor };
// }

// // 精神通院
// export const KuniSeishinTsuuin: KouhiData = {
//   houbetsu: 21,
//   processor: ({ kakari, totalTen, gendogakuApplied, prevPatientCharge }: KouhiProcessorArg): Cover => {
//     let remaining = totalTen * 1;
//     if (gendogakuApplied !== undefined) {
//       remaining = applyGendogaku(remaining, prevPatientCharge, gendogakuApplied);
//     }
//     return { kakari, remaining };
//   }
// }

// // 肝炎治療特別促進事業
// export const KouhiHepatitis: KouhiData = {
//   houbetsu: 38,
//   processor: ({ kakari, gendogakuApplied, prevPatientCharge }: KouhiProcessorArg): Cover => {
//     let remaining = kakari;
//     if( gendogakuApplied !== undefined ){
//       remaining = applyGendogaku(remaining, prevPatientCharge, gendogakuApplied);
//     }
//     return { kakari, remaining };
//   }
// }

// // 一類・二類感染症
// export const KouhiGroup1Group2Infection: KouhiData = {
//   houbetsu: 28,
//   processor: ({ kakari }: KouhiProcessorArg): Cover => {
//     return { kakari, remaining: 0 };
//   }
// }

// // 被爆者の子
// export const MaruToHibakushaNoKo: KouhiData = KouhiFutanNashi(82);

