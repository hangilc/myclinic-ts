import { Kouhi, Koukikourei, Meisai, MeisaiSectionEnum, MeisaiSectionType, Shahokokuho, Visit, VisitEx } from "myclinic-model";
import api from "./api";
import { resolveKouhiData } from "./resolve-kouhi-data";
import { cvtModelVisitsToRezeptVisits, cvtVisitsToUnit, HokenCollector, resolveGendo, resolveShotokuKubun, sortKouhiList } from "./rezept-adapter";
import { calcFutan, calcVisits, Combiner, roundTo10, TensuuCollector, type TotalCover } from "myclinic-rezept";
import { rev診療識別コード } from "myclinic-rezept/dist/codes";
import type { RezeptVisit } from "myclinic-rezept/rezept-types";
import type { Payer } from "myclinic-rezept/futan/calc";
import { resolveHokenPayer, resolveKouhiPayer } from "./resolve-payer";
import { calcGendogaku } from "myclinic-rezept/gendogaku";

const MeisaiSectionTypes: MeisaiSectionType[] = Object.values(MeisaiSectionEnum);

const ShikibetuSectionMap: Record<string, string> = {
  "全体に係る識別コード": "その他",
  "初診": "初・再診料",
  "再診": "初・再診料",
  "医学管理": "医学管理等",
  "在宅": "在宅医療",
  "投薬・内服": "投薬",
  "投薬・屯服": "投薬",
  "投薬・外用": "投薬",
  "投薬・調剤": "投薬",
  "投薬・処方": "投薬",
  "投薬・麻毒": "投薬",
  "投薬・調基": "投薬",
  "投薬・その他": "投薬",
  "注射・皮下筋肉内": "注射",
  "注射・静脈内": "注射",
  "注射・その他": "注射",
  "薬剤料減点": "注射",
  "処置": "処置",
  "手術": "その他",
  "麻酔": "その他",
  "検査・病理": "検査",
  "画像診断": "画像診断",
  "その他": "その他",
  "全体に係る識別コード９９": "その他",
}

export async function calcRezeptMeisai(visitId: number): Promise<Meisai> {
  const meisai = new Meisai([], 3, 0);
  const visit = await api.getVisit(visitId);
  if (visit.shahokokuhoId === 0 && visit.koukikoureiId === 0) {
    meisai.futanWari = 10;
    return meisai;
  }
  if (visit.shahokokuhoId !== 0 && visit.koukikoureiId !== 0) {
    throw new Error("Dupliecate hoken");
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
      if (asVisit.shahokokuhoId === visit.shahokokuhoId && asVisit.koukikoureiId === visit.koukikoureiId) {
        prevs.push(v);
      }
    }
  }
  if (curr === undefined) {
    throw new Error("cannot happen.");
  }
  const hokenCollector = new HokenCollector();
  hokenCollector.scanVisits([curr, ...prevs]);
  const gendo = await resolveGendo([...prevs, curr].map(visitEx => visitEx.visitId));
  const shotokuKubun = resolveShotokuKubun(curr.hoken.shahokokuho, curr.hoken.koukikourei, gendo);
  let futanWari = 3;
  if (curr.hoken.shahokokuho) {
    if (curr.hoken.shahokokuho.koureiStore > 0) {
      futanWari = curr.hoken.shahokokuho.koureiStore;
    }
  } else if (curr.hoken.koukikourei) {
    futanWari = curr.hoken.koukikourei!.futanWari;
  }
  const kouhiDataList = hokenCollector.kouhiList.map(kouhi => resolveKouhiData(kouhi));
  let prevCover: TotalCover;
  let prevRezeptVisits = await cvtModelVisitsToRezeptVisits(prevs, hokenCollector);
  { // new dev

    {
      const tensuuCollector = new TensuuCollector();
      const comb = new Combiner();
      calcVisits(prevRezeptVisits, tensuuCollector, comb);
      const totalTen = tensuuCollector.totalTen;
      const hokenGendo = calcGendogaku(shotokuKubun, totalTen * 10, )
    }
  }
  {
    const tensuuCollector = new TensuuCollector();
    const comb = new Combiner();
    calcVisits(prevRezeptVisits, tensuuCollector, comb);
    prevCover = calcFutan(futanWari, shotokuKubun, kouhiDataList, tensuuCollector.totalTen);
  }
  let cover: TotalCover;
  {
    const tensuuCollector = new TensuuCollector();
    const comb = new Combiner();
    const currRezeptVisits = (await cvtVisitsToUnit([curr, ...prevs].map(v => v.asVisit))).visits;
    calcVisits(currRezeptVisits, tensuuCollector, comb);
    cover = calcFutan(futanWari, shotokuKubun, kouhiDataList, tensuuCollector.totalTen);
  }
  {
    const tensuuCollector = new TensuuCollector();
    const comb = new Combiner();
    const currRezeptVisits = (await cvtVisitsToUnit([curr].map(v => v.asVisit))).visits;
    calcVisits(currRezeptVisits, tensuuCollector, comb);
    comb.iterMeisai((shikibetsu, futanKubun, ten, count, label) => {
      const shikibetsuName = rev診療識別コード[shikibetsu];
      console.log(shikibetsuName);
    });
  }
  meisai.futanWari = futanWari;
  meisai.charge = roundTo10(cover.patientCharge - prevCover.patientCharge);
  return meisai;
}

function yearMonthOfVisit(visit: Visit): [number, number] {
  const d = visit.visitedAtAsDate;
  return [d.getFullYear(), d.getMonth() + 1];
}

function resolvePayers(hokenCollector: HokenCollector): Payer[] {
  let hoken: Shahokokuho | Koukikourei | undefined = hokenCollector.getHoken();
  const payers: Payer[] = [];
  if( hoken ){
    payers.push(resolveHokenPayer(hoken));
  }
  const kouhiContext = {};
  payers.push(...hokenCollector.kouhiList.map(kouhi => resolveKouhiPayer(kouhi, kouhiContext)))
  return payers;
}

// function calcPayments(visits: RezeptVisit[]): { totalTen: number } {
//   const tensuuCollector = new TensuuCollector();
//   const comb = new Combiner();
//   calcVisits(visits, tensuuCollector, comb);
//   tensuuCollector.
//   return calcFutan(futanWari, shotokuKubun, kouhiDataList, tensuuCollector.totalTen);
// }