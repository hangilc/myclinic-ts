import { listRecentVisitIdsByPatient } from "@cypress/lib/visit";
import type { Meisai } from "myclinic-model";
import type { LimitApplicationCertificateClassificationFlagLabel } from "onshi-result/codes";
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

export async function calcMonthlyTotalTen(patientId: number, year: number, month: number) {
  const visitIds: number[] = await api.listVisitIdByPatientAndMonth(patientId, year, month);
  const ms: Meisai[] = await Promise.all(visitIds.map(async visitId => await api.getMeisai(visitId)));
  let totalTen: number = 0;
  ms.forEach(m => totalTen += m.totalTen);
  return totalTen;
}

// export async function calcGendogaku(patientId: number, year: number, month: number): number {

// }
