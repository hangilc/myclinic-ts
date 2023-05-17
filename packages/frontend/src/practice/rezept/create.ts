import api from "@/lib/api";
import type { ClinicInfo, HokenInfo, Visit } from "myclinic-model";
import { 診査支払い機関コード } from "./codes";
import { create医療機関情報レコード } from "./records/medical-institute-record";
import { extract都道府県コードfromAddress, sortKouhiList } from "./util";

export async function createShaho(year: number, month: number): Promise<string> {
  return create(year, month, 診査支払い機関コード.社会保険診療報酬支払基金);
}

interface VisitItem {
  visit: Visit,
  hoken: HokenInfo,
}

async function create(year: number, month: number, 診査機関: number): Promise<string> {
  const rows: string[] = [];
  rows.push(await 医療機関情報レコード(year, month, 診査機関));
  const visits = (await api.listVisitByMonth(year, month)).filter(visit => {
    if( visit.shahokokuhoId > 0 && visit.koukikoureiId > 0 ){
      throw new Error("重複保険：" + visit.visitId);
    }
    return visit.shahokokuhoId > 0 || visit.koukikoureiId > 0;
  });
  const visitItems: [string, VisitItem][] = await Promise.all(visits.map(async visit => {
    const hoken = await api.getHokenInfoForVisit(visit.visitId);
    sortKouhiList(hoken.kouhiList);
    return [mkRecordKey(visit.patientId, hoken), {
      visit,
      hoken,
    }];
  }));
  const classified: Record<string, VisitItem[]> = {};
  visitItems.forEach(item => {
    const [key, vitem] = item;
    if( !(key in classified) ){
      classified[key] = [vitem];
    } else {
      classified[key].push(vitem);
    }
  });
  for(let key in classified){
    console.log(key, classified[key]);
  }
  return rows.join("\r\n") + "\r\n\x1A";
}

async function 医療機関情報レコード(year: number, month: number, 診査機関: number): Promise<string> {
  const clinicInfo: ClinicInfo = await api.getClinicInfo();
  return create医療機関情報レコード({
    診査支払い機関: 診査機関,
    都道府県: extract都道府県コードfromAddress(clinicInfo.address),
    医療機関コード: clinicInfo.kikancode,
    医療機関名称: clinicInfo.name,
    year,
    month,
    電話番号: clinicInfo.tel,
  });
}

function mkRecordKey(patientId: number, hoken: HokenInfo): string {
  const hokenPart: string =  [
    hoken.shahokokuho ? hoken.shahokokuho.hokenshaBangou : 0,
    hoken.koukikourei ? parseInt(hoken.koukikourei.hokenshaBangou) : 0,
    ...hoken.kouhiList.map(kouhi => kouhi.futansha)
  ].join("|");
  return `<${patientId}>${hokenPart}`;
}