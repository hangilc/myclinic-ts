import type { Visit } from "myclinic-model";
import api from "../api";
import { resolve保険種別, withClassified, withClassifiedBy } from "./util";

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

export {}