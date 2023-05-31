import type { HokenInfo, Visit } from "myclinic-model";
import api from "./api";
import { classifyVisitItems, mkVisitItem } from "./rezept/create";
import { cvtVisitItemsToIyakuhinDataList } from "./rezept/iyakuhin-item-util";
import { cvtVisitItemsToShinryouDataList, mkShinryouUnits, processShinryouOfVisit } from "./rezept/shinryoukoui-item-util";
import { cvtVisitItemsToKizaiDataList } from "./rezept/tokuteikizai-item-util";
import type { VisitItem } from "./rezept/visit-item";

export const MeisaiSection = {
  "初・再診料": 1,
  "医学管理等": 2,
  "在宅医療": 3,
  "検査": 4,
  "画像診断": 5,
  "投薬": 6,
  "注射": 7,
  "処置": 8,
  "その他": 9,
} as const;

export type MeisaiSectionKey = keyof typeof MeisaiSection;
export const MeisaiSectionKeys = Object.keys(MeisaiSection) as MeisaiSectionKey[];
MeisaiSectionKeys.sort((a, b) => MeisaiSection[a] - MeisaiSection[b]);

export function isMeisaiSectionKey(arg: string): arg is MeisaiSectionKey {
  return Object.keys(MeisaiSection).includes(arg);
}

export class MeisaiSectionItem {
  constructor(
    public tanka: number,
    public count: number,
    public label: string
  ) { }

  get totalTen(): number {
    return this.tanka * this.count;
  }
}

export class MeisaiSectionData {
  constructor(
    public section: MeisaiSectionKey,
    public entries: MeisaiSectionItem[]
  ) { }

  get totalTen(): number {
    return this.entries.reduce((acc, ele) => {
      return acc + ele.totalTen;
    }, 0);
  }
}

export class Meisai {
  items: MeisaiSectionData[] = [];
  futanWari: number | undefined;
  charge: number = 0;

  constructor(futanWari: number | undefined) {
    this.futanWari = futanWari;
  }

  addData(data: MeisaiSectionData): void {
    this.items.push(data);
  }

  get totalTen(): number {
    return this.items.reduce((acc, ele) => {
      return acc + ele.totalTen;
    }, 0);
  }
}

function calcHokenFutanWari(hoken: HokenInfo): number | undefined {
  if( hoken.shahokokuho ){
    const kourei = hoken.shahokokuho.koureiStore;
    if( kourei > 0 ){
      return kourei;
    } else {
      return 3;
    }
  } else if( hoken.koukikourei ){
    return hoken.koukikourei.futanWari;
  }
  return undefined;
}

export async function calcMeisai(visitId: number): Promise<Meisai> {
  const visit = await api.getVisit(visitId);
  const [_key, item] = await mkVisitItem(visit);
  const meisai = new Meisai(calcHokenFutanWari(item.hoken));
  processShinryouOfVisit(item, (shikibetsu, futanKubun, sqldate, item) => {

  })
  return meisai;
}

async function calcSimple(items: VisitItem[], kouhiIdList: number[]): Promise<Meisai> {
  const hoken = items[0].hoken;
  if( hoken.shahokokuho || hoken.koukikourei ){
    return calcSimpleHoken(items, kouhiIdList);
  } else {
    return calcSimpleKouhiOnly(items, kouhiIdList);
  }
}

const ShikibetuSectionMap: Record<string, MeisaiSectionKey> = {
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

async function calcSimpleHoken(items: VisitItem[], kouhiIdList: number[]): Promise<Meisai> {
  const hoken = items[0].hoken;
  let futanWari = 3;
  if( hoken.shahokokuho ){
    const kourei = hoken.shahokokuho.koureiStore;
    if( kourei > 0 ){
      futanWari = kourei;
    }
  } else if( hoken.koukikourei ){
    futanWari = hoken.koukikourei.futanWari;
  }
  const meisai = new Meisai([], futanWari, 0);
  mkShinryouUnits(items, kouhiIdList);
  cvtVisitItemsToShinryouDataList(items, kouhiIdList).forEach(data => {
    const sectKey: MeisaiSectionKey = ShikibetuSectionMap[data.診療識別] ?? "その他";
  });
  return meisai;
}

async function calcSimpleKouhiOnly(items: VisitItem[], kouhiIdList: number[]): Promise<Meisai> {
  throw new Error("Not omplemented");
}
