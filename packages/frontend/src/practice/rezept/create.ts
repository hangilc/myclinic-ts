import api from "@/lib/api";
import type { ClinicInfo, HokenInfo, Kouhi, Meisai, Patient, Visit, VisitEx } from "myclinic-model";
import { OnshiResult } from "onshi-result";
import { 診査支払い機関コード } from "./codes";
import { createレセプト共通レコード } from "./records/common-record";
import { create保険者レコード } from "./records/hokensha-record";
import { create公費レコード } from "./records/kouhi-record";
import { create医療機関情報レコード } from "./records/medical-institute-record";
import { create資格確認レコード } from "./records/shikaku-kakunin-record";
import { extract都道府県コードfromAddress, findOnshiResultGendogaku, firstDayOfMonth, hokenshaBangouOfHoken, lastDayOfMonth, resolveGendo, resolveGendogakuTokkiJikou, sortKouhiList } from "./util";
import type { VisitItem } from "./visit-item";

export async function createShaho(year: number, month: number): Promise<string> {
  return create(year, month, 診査支払い機関コード.社会保険診療報酬支払基金);
}

async function create(year: number, month: number, 診査機関: number): Promise<string> {
  const rows: string[] = [];
  rows.push(await 医療機関情報レコード(year, month, 診査機関));
  const visits = (await api.listVisitByMonth(year, month)).filter(visit => {
    if (visit.shahokokuhoId > 0 && visit.koukikoureiId > 0) {
      throw new Error("重複保険：" + visit.visitId);
    }
    return visit.shahokokuhoId > 0 || visit.koukikoureiId > 0;
  });
  const visitItems: [string, VisitItem][] = await Promise.all(visits.map(async visit => {
    const hoken = await api.getHokenInfoForVisit(visit.visitId);
    sortKouhiList(hoken.kouhiList);
    let onshiResult: OnshiResult | undefined;
    const onshi = await api.findOnshi(visit.visitId);
    if (onshi) {
      onshiResult = OnshiResult.cast(JSON.parse(onshi.kakunin));
    }
    const patient: Patient = await api.getPatient(visit.patientId);
    const meisai: Meisai = await api.getMeisai(visit.visitId);
    const visitEx: VisitEx = await api.getVisitEx(visit.visitId);
    return [mkRecordKey(visit.patientId, hoken), {
      visit,
      hoken,
      patient,
      onshiResult,
      meisai,
      visitEx,
    }];
  }));
  const classified: Record<string, VisitItem[]> = {};
  visitItems.forEach(item => {
    const [key, vitem] = item;
    if (!(key in classified)) {
      classified[key] = [vitem];
    } else {
      classified[key].push(vitem);
    }
  });
  let serial = 1;
  const firstDay = firstDayOfMonth(year, month);
  const lastDay = lastDayOfMonth(year, month);
  for (let key in classified) {
    const items = classified[key];
    const hoken = items[0].hoken;
    const kouhiList: Kouhi[] = collectKouhi(items);
    const gendo = resolveGendo(items);
    const tokkijikouGendo = resolveGendogakuTokkiJikou(hoken, gendo);
    const patient: Patient = items[0].patient;
    rows.push(createレセプト共通レコード({
      rezeptSerialNumber: serial++,
      hoken: items[0].hoken,
      kouhiList,
      year,
      month,
      patient,
      tokkkijikouGendogaku: tokkijikouGendo,
    }));
    if (hoken.shahokokuho || hoken.koukikourei) {
      rows.push(create保険者レコード({
        items,
      }));
    }
    kouhiList.forEach(kouhi => {
      rows.push(create公費レコード({
        kouhi, items,
      }))
    })
    {
      const edaban = resolveEdaban(items);
      if( edaban ){
        rows.push(create資格確認レコード({
          edaban,
        }))
      }
    }
    {
      const ds = await api.listDiseaseActiveAt(patient.patientId, firstDay, lastDay);
    }
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
  const hokenPart: string = [
    hoken.shahokokuho ? hoken.shahokokuho.hokenshaBangou : 0,
    hoken.koukikourei ? parseInt(hoken.koukikourei.hokenshaBangou) : 0,
  ].join("|");
  return `<${patientId}>${hokenPart}`;
}

function collectKouhi(items: VisitItem[]): Kouhi[] {
  const list: Kouhi[] = [];
  items.forEach(item => {
    item.hoken.kouhiList.forEach(kouhi => {
      const index = list.findIndex(e => e.kouhiId === kouhi.kouhiId);
      if( index < 0 ){
        list.push(kouhi);
      }
    });
  });
  sortKouhiList(list);
  return list;
}

function resolveEdaban(items: VisitItem[]): string | undefined {
  let onshiEdaban: string | undefined = undefined;
  let hokenshoEdaban: string | undefined = undefined;
  items.forEach(item => {
    if( item.onshiResult ){
      const result = item.onshiResult;
      if( result.resultList.length === 1 ){
        const ri = result.resultList[0];
        if( ri.insuredBranchNumber ){
          onshiEdaban = ri.insuredBranchNumber;
          return;
        }
      }
    }
    if( item.hoken.shahokokuho ){
      const shahokokuho = item.hoken.shahokokuho;
      if( shahokokuho.edaban !== "" ){
        hokenshoEdaban = shahokokuho.edaban;
      }
    }
  })
  return onshiEdaban || hokenshoEdaban;
}
