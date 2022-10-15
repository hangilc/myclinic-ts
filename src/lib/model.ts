
export interface Patient {
  patientId: number,
  lastName: string,
  firstName: string,
  lastNameYomi: string,
  firstNameYomi: string,
  sex: string,
  birthday: string,
  address: string,
  phone: string
}

export interface Visit {
  visitId: number,
  patientId: number,
  visitedAt: string,
  shahokokuhoId: number,
  roujinId: number,
  kouhi1Id: number,
  kouhi2Id: number,
  kouhi3Id: number,
  koukikoureiId: number,
  attributesStore: string | null
}

export const WqueueState = {
  WaitExam: 0,
  InExam: 1,
  WaitCashier: 2,
  WaitDrug: 3,
  WaitReExam: 4,
} as const;

export type WqueueStateKey = keyof typeof WqueueState;

export class WqueueStateData {
  constructor(
    code: number,
    label: string
  ) {}
}

export const WqueueStateObject: Record<WqueueStateKey, WqueueStateData> = {
  "WaitExam": new WqueueStateData(0, "診待"),
  "InExam": new WqueueStateData(1, "診中"),
  "WaitCashier": new WqueueStateData(2, "会待"),
  "WaitDrug": new WqueueStateData(3, "薬待"),
  "WaitReExam": new WqueueStateData(4, "再待"),
}

export interface Wqueue {
  visitId: number,
  waitState: number
}

export interface Shahokokuho {
  shahokokuhoId: number,
  patientId: number,
  hokenshaBangou: number,
  hihokenshaKigou: string,
  hihokenshaBangou: string,
  honninStore: number,
  validFrom: string,
  validUpto: string,
  koureiStore: number,
  edaban: string
}

export interface Roujin {
  roujinId: number,
  patientId: number,
  shichouson: number,
  jukyuusha: number,
  futanWari: number,
  validFrom: string,
  validUpto: string
}

export interface Koukikourei {
  koukikoureiId: number,
  patientId: number,
  hokenshaBangou: string,
  hihokenshaBangou: string,
  futanWari: number,
  validFrom: string,
  validUpto: string
}

export interface Kouhi {
  kouhiId: number,
  futansha: number,
  jukyuusha: number,
  validFrom: string,
  validUpto: string,
  patientId: number
}

export interface HokenInfo {
  shahokokuho?: Shahokokuho,
  roujin?: Roujin,
  koukikourei: Koukikourei,
  kouhiList: Kouhi[]
}

export class Text {
  textId: number;
  visitId: number;
  content: string;

  constructor(textId: number, visitId: number, content: string) {
    this.textId = textId;
    this.visitId = visitId;
    this.content = content;
  }
}

export interface Charge {
  visitId: number,
  charge: number
}

export interface Payment {
  visitId: number,
  amount: number,
  paytime: string
}

export interface IyakuhinMaster {
  iyakuhincode: number,
  yakkacode: string,
  name: string,
  yomi: string,
  unit: string,
  yakkaStore: string,
  madoku: string,
  kouhatsu: string,
  zaikei: string,
  validFrom: string,
  validUpto: string
}

export interface ShinryouMaster {
  shinryoucode: number,
  name: string,
  tensuuStore: string,
  tensuuShikibetsu: string,
  shuukeisaki: string,
  houkatsukensa: string,
  oushinkubun: string,
  kensagroup: string,
  validFrom: string,
  validUpto: string
}

export interface KizaiMaster {
  kizaicode: number,
  name: string,
  yomi: string,
  unit: string,
  kingakuStore: string,
  validFrom: string,
  validUpto: string
}

export interface DrugEx {
  drugId: number,
  visitId: number,
  iyakuhincode: number,
  amount: number,
  usage: string,
  days: number,
  categoryStore: number,
  prescribed: boolean,
  master: IyakuhinMaster
}

export interface ShinryouEx {
  shinryouId: number,
  visitId: number,
  shinryoucode: number,
  master: ShinryouMaster
}

export interface ConductDrugEx {
  conductDrugId: number,
  conductId: number,
  iyakuhincode: number,
  amount: number,
  master: IyakuhinMaster
}

export interface ConductShinryouEx {
  conductShinryouId: number,
  conductId: number,
  shinryoucode: number,
  master: ShinryouMaster
}

export interface ConductKizaiEx {
  conductKizaiId: number,
  conductId: number,
  kizaicode: number,
  amount: number,
  master: KizaiMaster
}

export type ConductKindKey = "HikaChuusha" | "JoumyakuChuusha" |
  "OtherChuusha" | "Gazou";

export type ConductKindTag = Record<ConductKindKey, any>;

export class ConductKindType {
  constructor(
    code: number,
    rep: string
  ) {}
}

export const ConductKind: Record<ConductKindKey, ConductKindType> = {
  HikaChuusha: new ConductKindType(0, "皮下・筋肉注射"),
  JoumyakuChuusha: new ConductKindType(1, "静脈注射"),
  OtherChuusha: new ConductKindType(2, "その他の注射"),
  Gazou: new ConductKindType(3, "画像")
};

export const ConductKindObject = {
  fromTag(tag: ConductKindTag ): ConductKindType {
    const key: ConductKindKey = Object.keys(tag)[0] as ConductKindKey;
    return ConductKind[key];
  }
}

export interface ConductEx {
  conductId: number,
  visitId: number,
  kind: ConductKindTag,
  gazouLabel?: String,
  drugs: ConductDrugEx[],
  shinryouList: ConductShinryouEx[],
  kizaiList: ConductKizaiEx[]
}

export interface VisitEx {
  visitId: number,
  visitedAt: string,
  attributesStore?: string,
  patient: Patient,
  hoken: HokenInfo,
  texts: Text[],
  drugs: DrugEx[],
  shinryouList: ShinryouEx[],
  conducts: ConductEx[],
  chargeOption?: Charge,
  lastPayment?: Payment
}

export enum MeisaiSectionEnum {
  ShoshinSaisin = "初・再診料",
  IgakuKanri = "医学管理等",
  Zaitaku = "在宅医療",
  Kensa = "検査",
  Gazou = "画像診断",
  Touyaku = "投薬",
  Chuusha = "注射",
  Shochi = "処置",
  Sonota = "その他",
}

export class MeisaiSectionItem {
  tanka: number;
  count: number;
  label: string;

  constructor(tanka: number, count: number, label: string) {
    this.tanka = tanka;
    this.count = count;
    this.label = label;
  }

  get total(): number {
    return this.tanka * this.count;
  }
}

export class MeisaiSectionData {
  section: MeisaiSectionEnum;
  entries: MeisaiSectionItem[];

  constructor(section: MeisaiSectionEnum, entries: MeisaiSectionItem[]) {
    this.section = section;
    this.entries = entries;
  }

  get subtotal(): number {
    return this.entries.reduce((acc, ele) => {
      return acc + ele.total;
    }, 0);
  }
}

export class Meisai {
  items: MeisaiSectionData[];
  futanWari: number;
  charge: number;

  constructor(items: MeisaiSectionData[], funtanWari: number, charge: number) {
    this.items = items;
    this.futanWari = this.futanWari;
    this.charge = charge;
  }

  get totalTen(): number {
    console.log("totalTen");
    return this.items.reduce((acc, ele) => {
      console.log("ele.subtotal", ele.subtotal);
      return acc + ele.subtotal;
    }, 0);
  }
}



