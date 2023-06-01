import api from "@/lib/api";
import type { ClinicInfo, HokenInfo, Kouhi, Koukikourei, Meisai, Patient, Shahokokuho, Visit, VisitEx } from "myclinic-model";
import { OnshiResult } from "onshi-result";
import { 診査支払い機関コード, 診療識別コード } from "./codes";
import { cvtVisitItemsToIyakuhinDataList } from "./iyakuhin-item-util";
import { createコメントレコード } from "./records/comment-record";
import { createレセプト共通レコード } from "./records/common-record";
import { create保険者レコード } from "./records/hokensha-record";
import { mk医薬品レコード } from "./records/iyakuhin-record";
import { create公費レコード } from "./records/kouhi-record";
import { create医療機関情報レコード } from "./records/medical-institute-record";
import { create診療報酬請求書レコード } from "./records/seikyuu-record";
import { create資格確認レコード } from "./records/shikaku-kakunin-record";
import { mk診療行為レコード } from "./records/shinryoukoui-record";
import { create症病名レコード } from "./records/shoubyoumei-record";
import { create症状詳記レコード } from "./records/shoujoushouki-record";
import { mk特定器材レコード } from "./records/tokuteikizai-record";
import { cvtVisitItemsToShinryouDataList } from "./shinryoukoui-item-util";
import { TensuuCollector } from "./tensuu-collector";
import { cvtVisitItemsToKizaiDataList } from "./tokuteikizai-item-util";
import {
  calcFutanKubun,
  calcRezeptCount,
  calcSeikyuuMonth,
  composeDiseaseItem,
  extract都道府県コードfromAddress,
  firstDayOfMonth, hasHoken, is国保, lastDayOfMonth, resolveGendo, resolveGendogakuTokkiJikou, sortKouhiList,
  classify,
  withClassified,
  withClassifiedBy
} from "./util";
import type { VisitItem } from "./visit-item";

class RezeptRecord {
  patientId: number;
  hoken: Shahokokuho | Koukikourei | undefined;
  kouhiList: Kouhi[];
  visits: Visit[];

  constructor(
    patientId: number,
    hoken: Shahokokuho | Koukikourei | undefined,
    kouhiList: Kouhi[],
    visits: Visit[]) {
    this.patientId = patientId;
    this.hoken = hoken;
    this.kouhiList = kouhiList;
    this.visits = visits;
  }
}

async function walkRezeptRecord(year: number, month: number, handler: (rec: RezeptRecord) => void) {
  let visits = await api.listVisitByMonth(year, month);
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
  const visitsWithHoken = await Promise.all(visits.map(async visit => {
    let hoken: Shahokokuho | Koukikourei | undefined;
    let hokenshaBangou: number;
    if (visit.shahokokuhoId > 0) {
      hoken = await api.getShahokokuho(visit.shahokokuhoId);
      hokenshaBangou = hoken.hokenshaBangou;
    } else if (visit.koukikoureiId > 0) {
      hoken = await api.getKoukikourei(visit.koukikoureiId);
      hokenshaBangou = parseInt(hoken.hokenshaBangou);
    } else {
      hoken = undefined;
      hokenshaBangou = 0;
    }
    return { visit, hoken, hokenshaBangou };
  }));
  withClassifiedBy(visitsWithHoken, vh => vh.visit.patientId, (patientId, vs) => {
    withClassifiedBy(vs, vs => vs.hokenshaBangou, (hokenshaBangou, vs) => {

    });
  });
}

async function getVisitItems(year: number, month: number): Promise<[RezeptRecordKey, VisitItem][]> {
  if (visitItemsCache === undefined) {
    const visits = (await api.listVisitByMonth(year, month)).filter(visit => {
      if (visit.shahokokuhoId > 0 && visit.koukikoureiId > 0) {
        throw new Error("重複保険：" + visit.visitId);
      }
      return visit.shahokokuhoId > 0 || visit.koukikoureiId > 0;
    });
    visitItemsCache = await Promise.all(visits.map(async visit => await mkVisitItem(visit)));
    return visitItemsCache;
  } else {
    return visitItemsCache;
  }
}

async function getSeikyuuVisitItems(year: number, month: number):
  Promise<[[RezeptRecordKey, VisitItem][], [RezeptRecordKey, VisitItem][]]> {
  if (shiharaiKikinItemsCache !== undefined && kokuhoRengouItemsCache !== undefined) {
    return [shiharaiKikinItemsCache, kokuhoRengouItemsCache];
  } else {
    shiharaiKikinItemsCache = [];
    kokuhoRengouItemsCache = [];
    const visitItems = await getVisitItems(year, month);
    visitItems.forEach(entry => {
      const [key, item] = entry;
      const hoken = item.hoken;
      if (hoken.shahokokuho) {
        if (is国保(hoken.shahokokuho.hokenshaBangou)) {
          kokuhoRengouItemsCache!.push(entry);
        } else {
          shiharaiKikinItemsCache!.push(entry);
        }
      } else if (hoken.koukikourei) {
        kokuhoRengouItemsCache!.push(entry);
      } else { // 公費のみ
        if (hoken.kouhiList.length === 0) {
          throw new Error("No hoken and no kouhi: " + JSON.stringify(item.visit));
        }
        shiharaiKikinItemsCache!.push(entry);
      }
    });
    return [shiharaiKikinItemsCache, kokuhoRengouItemsCache];
  }
}

export async function createShaho(year: number, month: number): Promise<string> {
  const [shiharaiKikin, _kokuhoRengou] = await getSeikyuuVisitItems(year, month);
  return create(year, month, 診査支払い機関コード.社会保険診療報酬支払基金, shiharaiKikin);
}

export async function createKokuho(year: number, month: number): Promise<string> {
  const [_shiharaiKikin, kokuhoRengou] = await getSeikyuuVisitItems(year, month);
  return create(year, month, 診査支払い機関コード.国民健康保険団体連合会, kokuhoRengou);
}

export type RezeptRecordKey = string;
let visitItemsCache: [RezeptRecordKey, VisitItem][] | undefined = undefined;
let shiharaiKikinItemsCache: [RezeptRecordKey, VisitItem][] | undefined = undefined;
let kokuhoRengouItemsCache: [RezeptRecordKey, VisitItem][] | undefined = undefined;

export async function mkVisitItem(visit: Visit): Promise<[RezeptRecordKey, VisitItem]> {
  const hoken = await api.getHokenInfoForVisit(visit.visitId);
  // sortKouhiList(hoken.kouhiList);
  let onshiResult: OnshiResult | undefined;
  const onshi = await api.findOnshi(visit.visitId);
  if (onshi) {
    onshiResult = OnshiResult.cast(JSON.parse(onshi.kakunin));
  }
  const patient: Patient = await api.getPatient(visit.patientId);
  // const meisai: Meisai = await api.getMeisai(visit.visitId);
  const visitEx: VisitEx = await api.getVisitEx(visit.visitId);
  return [mkRecordKey(visit.patientId, hoken), {
    visit,
    hoken,
    patient,
    onshiResult,
    visitEx,
    comments: [],
    shoukiList: [],
  }];
}

function classifyVisitItems(items: [RezeptRecordKey, VisitItem][]): Map<RezeptRecordKey, VisitItem[]> {
  return classify(items, item => item);
}

async function create(year: number, month: number, 診査機関: number, visitItems: [RezeptRecordKey, VisitItem][]): Promise<string> {
  const rows: string[] = [];
  const [seikyuuYear, seikyuuMonth] = calcSeikyuuMonth(year, month);
  rows.push(await 医療機関情報レコード(seikyuuYear, seikyuuMonth, 診査機関));
  const classified: Map<string, VisitItem[]> = classifyVisitItems(visitItems);
  let serial = 1;
  const firstDay = firstDayOfMonth(year, month);
  const lastDay = lastDayOfMonth(year, month);
  let rezeptCount = 0;
  let rezeptSouten = 0;
  for (let key of classified.keys()) {
    const items = classified.get(key)!;
    const hoken = items[0].hoken;
    const kouhiList: Kouhi[] = collectKouhi(items);
    const kouhiIdList = kouhiList.map(k => k.kouhiId);
    const gendo = resolveGendo(items);
    const tokkijikouGendo = resolveGendogakuTokkiJikou(hoken, gendo);
    const patient: Patient = items[0].patient;
    let tenCol = new TensuuCollector();
    rows.push(createレセプト共通レコード({
      rezeptSerialNumber: serial++,
      hoken: items[0].hoken,
      kouhiList,
      year: year,
      month: month,
      patient,
      tokkkijikouGendogaku: tokkijikouGendo,
    }));
    const shinryouDataList = cvtVisitItemsToShinryouDataList(items, kouhiIdList);
    shinryouDataList.filter(dl => dl.点数 !== undefined).forEach(dl => tenCol.add(dl.負担区分, dl.点数! * dl.回数));
    const iyakuhinDataList = cvtVisitItemsToIyakuhinDataList(items, kouhiIdList);
    iyakuhinDataList.filter(dl => dl.点数 !== undefined).forEach(dl => tenCol.add(dl.負担区分, dl.点数! * dl.回数));
    const kizaiDataList = cvtVisitItemsToKizaiDataList(items, kouhiIdList);
    kizaiDataList.filter(dl => dl.点数 !== undefined).forEach(dl => tenCol.add(dl.負担区分, dl.点数! * dl.回数));
    if (hoken.shahokokuho || hoken.koukikourei) {
      rows.push(create保険者レコード({
        items, souten: tenCol.getHokenTotal(), futanKingaku: undefined,
      }));
    }
    {
      const kouhiTotals: number[] = tenCol.getKouhiTotals();
      kouhiList.forEach((kouhi, index) => {
        rows.push(create公費レコード({
          kouhi, items, souten: kouhiTotals[index]
        }))
      })
    }
    {
      const edaban = resolveEdaban(items);
      if (edaban) {
        rows.push(create資格確認レコード({
          edaban,
        }))
      }
    }
    {
      const ds = await api.listDiseaseActiveAt(patient.patientId, firstDay, lastDay);
      const items = await Promise.all(ds.map(async (d, idx) =>
        await composeDiseaseItem(d.diseaseId, idx === 0)));
      items.forEach(item => {
        rows.push(create症病名レコード({ item }));
      })
    }
    shinryouDataList.forEach(data => rows.push(mk診療行為レコード(data)));
    iyakuhinDataList.forEach(data => rows.push(mk医薬品レコード(data)));
    kizaiDataList.forEach(data => rows.push(mk特定器材レコード(data)));
    items.forEach(visitItem => {
      const futanKubun = calcFutanKubun(hasHoken(visitItem), visitItem.hoken.kouhiList.map(k => k.kouhiId),
        kouhiList.map(k => k.kouhiId));
      visitItem.comments.forEach(comm => {
        rows.push(createコメントレコード({
          shikibetsucode: comm.shikibetsucode ?? 診療識別コード.全体に係る識別コード,
          futanKubun,
          commentcode: comm.commentcode,
          text: comm.text,
        }))
      })
    });
    items.forEach(visitItem => {
      visitItem.shoukiList.forEach(shouki => {
        rows.push(create症状詳記レコード({
          shoujoushoukiKubun: shouki.kubun,
          text: shouki.text,
        }))
      })
    })
    rezeptCount += calcRezeptCount(items);
    rezeptSouten += tenCol.getRezeptSouten();
  }
  rows.push(create診療報酬請求書レコード({
    rezeptCount: rezeptCount,
    totalTen: rezeptSouten,
  }))
  return rows.join("\r\n") + "\r\n\x1A";
}

async function 医療機関情報レコード(year: number, month: number, 診査機関: number): Promise<string> {
  const clinicInfo: ClinicInfo = await api.getClinicInfo();
  console.log(clinicInfo, 診査機関);
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
      if (index < 0) {
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
    if (item.onshiResult) {
      const result = item.onshiResult;
      if (result.resultList.length === 1) {
        const ri = result.resultList[0];
        if (ri.insuredBranchNumber) {
          onshiEdaban = ri.insuredBranchNumber;
          return;
        }
      }
    }
    if (item.hoken.shahokokuho) {
      const shahokokuho = item.hoken.shahokokuho;
      if (shahokokuho.edaban !== "") {
        hokenshoEdaban = shahokokuho.edaban;
      }
    }
  })
  return onshiEdaban || hokenshoEdaban;
}
