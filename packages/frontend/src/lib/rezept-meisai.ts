import { Kouhi, Meisai, Visit, VisitEx } from "myclinic-model";
import api from "./api";
import { resolveKouhiData } from "./resolve-kouhi-data";
import { calcFutan } from "./rezept/futan-calc";
import { calcVisits } from "./rezept/prepare";
import { TensuuCollector } from "./rezept/tensuu-collector";
import { futanWariOfHoken, resolveGendo, resolveShotokuKubun } from "./rezept/util";

class KouhiCollector {
  list: Kouhi[] = [];

  add(kouhi: Kouhi): void {
    if (this.list.findIndex(k => k.kouhiId === kouhi.kouhiId) < 0) {
      this.list.push(kouhi);
    }
  }

  idList(): number[] {
    return this.list.map(k => k.kouhiId);
  }
}

export async function calcRezeptMeisai(visitId: number): Promise<Meisai> {
  const meisai = new Meisai([], 3, 0);
  const visit = await api.getVisit(visitId);
  if( visit.shahokokuhoId === 0 && visit.koukikoureiId === 0 ){
    meisai.futanWari = 10;
    return meisai;
  }
  const [year, month] = yearMonthOfVisit(visit);
  const visitIds = await api.listVisitIdByPatientAndMonth(visit.patientId, year, month);
  const visitExList = await api.batchGetVisitEx(visitIds);
  visitExList.sort((a, b) => a.visitedAt.localeCompare(b.visitedAt));
  let prevs: VisitEx[] = [];
  let curr: VisitEx | undefined = undefined;
  for (let v of visitExList) {
    if (v.visitId === visitId) {
      curr = v;
      break;
    } else {
      const asVisit = v.asVisit;
      if( asVisit.shahokokuhoId === visit.shahokokuhoId && asVisit.koukikoureiId === visit.koukikoureiId ){
        prevs.push(v);
      }
    }
  }
  if (curr === undefined) {
    throw new Error("cannot happen.");
  }
  const kouhiCollector = new KouhiCollector();
  [curr, ...prevs].forEach(v => {
    v.hoken.kouhiList.forEach(k => kouhiCollector.add(k));
  });
  const tensuuCollector = new TensuuCollector();
  const { shinryouDataList, iyakuhinDataList, kizaiDataList } = calcVisits(prevs, kouhiCollector.idList(), tensuuCollector);
  const gendo = await resolveGendo([...prevs, curr].map(visitEx => visitEx.asVisit));
  const shotokuKubun = resolveShotokuKubun(curr.hoken.shahokokuho, curr.hoken.koukikourei, gendo);
  let futanWari = 3;
  if( curr.hoken.shahokokuho && curr.hoken.shahokokuho.koureiStore > 0 ){
    futanWari = curr.hoken.shahokokuho.koureiStore;
  } else {
    futanWari = curr.hoken.koukikourei!.futanWari;
  }
  const kouhiDataList = kouhiCollector.list.map(kouhi => resolveKouhiData(kouhi));
  const cover = calcFutan(futanWari, shotokuKubun, kouhiDataList, [tensuuCollector.totalTen]);

  return meisai;
}

function yearMonthOfVisit(visit: Visit): [number, number] {
  const d = visit.visitedAtAsDate;
  return [d.getFullYear(), d.getMonth() + 1];
}

// import type { Kouhi, VisitEx } from "myclinic-model";
// import api from "./api";
// import { applyRounding } from "./rezept-calc/rezept-charge";
// import { rev診療識別コード, type 診療識別コードCode, type 負担区分コードCode } from "./rezept/codes";
// import { processIyakuhinOfVisitEx } from "./rezept/iyakuhin-item-util";
// import { processShinryouOfVisitEx } from "./rezept/shinryoukoui-item-util";
// import { processKizaiOfVisitEx } from "./rezept/tokuteikizai-item-util";
// import { classify, sortKouhiList } from "./rezept/util";

// const MeisaiSection = {
//   "初・再診料": 1,
//   "医学管理等": 2,
//   "在宅医療": 3,
//   "検査": 4,
//   "画像診断": 5,
//   "投薬": 6,
//   "注射": 7,
//   "処置": 8,
//   "その他": 9,
// } as const;

// type MeisaiSectionKey = keyof typeof MeisaiSection;
// const MeisaiSectionKeys = Object.keys(MeisaiSection) as MeisaiSectionKey[];
// MeisaiSectionKeys.sort((a, b) => MeisaiSection[a] - MeisaiSection[b]);

// function isMeisaiSectionKey(arg: string): arg is MeisaiSectionKey {
//   return Object.keys(MeisaiSection).includes(arg);
// }

// class MeisaiSectionItem {
//   constructor(
//     public tanka: number,
//     public count: number,
//     public label: string
//   ) { }

//   get totalTen(): number {
//     return this.tanka * this.count;
//   }
// }

// class MeisaiSectionData {
//   constructor(
//     public section: MeisaiSectionKey,
//     public entries: MeisaiSectionItem[]
//   ) { }

//   get totalTen(): number {
//     return this.entries.reduce((acc, ele) => {
//       return acc + ele.totalTen;
//     }, 0);
//   }
// }

// class Meisai {
//   store: [MeisaiSectionKey, MeisaiSectionItem][] = [];
//   futanWari: number | undefined = undefined;
//   charge: number = 0;
//   warning: string | undefined = undefined;

//   addData(section: MeisaiSectionKey, item: MeisaiSectionItem): void {
//     this.store.push([section, item]);
//   }

//   get items(): MeisaiSectionData[] {
//     const result: MeisaiSectionData[] = [];
//     const classified = classify(this.store);
//     for (let key of MeisaiSectionKeys) {
//       const entries = classified.get(key);
//       if (entries) {
//         result.push(new MeisaiSectionData(key, entries));
//       }
//     }
//     return result;
//   }

//   get totalTen(): number {
//     return this.items.reduce((acc, ele) => {
//       return acc + ele.totalTen;
//     }, 0);
//   }
// }

// const ShikibetuSectionMap: Record<string, MeisaiSectionKey> = {
//   "全体に係る識別コード": "その他",
//   "初診": "初・再診料",
//   "再診": "初・再診料",
//   "医学管理": "医学管理等",
//   "在宅": "在宅医療",
//   "投薬・内服": "投薬",
//   "投薬・屯服": "投薬",
//   "投薬・外用": "投薬",
//   "投薬・調剤": "投薬",
//   "投薬・処方": "投薬",
//   "投薬・麻毒": "投薬",
//   "投薬・調基": "投薬",
//   "投薬・その他": "投薬",
//   "注射・皮下筋肉内": "注射",
//   "注射・静脈内": "注射",
//   "注射・その他": "注射",
//   "薬剤料減点": "注射",
//   "処置": "処置",
//   "手術": "その他",
//   "麻酔": "その他",
//   "検査・病理": "検査",
//   "画像診断": "画像診断",
//   "その他": "その他",
//   "全体に係る識別コード９９": "その他",
// }

// function revShikibetsu(shikibetsu: 診療識別コードCode): MeisaiSectionKey {
//   return ShikibetuSectionMap[rev診療識別コード[shikibetsu] ?? "その他"];
// }

// function mergeKouhiList(kouhiList: Kouhi[]): Kouhi[] {
//   const result: Kouhi[] = [];
//   kouhiList.forEach(kouhi => {
//     if (!result.find(e => e.kouhiId === kouhi.kouhiId)) {
//       result.push(kouhi);
//     }
//   })
//   sortKouhiList(result);
//   return result;
// }

// function getMergedKouhiList(visits: VisitEx[]): Kouhi[] {
//   return mergeKouhiList(visits.flatMap(v => v.hoken.kouhiList));
// }

// class FutanMap {
//   map: Map<負担区分コードCode, number> = new Map();

//   add(futanCode: 負担区分コードCode, futan: number): void {
//     this.map.set(futanCode, (this.map.get(futanCode) ?? 0) + futan);
//   }
// }

// function calcFutan(visit: VisitEx, prev: VisitEx[]): Map<負担区分コードCode, number> {
//   prev.sort((a, b) => a.visitedAt.localeCompare(b.visitedAt));
//   const kouhiList = getMergedKouhiList([visit, ...prev]);
//   const kouhiIdList = kouhiList.map(kouhi => kouhi.kouhiId);
//   const futanMap = new FutanMap();
//   throw new Error("Not implemented yet");
// }

// function applyHoken(hoken: any, charge: any): any {
//   throw new Error("Not implemented");
// }

// async function calcMeisai(visitId: number): Promise<Meisai> {
//   const visit: VisitEx = await api.getVisitEx(visitId);
//   const meisai = new Meisai();
//   const kouhiIdList = visit.asVisit.kouhiIdList;
//   processShinryouOfVisitEx(visit, kouhiIdList, (shikibetsu, _futanKubun, _sqldate, item) => {
//     const ten = item.ten;
//     const sectItem = new MeisaiSectionItem(ten, 1, item.label);
//     meisai.addData(revShikibetsu(shikibetsu), sectItem);
//   });
//   processIyakuhinOfVisitEx(visit, kouhiIdList, (shikibetsu, _futanKubun, _sqldate, item) => {
//     const ten = item.ten;
//     const sectItem = new MeisaiSectionItem(ten, 1, item.label);
//     meisai.addData(revShikibetsu(shikibetsu), sectItem);
//   });
//   processKizaiOfVisitEx(visit, kouhiIdList, (shikibetsu, _futanKubun, _sqldate, item) => {
//     const ten = item.ten;
//     const sectItem = new MeisaiSectionItem(ten, 1, item.label);
//     meisai.addData(revShikibetsu(shikibetsu), sectItem);
//   });
//   const hoken = visit.hoken.shahokokuho || visit.hoken.koukikourei;
//   const kouhiList = visit.hoken.kouhiList;
//   sortKouhiList(kouhiList);
//   let charge = meisai.totalTen * 10;
//   if( hoken ) {
//     const result = applyHoken(hoken, charge);
//     meisai.futanWari = result.futanWari;
//     charge = result.charge;
//   }
//   for(let kouhi of kouhiList){
//     const result = applyKouhi(charge, kouhi);
//     charge = result.charge;
//     if( result.charge !== undefined ){
//       meisai.charge = result.charge;
//     }
//     if( result.unsupported ){
//       meisai.warning = "[Unsupported] " + result.warningMessage ?? "";
//       break;
//     }
//   }
//   meisai.charge = applyRounding(charge);
//   console.log("souten", meisai.totalTen);
//   console.log("charge", meisai.charge);
//   console.log("futanWari", meisai.futanWari);
//   console.log("meisai", meisai.items);
//   return meisai;
// }

