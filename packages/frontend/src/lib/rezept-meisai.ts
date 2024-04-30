import { Kouhi, Koukikourei, Meisai, MeisaiSectionData, MeisaiSectionEnum, MeisaiSectionItem, MeisaiSectionType, Patient, Shahokokuho, Visit, VisitEx } from "myclinic-model";
import api from "./api";
import { createHokensha, createRezeptKouhi, cvtModelVisitsToRezeptVisits, cvtVisitsToUnit, HokenCollector, resolveGendo, resolveShotokuKubun } from "./rezept-adapter";
import { calcVisits, Combiner, roundTo10, TensuuCollector } from "myclinic-rezept";
import { rev診療識別コード, 診療識別コード} from "myclinic-rezept/dist/codes";
import type { Hokensha, RezeptKouhi, RezeptVisit } from "myclinic-rezept/rezept-types";
import { calcPayments, type Payer } from "myclinic-rezept/futan/calc";
import { resolveHokenPayer, resolveKouhiPayer } from "./resolve-payer";
import { calcGendogaku, type GendogakuOptions } from "myclinic-rezept/gendogaku";
import { calcAge } from "./calc-age";
import type { ShotokuKubunCode, 診療識別コードName } from "myclinic-rezept/codes";
import { type HokenCollection, unifyHokenList } from "myclinic-rezept/hoken-collector";

// const MeisaiSectionTypes: MeisaiSectionType[] = Object.values(MeisaiSectionEnum);

// const ShikibetuSectionMap: Record<string, string> = {
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

export async function calcRezeptMeisai(visitId: number): Promise<Meisai> {
  const current = await api.getVisitEx(visitId);
  const prevs = await getPrevVisits(current.asVisit);
  const hokenCollection = createHokenCollection([...prevs, current]);
  return new Meisai([], 3, 0);
}

interface MeisaiItem {
  
}

function createHokenCollection(visits: VisitEx[]): HokenCollection | undefined {
  const hokenRegistry = new HokenRegistry();
  const kouhiRegistry = new KouhiRegistry();
  const args = visits.filter(visit => {
    const hoken = visit.hoken;
    if( hoken.shahokokuho && hoken.koukikourei ){
      throw new Error("Duplicate hoken");
    }
    return hoken.shahokokuho || hoken.koukikourei;
  }).map(visit => {
    let hokensha: Hokensha;
    if( visit.hoken.shahokokuho ){
      hokensha = hokenRegistry.getByShahokokuho(visit.hoken.shahokokuho);
    } else if( visit.hoken.koukikourei ){
      hokensha = hokenRegistry.getByKoukikourei(visit.hoken.koukikourei);
    } else {
      throw new Error("Cannot happen");
    }
    let kouhiList: RezeptKouhi[] = visit.hoken.kouhiList.map(k => kouhiRegistry.get(k));
    return { hokensha, kouhiList };
  })
  const cols = unifyHokenList(args);
  if( cols.length >= 2 ){
    throw new Error("Cannot happen");
  }
  return cols[0];
}

class HokenRegistry {
  shahokokuhoRegistry: Map<number, Hokensha> = new Map();
  koukikoureiRegistry: Map<number, Hokensha> = new Map();

  getByShahokokuho(src: Shahokokuho): Hokensha {
    let h = this.shahokokuhoRegistry.get(src.shahokokuhoId);
    if( h === undefined ){
      h = createHokensha(src, undefined);
      if( h === undefined ){
        throw new Error("Failed to create hokensha.");
      }
      this.shahokokuhoRegistry.set(src.shahokokuhoId, h);
    }
    return h;
  }

  getByKoukikourei(src: Koukikourei): Hokensha {
    let h = this.koukikoureiRegistry.get(src.koukikoureiId);
    if( h === undefined ){
      h = createHokensha(undefined, src);
      if( h === undefined ){
        throw new Error("Failed to create hokensha.");
      }
      this.koukikoureiRegistry.set(src.koukikoureiId, h);
    }
    return h;
  }
}

class KouhiRegistry {
  registry: Map<number, RezeptKouhi> = new Map();

  get(kouhi: Kouhi): RezeptKouhi {
    let k = this.registry.get(kouhi.kouhiId);
    if( k === undefined ){
      k = createRezeptKouhi(kouhi);
      this.registry.set(kouhi.kouhiId, k);
    }
    return k;
  }
}

async function getPrevVisits(current: Visit): Promise<VisitEx[]> {
  const [year, month] = yearMonthOfVisit(current);
  const monthVisitIds = await api.listVisitIdByPatientAndMonth(current.patientId, year, month);
  const prevVisitIds = monthVisitIds.filter(id => id < current.visitId);
  prevVisitIds.sort();
  const prevVisits: VisitEx[] = [];
  for(const prevVisitId of prevVisitIds){
    const prevVisit = await api.getVisitEx(prevVisitId);
    const asVisit: Visit = prevVisit.asVisit;
    if( asVisit.shahokokuhoId === current.shahokokuhoId && asVisit.koukikoureiId == current.koukikoureiId ){
      prevVisits.push(prevVisit);
    }
  }
  return prevVisits;
}

function yearMonthOfVisit(visit: Visit): [number, number] {
  const d = visit.visitedAtAsDate;
  return [d.getFullYear(), d.getMonth() + 1];
}

// export async function calcRezeptMeisaiBak(visitId: number): Promise<Meisai> {
//   const meisai = new Meisai([], 3, 0);
//   initMeisaiItems(meisai);
//   const visit = await api.getVisit(visitId);
//   if (visit.shahokokuhoId === 0 && visit.koukikoureiId === 0) {
//     meisai.futanWari = 10;
//     return meisai;
//   }
//   if (visit.shahokokuhoId !== 0 && visit.koukikoureiId !== 0) {
//     throw new Error("Dupliecate hoken");
//   }
//   const [year, month] = yearMonthOfVisit(visit);
//   const visitIds = await api.listVisitIdByPatientAndMonth(visit.patientId, year, month);
//   const visitExList = await api.batchGetVisitEx(visitIds);
//   visitExList.sort((a, b) => a.visitedAt.localeCompare(b.visitedAt));
//   let prevs: VisitEx[] = [];
//   let curr: VisitEx | undefined = undefined;
//   for (let v of visitExList) {
//     if (v.visitId === visitId) {
//       curr = v;
//       break;
//     } else {
//       const asVisit = v.asVisit;
//       if (asVisit.shahokokuhoId === visit.shahokokuhoId && asVisit.koukikoureiId === visit.koukikoureiId) {
//         prevs.push(v);
//       }
//     }
//   }
//   if (curr === undefined) {
//     throw new Error("cannot happen.");
//   }
//   const hokenCollector = new HokenCollector();
//   hokenCollector.scanVisits([curr, ...prevs]);
//   const gendo = await resolveGendo([...prevs, curr].map(visitEx => visitEx.visitId));
//   const shotokuKubun = resolveShotokuKubun(curr.hoken.shahokokuho, curr.hoken.koukikourei, gendo);
//   let futanWari = 3;
//   if (curr.hoken.shahokokuho) {
//     if (curr.hoken.shahokokuho.koureiStore > 0) {
//       futanWari = curr.hoken.shahokokuho.koureiStore;
//     }
//   } else if (curr.hoken.koukikourei) {
//     futanWari = curr.hoken.koukikourei!.futanWari;
//   }
//   // const kouhiDataList = hokenCollector.kouhiList.map(kouhi => resolveKouhiData(kouhi));
//   // let prevCover: TotalCover;
//   let prevRezeptVisits = await cvtModelVisitsToRezeptVisits(prevs, hokenCollector);
//   let jikofutan = 0;
//   { // new dev
//     const [prevTotalTen, prevPayers] = calcPaymentsOfVisits(prevRezeptVisits, shotokuKubun, hokenCollector, curr.patient, year, month);
//     const currRezeptVisits = (await cvtVisitsToUnit([curr, ...prevs].map(v => v.asVisit))).visits;
//     const [currTotalTen, currPayers] = calcPaymentsOfVisits(currRezeptVisits, shotokuKubun, hokenCollector, curr.patient, year, month);
//     const prevJikofutan = calcJikofutan(prevTotalTen * 10, prevPayers);
//     const currJikofutan = calcJikofutan(currTotalTen * 10, currPayers);
//     jikofutan = currJikofutan - prevJikofutan;
//   } // end of new dev
//   // {
//   //   const tensuuCollector = new TensuuCollector();
//   //   const comb = new Combiner();
//   //   calcVisits(prevRezeptVisits, tensuuCollector, comb);
//   //   prevCover = calcFutan(futanWari, shotokuKubun, kouhiDataList, tensuuCollector.totalTen);
//   // }
//   // let cover: TotalCover;
//   // {
//   //   const tensuuCollector = new TensuuCollector();
//   //   const comb = new Combiner();
//   //   const currRezeptVisits = (await cvtVisitsToUnit([curr, ...prevs].map(v => v.asVisit))).visits;
//   //   calcVisits(currRezeptVisits, tensuuCollector, comb);
//   //   cover = calcFutan(futanWari, shotokuKubun, kouhiDataList, tensuuCollector.totalTen);
//   // }
//   {
//     const tensuuCollector = new TensuuCollector();
//     const comb = new Combiner();
//     const currRezeptVisits = (await cvtVisitsToUnit([curr].map(v => v.asVisit))).visits;
//     calcVisits(currRezeptVisits, tensuuCollector, comb);
//     comb.iterMeisai((shikibetsu, futanKubun, ten, count, label) => {
//       const shikibetsuName = rev診療識別コード[shikibetsu];
//       const section = cvtShinryouShikibetsuCodeToMeisaiSection(shikibetsuName);
//       const item = new MeisaiSectionItem(ten, count, label);
//       addToMeisai(meisai, section, item);
//     });
//   }
//   cleanupMeisaiItems(meisai);
//   meisai.futanWari = futanWari;
//   // meisai.charge = roundTo10(cover.patientCharge - prevCover.patientCharge);
//   meisai.charge = roundTo10(jikofutan);
//   return meisai;
// }


// function resolvePayers(hokenCollector: HokenCollector, hokenGendogaku?: number): Payer[] {
//   let hoken: Shahokokuho | Koukikourei | undefined = hokenCollector.getHoken();
//   const payers: Payer[] = [];
//   if (hoken) {
//     payers.push(resolveHokenPayer(hoken, hokenGendogaku));
//   }
//   const kouhiContext = {};
//   payers.push(...hokenCollector.kouhiList.map(kouhi => resolveKouhiPayer(kouhi, kouhiContext)))
//   console.log("payers", payers);
//   return payers;
// }

// function hasKuniKouhi(kouhiList: Kouhi[]): boolean {
//   for (const kouhi of kouhiList) {
//     const houbetsu = Math.floor(kouhi.futansha / 1000000);
//     if (isKuniKouhi2(houbetsu, kouhi.futansha)) {
//       return true;
//     }
//   }
//   return false;
// }

// function hasSeikatsuHogo(kouhiList: Kouhi[]): boolean {
//   for (const kouhi of kouhiList) {
//     const houbetsu = Math.floor(kouhi.futansha / 1000000);
//     if (houbetsu === 12) {
//       return true;
//     }
//   }
//   return false;
// }

// function isBirthdayMonth75(patient: Patient, year: number, month: number): boolean {
//   const bd = new Date(patient.birthday)
//   const m = bd.getMonth() + 1;
//   if (m === month) {
//     return calcAge(bd, new Date(year, month - 1, 1)) === 75;
//   }
//   return false;
// }

// function calcPaymentsOfVisits(visits: RezeptVisit[], shotokuKubun: ShotokuKubunCode | undefined,
//   hokenCollector: HokenCollector, patient: Patient, year: number, month: number
// ): [number, Payer[]] {
//   const tensuuCollector = new TensuuCollector();
//   const comb = new Combiner();
//   calcVisits(visits, tensuuCollector, comb);
//   const totalTen = [...tensuuCollector.totalTen.values()].reduce((a, e) => a + e, 0);;
//   let hokenGendogaku: number | undefined = undefined;
//   if (shotokuKubun) {
//     const opt: GendogakuOptions = {
//       hasKuniKouhi: hasKuniKouhi(hokenCollector.kouhiList),
//       isTasuuGaitou: false, // 直近12カ月の間に3回以上高額療養費の対象になったか
//       isBirthdayMonth75: isBirthdayMonth75(patient, year, month),
//       isNyuuin: false,
//       isSeikatsuHogo: hasSeikatsuHogo(hokenCollector.kouhiList),
//     };
//     hokenGendogaku = calcGendogaku(shotokuKubun, totalTen * 10, opt);
//   }
//   const payers = resolvePayers(hokenCollector, hokenGendogaku);
//   calcPayments(totalTen * 10, payers);
//   return [totalTen, payers];
// }

// function cvtShinryouShikibetsuCodeToMeisaiSection(shikibetsu: 診療識別コードName): MeisaiSectionType {
//   const m = MeisaiSectionEnum;
//   switch(shikibetsu){
//     case "全体に係る識別コード": return m.Sonota;
//     case "初診": return m.ShoshinSaishin;
//     case "再診": return m.ShoshinSaishin;
//     case "医学管理": return m.IgakuKanri;
//     case "在宅": return m.Zaitaku;
//     case "投薬・内服": return m.Touyaku;
//     case "投薬・屯服": return m.Touyaku;
//     case "投薬・外用": return m.Touyaku;
//     case "投薬・調剤": return m.Touyaku;
//     case "投薬・処方": return m.Touyaku;
//     case "投薬・麻毒": return m.Touyaku;
//     case "投薬・調基": return m.Touyaku;
//     case "投薬・その他": return m.Touyaku;
//     case "注射・皮下筋肉内": return m.Chuusha;
//     case "注射・静脈内": return m.Chuusha;
//     case "注射・その他": return m.Chuusha;
//     case "薬剤料減点": return m.Touyaku;
//     case "処置": return m.Shochi;
//     case "手術": return m.Sonota;
//     case "麻酔": return m.Sonota;
//     case "検査・病理": return m.Kensa;
//     case "画像診断": return m.Gazou;
//     case "その他": return m.Sonota;
//     case "全体に係る識別コード９９": return m.Sonota;
//     default: throw new Error(`Unknown shikibetsu: ${shikibetsu}`)
//   }
// }

// function initMeisaiItems(meisai: Meisai) {
//   Object.values(MeisaiSectionEnum).forEach(sect => {
//     const data = new MeisaiSectionData(sect, []);
//     meisai.items.push(data);
//   })
// }

// function addToMeisai(meisai: Meisai, section: MeisaiSectionType, item: MeisaiSectionItem) {
//   for(const data of meisai.items){
//     if( data.section === section ){
//       data.entries.push(item);
//       return;
//     }
//   }
//   console.error("Unknown section", section);
// }

// function cleanupMeisaiItems(meisai: Meisai) {
//   meisai.items = meisai.items.filter(item => item.entries.length > 0);
// }