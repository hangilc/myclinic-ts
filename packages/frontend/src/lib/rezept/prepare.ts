import type { Visit } from "myclinic-model";
import api from "../api";
import { classifyBy, isForKokuhoRengou, resolve保険種別, withClassified, withClassifiedBy, classify, setOf } from "./util";

export async function listVisitForRezept(year: number, month: number): Promise<Visit[]> {
  const visits = await api.listVisitByMonth(year, month);
  return visits.filter(visit => {
    if (visit.shahokokuhoId > 0 && visit.koukikoureiId > 0) {
      throw new Error("重複保険：" + visit.visitId);
    }
    if (visit.shahokokuhoId > 0 || visit.koukikoureiId > 0) {
      return true;
    } else {
      return visit.kouhi1Id > 0 || visit.kouhi2Id > 0 || visit.kouhi3Id > 0;
    }
  });
}

export function classifyByPatient(visits: Visit[]): Map<number, Visit[]> {
  const patientIds = setOf(visits.map(visit => visit.patientId));
  const classified = classifyBy(visits, visit => visit.patientId);
  const map: Map<number, Visit[]> = new Map();
  patientIds.forEach(patientId => {
    map.set(patientId, classified.get(patientId)!);
  })
  return map;
}

export async function classifyBySeikyuuSaki(visits: Visit[]): Promise<{
  "社保基金": Visit[];
  "国保連合": Visit[];
}> {
  const shahoList: Visit[] = [];
  const kokuhoList: Visit[] = [];
  await Promise.all(visits.map(async visit => {
    if (await isForKokuhoRengou(visit)) {
      kokuhoList.push(visit);
    } else {
      shahoList.push(visit);
    }
  }));
  return {
    "社保基金": shahoList,
    "国保連合": kokuhoList,
  }
}

export async function classifyByHokenOnlyShubetsu(visits: Visit[]): Promise<Map<string, Visit[]>> {
  const items: [string, Visit][] = await Promise.all(visits.map(async visit => {
    const shahokokuho = visit.shahokokuhoId > 0 ? await api.getShahokokuho(visit.shahokokuhoId) : undefined;
    const koukikourei = visit.koukikoureiId > 0 ? await api.getKoukikourei(visit.koukikoureiId) : undefined;
    const shubetsu = resolve保険種別(shahokokuho, koukikourei, []);
    const hokenshaBangou1 = shahokokuho ? shahokokuho.hokenshaBangou : 0;
    const hokenshaBangou2 = koukikourei ? parseInt(koukikourei.hokenshaBangou) : 0;
    const encode = `${shubetsu}|${hokenshaBangou1}|${hokenshaBangou2}`;
    return [encode, visit];
  }));
  return classify(items);
}

async function classifyToRecord(visits: Visit[], handler: (patientId: number, encodedHoken: string, visits: Visit[]) => void) {
  visits = visits.filter(visit => {
    if (visit.shahokokuhoId > 0 && visit.koukikoureiId > 0) {
      throw new Error("重複保険：" + visit.visitId);
    }
    if (visit.shahokokuhoId > 0 || visit.koukikoureiId > 0) {
      return true;
    } else {
      return visit.kouhi1Id > 0 || visit.kouhi2Id > 0 || visit.kouhi3Id > 0;
    }
  });
  withClassifiedBy(visits, visit => visit.patientId, async (patientId, visits) => {
    const visitItems: [string, Visit][] = await Promise.all(visits.map(async visit => {
      const shahokokuho = visit.shahokokuhoId > 0 ? await api.getShahokokuho(visit.shahokokuhoId) : undefined;
      const koukikourei = visit.koukikoureiId > 0 ? await api.getKoukikourei(visit.koukikoureiId) : undefined;
      const shubetsu = resolve保険種別(shahokokuho, koukikourei, []);
      const hokenshaBangou1 = shahokokuho ? shahokokuho.hokenshaBangou : 0;
      const hokenshaBangou2 = koukikourei ? parseInt(koukikourei.hokenshaBangou) : 0;
      const encode = `${shubetsu}|${hokenshaBangou1}|${hokenshaBangou2}`;
      return [encode, visit];
    }));
    withClassified(visitItems, (encode, visits) => {

    });
  });
}

export { }