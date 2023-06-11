import type { Charge, Meisai, Payment } from "myclinic-model";
import { OnshiResult } from "onshi-result";
import type { LimitApplicationCertificateClassificationFlagLabel } from "onshi-result/codes";
import api from "./api";

export function gendogakuOfKubun(
  kubun: LimitApplicationCertificateClassificationFlagLabel,
  iryouKingaku: number
): number {
  switch (kubun) {
    case "ア":
    case "現役並みⅢ": return calc(252600, iryouKingaku, 842000, 0.01);
    case "イ":
    case "現役並みⅡ": return calc(167400, iryouKingaku, 558000, 0.01);
    case "ウ":
    case "現役並みⅠ": return calc(80100, iryouKingaku, 267000, 0.01);
    case "エ": return 57600;
    case "オ":
    case "オ（境）": return 35400;
    case "一般Ⅱ": return Math.min(18000, calc(6000, iryouKingaku, 30000, 0.10)); // 配慮措置（令和７年９月30日まで）
    case "一般Ⅰ":
    case "一般": return 18000;
    case "低所得Ⅱ":
    case "低所得Ⅰ":
    case "低所得Ⅰ（老福）":
    case "低所得Ⅰ（境）": return 8000;
    default: throw new Error("Cannot handle kubun: " + kubun);
  }
}

export function gendogakuTasuuGaitouOfKubun(
  kubun: LimitApplicationCertificateClassificationFlagLabel,
): number {
  switch (kubun) {
    case "ア":
    case "現役並みⅢ":
      return 140100;
    case "イ":
    case "現役並みⅡ":
      return 93000;
    case "ウ":
    case "現役並みⅠ":
      return 44400;
    case "エ": return 44400;
    case "オ": return 24600;
    case "一般":
    case "一般Ⅱ":
    case "一般Ⅰ":
      return 18000;
    case "低所得Ⅱ":
    case "低所得Ⅰ":
      return 8000;
    default: throw new Error("Cannot handle: " + kubun);
  }
}

export function kuniKouhiHeiyouGendogaku(
  shotokuKubun: LimitApplicationCertificateClassificationFlagLabel,
  iryouKingaku: number
): number {
  switch (shotokuKubun) {
    case "ア":
    case "イ":
    case "ウ":
    case "エ":
    case "オ":
      return calc(80100, iryouKingaku, 267000, 0.01);
    case "現役並みⅢ":
    case "現役並みⅡ":
    case "現役並みⅠ":
    case "一般":
    case "一般Ⅱ":
    case "一般Ⅰ":
      return 12000;
    case "低所得Ⅱ":
    case "低所得Ⅰ":
      return 8000;
    default: throw new Error("Cannot hanlde: " + shotokuKubun);
  }

}

export function gendogakuOfHairyoSochiBirthdayMonth(iryouKingaku: number): number {
  return Math.min(9000, calc(6000, iryouKingaku, 30000, 0.10)); // 配慮措置（令和７年９月30日まで）
}

export const KuniKouhiHoubetsu = [
  13, 14, 18, 19, 28, 29, 10, 11, 20, 16, 15, 21, 22, 17, 52, 23, 54, 51, 53, 79, 12
]

export function isKuniKouhi(houbetsu: number): boolean {
  // exclude 51, 52, 54
  if ([51, 52, 54].includes(houbetsu)) {
    return false;
  } else {
    return KuniKouhiHoubetsu.includes(houbetsu);
  }
}

export function isKuniKouhiOfHeiyou(houbetsuList: number[]): boolean {
  // 公費併用の場合は、一つでも国公費ならば、国公費で限度額計算
  for (let h of houbetsuList) {
    if (isKuniKouhi(h)) {
      return true;
    }
  }
  return false;
}

async function gendogaku(
  kubun: LimitApplicationCertificateClassificationFlagLabel,
  iryouhi: () => Promise<number>
): Promise<number | undefined> {
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
  if (iryouhi <= offset) {
    return threshold;
  } else {
    return threshold + (iryouhi - offset) * ratio;
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
    if (results.length > 0) {
      const r = results[results.length - 1];
      switch (r.probeKoukikourei()) {
        case 3: kubun = "現役並みⅢ"; break;
        case 2: kubun = "一般Ⅱ"; break;
        case 1: kubun = "一般Ⅰ"; break;
        case undefined: break;
        default: throw new Error("Invalid koukikourei result: " + r.probeKoukikourei());
      }
      if (kubun === undefined) {
        switch (r.probeKoureiJukyuu()) {
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
  if (kubun) {
    return await gendogaku(kubun, () => calcMonthlyIryouhi(patientId, year, month));
  } else {
    return undefined;
  }
}

export async function calcMonthlyFutan(patientId: number, year: number, month: number): Promise<number> {
  const visitIds = await api.listVisitIdByPatientAndMonth(patientId, year, month);
  const visitMap = await api.batchGetVisit(visitIds);
  const visits = visitIds.map(visitId => visitMap[visitId]);
  const chargePayments: [number, Charge | null, Payment | null][] =
    await api.batchGetChargePayment(visits.filter(visit => visit.shahokokuhoId > 0 || visit.koukikoureiId > 0)
      .map(visit => visit.visitId));
  return chargePayments.reduce((acc, ele) => {
    const [_visitId, _chargeOpt, payment] = ele;
    if (payment) {
      return acc + payment.amount;
    } else {
      return acc;
    }
  }, 0);
}

export async function listMonthlyPayment(patientId: number, year: number, month: number): Promise<Payment[]> {
  const visitIds = await api.listVisitIdByPatientAndMonth(patientId, year, month);
  const visitMap = await api.batchGetVisit(visitIds);
  const visits = visitIds
    .map(visitId => visitMap[visitId])
    .filter(visit => visit.shahokokuhoId > 0 || visit.koukikoureiId > 0);
  const result: Payment[] = [];
  (await api.batchGetChargePayment(visits.map(visit => visit.visitId)))
    .forEach(values => {
      const payment = values[2];
      if (payment != null) {
        result.push(payment);
      }
    });
  return result;
}
