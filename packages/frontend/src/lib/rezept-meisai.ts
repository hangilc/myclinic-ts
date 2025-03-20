import {
  ConductEx, ConductKizaiEx, ConductShinryouEx, Kouhi, Koukikourei, Shahokokuho, ShinryouEx, ShinryouMaster, Visit, VisitEx
} from "myclinic-model";
import api from "./api";
import { isHoukatsuGroup, type HoukatsuGroup, getHoukatsuStep, houkatsuTenOf, roundTo10 } from "myclinic-rezept";
import { rev診療識別コード } from "myclinic-rezept/dist/codes";
import { calcPayments, mkHokenPayer, type Payer, reorderPayers, PayerObject, type PaymentSetting } from "myclinic-rezept/futan/calc";
import { resolveKouhiPayer, type KouhiContext } from "./resolve-payer";
import { isUnder70, isBirthday75 } from "myclinic-rezept/gendogaku";
import { is診療識別コードCode, type ShotokuKubunCode, type 診療識別コードCode, type 診療識別コードName } from "myclinic-rezept/codes";
import { kizaiKingakuToTen } from "myclinic-rezept/helper";
import { eqArray, type DateWrapperLike, groupBy, groupByGeneric, sqlDateToObject } from "myclinic-util";
import { isUnder6, resolveFutanWari } from "./futan-wari";
import { getKouhiOrderWeight } from "myclinic-rezept/kouhi-order";
import { resolveGendo, resolveShotokuKubun } from "./rezept-adapter";

export async function calcRezeptMeisai(visitId: number): Promise<Meisai> {
  const current = await api.getVisitEx(visitId);
  const hoken = getHokenOfVisit(current);
  const at = current.visitedAt.substring(0, 10);
  if (hoken === undefined) {
    const items: MeisaiItem[] = visitToMeisaiItems(current, at);
    return { items, charge: items.reduce((acc, ele) => acc + ele.ten, 0) * 10, futanWari: 10 };
  } else {
    const futanWari = getFutanWari(hoken, current.visitedAt, current.patient.birthday);
    const birthday = current.patient.birthday;
    const currentItems: MeisaiItem[] = visitToMeisaiItems(current, at);
    const prevs = await getPrevVisits(current.asVisit);
    const visits = [...prevs, current];
    const gendo = await resolveGendo(visits.map(visitEx => visitEx.visitId));
    const shotokuKubun = resolveShotokuKubun(hoken, gendo);
    const prevCharge = calcFutan(prevs, futanWari, at, birthday, shotokuKubun);
    const totalCharge = calcFutan(visits, futanWari, at, birthday, shotokuKubun);
    let charge = roundTo10(totalCharge - prevCharge);
    return {
      items: currentItems,
      futanWari,
      charge
    };
  }
}

function resolveTasuuGaitou(visits: Visit[]): boolean {
  return false;
}

function resolveMarucho(visits: Visit[]): number | undefined {
  return undefined;
}

function createKouhiContext(visits: VisitEx[]): KouhiContext {
  const ctx: KouhiContext = {};
  visits.map(visit => visit.attributes).forEach(attr => {
    if (attr) {
      if (attr.nanbyouGendogaku !== undefined) {
        ctx.nanbyouGendogaku = attr.nanbyouGendogaku;
      }
    }
  })
  return ctx;
}

function calcFutan(visits: VisitEx[], futanWari: number, at: string, birthday: string,
  shotokuKubun: ShotokuKubunCode | undefined): number {
  const hokenRegistry = new HokenRegistry();
  const kouhiRegistry = new KouhiRegistry();
  const payerRegistry = new PayerRegistry();
  const kouhiContext = createKouhiContext(visits);
  const itemsList: [Payer[], MeisaiItem[]][] = visits.map(visit => visitToItems(
    visit, hokenRegistry, kouhiRegistry,
    payerRegistry, at, kouhiContext
  ));
  const grouped: [Payer[], MeisaiItem[]][] = groupByGeneric<Payer[], [Payer[], MeisaiItem[]], MeisaiItem[]>(
    a => a[0], itemsList, eqArray,
    () => [], (acc, item) => [...acc, ...item[1]]
  );
  // grouped.forEach((g, i) => {
  //   console.log(`group(${i})`, g[0].length, g[1].length);
  // });
  const calcs: [number, Payer[]][] = grouped.map(([payers, items]) => [
    totalTenOfMeisaiItems(items) * 10, payers
  ]);
  const ym = sqlDateToObject(at);
  const bd = sqlDateToObject(birthday);
  calcPayments(calcs,
    createPaymentSetting(futanWari, ym, bd, visits.map(v => v.asVisit), shotokuKubun)
  );
  // calcs.forEach((c, i) => {
  //   console.log(`calc(${i})`);
  //   c[1].forEach((p, pi) => {
  //     console.log("  ", `payer(${pi})`, p.payment.kind, p.payment.kakari, p.payment.payment);
  //   })
  // })
  // return calcs.reduce((acc, ele) =>
  //   acc + PayerObject.jikofutanOf(ele[1])
  //   , 0);
  const payers: Payer[] = mergePayers(calcs.flatMap(t => t[1]));
  return PayerObject.jikofutanOf(payers);
}

export function createPaymentSetting(futanWari: number, rezeptYearMonth: { year: number, month: number },
  birthdate: { year: number, month: number, day: number },
  visits: Visit[],
  shotokuKubun: ShotokuKubunCode | undefined,
  isKoukikourei?: boolean,
): Partial<PaymentSetting> {
  const ym = rezeptYearMonth;
  const bd = birthdate;
  return {
    futanWari,
    isUnder70: isUnder70(ym.year, ym.month, bd.year, bd.month, bd.day),
    isBirthdayMonth75: isBirthday75(ym.year, ym.month, bd.year, bd.month, bd.day),
    shotokuKubun,
    isTasuuGaitou: resolveTasuuGaitou(visits),
    isNyuuin: false,
    marucho: resolveMarucho(visits),
    isKoukikourei,
  }
}

// export function parseSqldateToObject(sqldate: string): { year: number, month: number, day: number } {
//   return {
//     year: parseInt(sqldate.substring(0, 4)),
//     month: parseInt(sqldate.substring(5, 7)),
//     day: parseInt(sqldate.substring(8, 10)),
//   }
// }

function mergePayers(payers: Payer[]): Payer[] {
  const list: Payer[] = [];
  payers.forEach(p => {
    if (!list.includes(p)) {
      list.push(p);
    }
  });
  return reorderPayers(list);
}

function visitToItems(
  visit: VisitEx, hokenRegistry: HokenRegistry, kouhiRegistry: KouhiRegistry, payerRegistry: PayerRegistry,
  at: string, kouhiContext: KouhiContext):
  [Payer[], MeisaiItem[]] {
  const hoken = visit.hoken.shahokokuho || visit.hoken.koukikourei;
  if (!hoken) {
    throw new Error("Missing hoken");
  }
  const hokenPayer = hokenRegistry.get(hoken);
  const kouhiPayers = visit.hoken.kouhiList.map(kouhi => {
    return kouhiRegistry.get(kouhi, kouhiContext)
  });
  sortKouhiPayers(kouhiPayers);
  payerRegistry.register(hokenPayer, kouhiPayers);
  return [[hokenPayer, ...kouhiPayers], visitToMeisaiItems(visit, at)];
}

export function getFutanWari(hoken: Shahokokuho | Koukikourei, at: DateWrapperLike, birthdate: DateWrapperLike): number {
  return resolveFutanWari(hoken, () => isUnder6(birthdate, at));
}

function getHokenOfVisit(visit: VisitEx): Shahokokuho | Koukikourei | undefined {
  const hoken = visit.hoken;
  if (hoken.shahokokuho && hoken.koukikourei) {
    throw new Error("Multiple hoken");
  }
  return hoken.shahokokuho || hoken.koukikourei || undefined;
}

export const MeisaiSectionStrings = ["初・再診料", "医学管理等", "在宅医療", "検査", "画像診断", "投薬", "注射", "処置", "その他"] as const;
export type MeisaiSection = typeof MeisaiSectionStrings[number];

const ShinryouShikibetsuCodeNameToMeisaiSectionMap: { [K in 診療識別コードName]: MeisaiSection } = {
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
};

function shinryouShikibetsuCodeNameToMeisaiSection(shikibetsu: 診療識別コードName): MeisaiSection {
  return ShinryouShikibetsuCodeNameToMeisaiSectionMap[shikibetsu];
}

function shinryouMasterToShinryouShikibetsuCodeCode(master: ShinryouMaster): 診療識別コードCode {
  const shinryouShubetsu = Math.floor(parseInt(master.shuukeisaki) / 10).toString();
  if (!is診療識別コードCode(shinryouShubetsu)) {
    throw new Error("Unknown 診療識別コード: " + shinryouShubetsu);
  }
  return shinryouShubetsu;
}

function shinryouMasterToMeisaiSection(master: ShinryouMaster): MeisaiSection {
  const code = shinryouMasterToShinryouShikibetsuCodeCode(master);
  const name = rev診療識別コード[code];
  return shinryouShikibetsuCodeNameToMeisaiSection(name);
}

interface MeisaiItem {
  section: MeisaiSection;
  ten: number;
  label: string;
  count: number;
}

export function totalTenOfMeisaiItems(items: MeisaiItem[]): number {
  return items.reduce((acc, ele) => acc + ele.ten * ele.count, 0);
}

export interface Meisai {
  items: MeisaiItem[];
  futanWari: number;
  charge: number;
}

export class MeisaiWrapper {
  private meisai: Meisai;

  constructor(meisai: Meisai) {
    this.meisai = meisai;
  }

  get items(): MeisaiItem[] {
    return this.meisai.items;
  }

  get futanWari(): number {
    return this.meisai.futanWari;
  }

  get charge(): number {
    return this.meisai.charge;
  }

  getInterface(): Meisai {
    return this.meisai;
  }

  totalTen(): number {
    return this.meisai.items.reduce((acc, ele) => acc + ele.ten, 0);
  }

  getGrouped(): Map<MeisaiSection, { sectionName: string, sectionTotalTen: number, items: MeisaiItem[] }> {
    const itemsMap: Map<MeisaiSection, MeisaiItem[]> = new Map();
    this.meisai.items.forEach(item => {
      const sect = item.section;
      let b = itemsMap.get(sect);
      if (b === undefined) {
        b = [];
        itemsMap.set(sect, b);
      }
      b.push(item);
    })
    const result: Map<MeisaiSection, { sectionName: string, sectionTotalTen: number, items: MeisaiItem[] }> = new Map();
    for (const [sect, items] of itemsMap.entries()) {
      result.set(sect, ({
        sectionName: sect,
        sectionTotalTen: items.reduce((acc, ele) => acc + ele.ten, 0),
        items,
      }))
    }
    return result;
  }
}

class HoukatsuCollector {
  map: Map<HoukatsuGroup, ShinryouEx[]> = new Map();

  add(group: HoukatsuGroup, shinryou: ShinryouEx) {
    let s = this.map.get(group);
    if (!s) {
      s = [];
      this.map.set(group, s);
    }
    s.push(shinryou);
  }
}

function shinryouListToMeisaiItems(shinryouList: ShinryouEx[], at: string): MeisaiItem[] {
  const items: MeisaiItem[] = [];
  const houkatsuCollector = new HoukatsuCollector();
  shinryouList.forEach(s => {
    const houkatsu = s.master.houkatsukensa;
    if (isHoukatsuGroup(houkatsu)) {
      houkatsuCollector.add(houkatsu, s);
    } else {
      items.push({
        section: shinryouMasterToMeisaiSection(s.master),
        ten: parseInt(s.master.tensuuStore),
        label: s.master.name,
        count: 1,
      })
    }
  })
  const step = getHoukatsuStep(at);
  const houkatsuItems: MeisaiItem[] = Array.from(houkatsuCollector.map.entries()).map(([g, l]) => {
    let ten = houkatsuTenOf(g, l.length, step);
    if (ten === undefined) {
      ten = l.reduce((acc, ele) => acc + parseInt(ele.master.tensuuStore), 0);
    }
    return {
      section: "検査",
      ten,
      label: l.map(s => s.master.name).join("、"),
      count: 1,
    }
  })
  items.push(...houkatsuItems);
  return items;
}

function conductShinryouListToMeisaiItems(conductShinryouList: ConductShinryouEx[]): MeisaiItem[] {
  return conductShinryouList.map(s => {
    return {
      section: "処置",
      label: s.master.name,
      ten: parseInt(s.master.tensuuStore),
      count: 1,
    }
  })
}

function kizaiListToMeisaiItems(kizaiList: ConductKizaiEx[]): MeisaiItem[] {
  return kizaiList.map(kizai => {
    const kingaku = parseFloat(kizai.master.kingakuStore)
    return {
      section: "処置",
      label: kizai.master.name,
      ten: kizaiKingakuToTen(kingaku * kizai.amount),
      count: 1,
    }
  })
}

function conductsToMeisaiItems(conducts: ConductEx[]): MeisaiItem[] {
  return conducts.flatMap(conduct => [
    ...conductShinryouListToMeisaiItems(conduct.shinryouList),
    ...kizaiListToMeisaiItems(conduct.kizaiList),
  ]);
}

export function visitToMeisaiItems(visit: VisitEx, at: string): MeisaiItem[] {
  return [
    ...shinryouListToMeisaiItems(visit.shinryouList, at),
    ...conductsToMeisaiItems(visit.conducts)
  ]
}

export function groupMeisaiItemsBySection(items: MeisaiItem[]): [MeisaiSection, MeisaiItem[]][] {
  const map: Map<MeisaiSection, MeisaiItem[]> = new Map();
  items.forEach(item => {
    const bind = map.get(item.section);
    if( bind ){
      bind.push(item);
    } else {
      map.set(item.section, [item]);
    }
  })
  return MeisaiSectionStrings.map(sec => {
    const bind = map.get(sec) ?? [];
    return [sec, bind];
  });
}

async function getPrevVisits(current: Visit): Promise<VisitEx[]> {
  const [year, month] = yearMonthOfVisit(current);
  const monthVisitIds = await api.listVisitIdByPatientAndMonth(current.patientId, year, month);
  const prevVisitIds = monthVisitIds.filter(id => id < current.visitId);
  prevVisitIds.sort();
  const prevVisits: VisitEx[] = [];
  for (const prevVisitId of prevVisitIds) {
    const prevVisit = await api.getVisitEx(prevVisitId);
    const asVisit: Visit = prevVisit.asVisit;
    if (asVisit.shahokokuhoId === current.shahokokuhoId && asVisit.koukikoureiId == current.koukikoureiId) {
      prevVisits.push(prevVisit);
    }
  }
  return prevVisits;
}

function yearMonthOfVisit(visit: Visit): [number, number] {
  const d = visit.visitedAtAsDate;
  return [d.getFullYear(), d.getMonth() + 1];
}

class PayerRegistry {
  private registry: PayerSet[] = [];

  register(hoken: Payer, kouhiList: Payer[]) {
    function addKouhi(kouhiList: Payer[], kouhi: Payer) {
      if (!kouhiList.includes(kouhi)) {
        kouhiList.push(kouhi);
      }
    }
    const set = this.getSet(hoken);
    kouhiList.forEach(kouhi => addKouhi(set.kouhiList, kouhi));
  }

  getPayerSets(): PayerSet[] {
    this.registry.forEach(set => sortKouhiPayers(set.kouhiList));
    return this.registry;
  }

  getSet(hoken: Payer): PayerSet {
    for (let set of this.registry) {
      if (set.hoken === hoken) {
        return set;
      }
    }
    const set = { hoken, kouhiList: [] };
    this.registry.push(set);
    return set;
  }
}

function sortKouhiPayers(kouhiPayers: Payer[]) {
  function w(payer: Payer): number {
    const houbetsu = payer.getHoubetsuBangou();
    if (houbetsu === undefined) {
      throw new Error("Cannot find houbetsu bangou");
    }
    return getKouhiOrderWeight(houbetsu);
  }
  kouhiPayers.sort((a, b) => w(a) - w(b));
}

interface PayerSet {
  hoken: Payer;
  kouhiList: Payer[];
}

export class HokenRegistry {
  registry: Map<string, Payer> = new Map();

  get(hoken: Shahokokuho | Koukikourei): Payer {
    let key: string;
    if (hoken instanceof Shahokokuho) {
      key = `s:${hoken.shahokokuhoId}`;
    } else {
      key = `k:${hoken.koukikoureiId}`;
    }
    let payer = this.registry.get(key);
    if (payer === undefined) {
      payer = mkHokenPayer();
      this.registry.set(key, payer);
    }
    return payer;
  }

  values(): Payer[] {
    return Array.from(this.registry.values());
  }
}

export class KouhiRegistry {
  registry: Map<number, Payer> = new Map();

  get(kouhi: Kouhi, ctx: KouhiContext): Payer {
    let payer = this.registry.get(kouhi.kouhiId);
    if (payer === undefined) {
      payer = resolveKouhiPayer(kouhi, ctx)
      this.registry.set(kouhi.kouhiId, payer);
    }
    return payer;
  }
}