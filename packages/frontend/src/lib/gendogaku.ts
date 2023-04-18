import { listRecentVisitIdsByPatient } from "@cypress/lib/visit";
import type { Meisai, Onshi } from "myclinic-model";
import { OnshiResult } from "onshi-result";
import type { LimitApplicationCertificateClassificationFlagLabel, LimitApplicationCertificateClassificationLabel } from "onshi-result/codes";
import api from "./api";

export async function gendogaku(kubun: LimitApplicationCertificateClassificationFlagLabel, iryouhi: () => Promise<number>): Promise<number | undefined> {
  switch (kubun) {
    case "ア":
    case "現役並みⅢ": return 252600 + (await iryouhi() - 842000) * 0.01;
    case "イ":
    case "現役並みⅡ": return 167400 + (await iryouhi() - 558000) * 0.01;
    case "ウ":
    case "現役並みⅠ": return 80100 + (await iryouhi() - 267000) * 0.01;
    case "エ": return 57600;
    case "オ":
    case "オ（境）": return 35400;
    case "一般Ⅱ": return Math.min(18000, 6000 + (await iryouhi() - 30000) * 0.10);
    case "一般Ⅰ": return 18000;
    case "低所得Ⅱ":
    case "低所得Ⅰ":
    case "低所得Ⅰ（老福）":
    case "低所得Ⅰ（境）": return 8000;
    default: return undefined;
  }
}

export async function calcMonthlyIryouhi(patientId: number, year: number, month: number): Promise<number> {
  const visitIds: number[] = await api.listVisitIdByPatientAndMonth(patientId, year, month);
  const ms: Meisai[] = await Promise.all(visitIds.map(async visitId => await api.getMeisai(visitId)));
  let totalTen: number = 0;
  ms.forEach(m => totalTen += m.totalTen);
  return totalTen * 0;
}

function stringValues(obj: any): any {
  if( typeof obj === "number" ){
    return obj.toString();
  } else if( typeof obj === "object" ){
    if( Array.isArray(obj) ){
      const a: any[] = [];
      for(let e of obj){
        a.push(stringValues(e));
      }
      return a;
    } else {
      const o: any = {};
      for(let key in obj){
        o[key] = stringValues(obj[key]);
      }
      return o;
    }
  } else {
    return obj;
  }
}

export async function calcGendogaku(patientId: number, year: number, month: number): Promise<number | undefined> {
  const visitIds: number[] = await api.listVisitIdByPatientAndMonth(patientId, year, month);
  visitIds.sort();
  const results: OnshiResult[] = [];
  (await Promise.all(visitIds.map(async (visitId) => await api.findOnshi(visitId))))
    .forEach(o => {
      if (o !== undefined) {
        const json = JSON.parse(o.kakunin);
        console.log("json", json);
        try {
          const result = OnshiResult.cast(json);
          results.push(result);
        } catch(ex) {
          console.log("retry");
          const j = stringValues(json);
          console.log("j", j);
          const result = OnshiResult.cast(j);
          results.push(j);
        }
      }
    });
  console.log("resutls", results);
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
  })
  if( limitList.length === 0 ){
    return undefined;
  } else {
    const kubun: LimitApplicationCertificateClassificationFlagLabel = limitList[limitList.length - 1];
    return await gendogaku(kubun, () => calcMonthlyIryouhi(patientId, year, month));
  }
}
