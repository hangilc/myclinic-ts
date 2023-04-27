import type { Meisai } from "myclinic-model";
import { OnshiResult } from "onshi-result";
import type { LimitApplicationCertificateClassificationFlagLabel } from "onshi-result/codes";
import api from "./api";

export async function gendogaku(kubun: LimitApplicationCertificateClassificationFlagLabel, iryouhi: () => Promise<number>): Promise<number | undefined> {
  switch (kubun) {
    case "ア":
    case "現役並みⅢ": return calc(252600, await iryouhi(), 842000, 0.01);
    case "イ":
    case "現役並みⅡ": return calc(167400, await iryouhi(), 558000, 0.01);
    case "ウ":
    case "現役並みⅠ": return calc(80100, await iryouhi(), 267000, 0.01);
    case "エ": return 57600;
    case "オ":
    case "オ（境）": return 35400;
    case "一般Ⅱ": return Math.min(18000, calc(6000, await iryouhi(), 30000, 0.10));
    case "一般Ⅰ": 
    case "一般": return 18000;
    case "低所得Ⅱ":
    case "低所得Ⅰ":
    case "低所得Ⅰ（老福）":
    case "低所得Ⅰ（境）": return 8000;
    default: return undefined;
  }
}

function calc(threshold: number, iryouhi: number, offset: number, ratio: number): number {
  if( iryouhi > offset ){
    return threshold + (iryouhi - offset) * ratio;
  } else {
    return threshold;
  }
}

export async function calcMonthlyIryouhi(patientId: number, year: number, month: number): Promise<number> {
  const visitIds: number[] = await api.listVisitIdByPatientAndMonth(patientId, year, month);
  const ms: Meisai[] = await Promise.all(visitIds.map(async visitId => await api.getMeisai(visitId)));
  let totalTen: number = 0;
  ms.forEach(m => totalTen += m.totalTen);
  return totalTen * 10;
}

export async function calcGendogaku(patientId: number, year: number, month: number): Promise<number | undefined> {
  const visitIds: number[] = await api.listVisitIdByPatientAndMonth(patientId, year, month);
  visitIds.sort();
  const results: OnshiResult[] = [];
  (await Promise.all(visitIds.map(async (visitId) => await api.findOnshi(visitId))))
    .forEach(o => {
      if (o !== undefined) {
        const json = JSON.parse(o.kakunin);
        const result = OnshiResult.cast(json);
        results.push(result);
      }
    });
  const limitList: LimitApplicationCertificateClassificationFlagLabel[] = [];
  results.forEach(o => {
    const limit = o.messageBody.resultList[0].limitApplicationCertificateRelatedInfo;
    if (limit) {
      const label: LimitApplicationCertificateClassificationFlagLabel | undefined =
        limit.limitApplicationCertificateClassificationFlag;
      if (label) {
        limitList.push(label);
      }
    }
  });
  let kubun: LimitApplicationCertificateClassificationFlagLabel | undefined = undefined;
  if (limitList.length === 0) {
    if( results.length > 0 ){
      const r = results[results.length - 1];
      switch(r.probeKoukikourei()){
        case 3: kubun = "現役並みⅢ"; break;
        case 2: kubun = "一般Ⅱ"; break;
        case 1: kubun = "一般Ⅰ"; break;
        case undefined: break;
        default: throw new Error("Invalid koukikourei result: " + r.probeKoukikourei());
      }
      if( kubun === undefined ){
        switch(r.probeKoureiJukyuu()){
          case 3: kubun = "現役並みⅢ"; break;
          case 2: 
          case 1: kubun = "一般"; break;
          case undefined: break;
          default: throw new Error("Invalid kourei jukyuu result: " + r.probeKoureiJukyuu());
        }
      }
    }
  } else {
    kubun = limitList[limitList.length - 1];
  }
  // console.log("kubun", kubun);
  if( kubun ){
    return await gendogaku(kubun, () => calcMonthlyIryouhi(patientId, year, month));
  } else {
    return undefined;
  }
}