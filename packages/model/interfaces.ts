import * as m from "./model";

export interface Patient {
  patientId: number;
  lastName: string;
  firstName: string;
  lastNameYomi: string;
  firstNameYomi: string;
  sex: string;
  birthday: string;
  address: string;
  phone: string;
}

export interface Visit {
  visitId: number;
  patientId: number;
  visitedAt: string;
  shahokokuhoId: number;
  roujinId: number;
  kouhi1Id: number;
  kouhi2Id: number;
  kouhi3Id: number;
  koukikoureiId: number;
  attributesStore?: string;
}

export const VisitObject = {
  attributesOf(visit: Visit): VisitAttributes | null {
    return VisitAttributeObject.fromString(visit.attributesStore ?? null);
  },

  updateAttribute(visit: Visit, attr: VisitAttributes | null): Visit {
    let newAttr: string | null;
    if (attr == null) {
      newAttr = null;
    } else {
      newAttr = JSON.stringify(attr);
    }
    return Object.assign({}, visit, {
      attributesStore: newAttr,
    });
  },
};

export const WqueueState = {
  WaitExam: 0,
  InExam: 1,
  WaitCashier: 2,
  WaitDrug: 3,
  WaitReExam: 4,
} as const;

export type WqueueStateKey = keyof typeof WqueueState;

export class WqueueStateData {
  constructor(public code: number, public label: string) {}
}

export const WqueueStateObject: Record<WqueueStateKey, WqueueStateData> = {
  WaitExam: new WqueueStateData(0, "診待"),
  InExam: new WqueueStateData(1, "診中"),
  WaitCashier: new WqueueStateData(2, "会待"),
  WaitDrug: new WqueueStateData(3, "薬待"),
  WaitReExam: new WqueueStateData(4, "再待"),
};

export interface Wqueue {
  visitId: number;
  waitState: number;
}

export interface Shahokokuho {
  shahokokuhoId: number;
  patientId: number;
  hokenshaBangou: number;
  hihokenshaKigou: string;
  hihokenshaBangou: string;
  honninStore: number;
  validFrom: string;
  validUpto: string;
  koureiStore: number;
  edaban: string;
}

export interface Roujin {
  roujinId: number;
  patientId: number;
  shichouson: number;
  jukyuusha: number;
  futanWari: number;
  validFrom: string;
  validUpto: string;
}

export interface Koukikourei {
  koukikoureiId: number;
  patientId: number;
  hokenshaBangou: string;
  hihokenshaBangou: string;
  futanWari: number;
  validFrom: string;
  validUpto: string;
}

export interface Kouhi {
  kouhiId: number;
  futansha: number;
  jukyuusha: number;
  validFrom: string;
  validUpto: string;
  patientId: number;
}

export interface HokenInfo {
  shahokokuho?: Shahokokuho;
  roujin?: Roujin;
  koukikourei: Koukikourei;
  kouhiList: Kouhi[];
}

export interface HokenIdSet {
  shahokokuhoId: number;
  koukikoureiId: number;
  roujinId: number;
  kouhi1Id: number;
  kouhi2Id: number;
  kouhi3Id: number;
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
  visitId: number;
  charge: number;
}

export interface Payment {
  visitId: number;
  amount: number;
  paytime: string;
}

export interface IyakuhinMaster {
  iyakuhincode: number;
  yakkacode: string;
  name: string;
  yomi: string;
  unit: string;
  yakkaStore: string;
  madoku: string;
  kouhatsu: string;
  zaikei: string;
  validFrom: string;
  validUpto: string;
}

export interface ShinryouMaster {
  shinryoucode: number;
  name: string;
  tensuuStore: string;
  tensuuShikibetsu: string;
  shuukeisaki: string;
  houkatsukensa: string;
  oushinkubun: string;
  kensagroup: string;
  validFrom: string;
  validUpto: string;
}

export interface KizaiMaster {
  kizaicode: number;
  name: string;
  yomi: string;
  unit: string;
  kingakuStore: string;
  validFrom: string;
  validUpto: string;
}

export interface DrugCategoryType {
  code: number;
  name: string;
}

export const DrugCategory: Record<string, DrugCategoryType> = {
  Naifuku: { code: 0, name: "内服" },
  Tonpuku: { code: 1, name: "頓服" },
  Gaiyou: { code: 2, name: "外用" },
};

export interface DrugEx {
  drugId: number;
  visitId: number;
  iyakuhincode: number;
  amount: number;
  usage: string;
  days: number;
  categoryStore: number;
  prescribed: boolean;
  master: IyakuhinMaster;
}

export interface Shinryou {
  shinryouId: number;
  visitId: number;
  shinryoucode: number;
}

export interface ShinryouEx {
  shinryouId: number;
  visitId: number;
  shinryoucode: number;
  master: ShinryouMaster;
}

export interface ConductDrugEx {
  conductDrugId: number;
  conductId: number;
  iyakuhincode: number;
  amount: number;
  master: IyakuhinMaster;
}

export interface ConductShinryouEx {
  conductShinryouId: number;
  conductId: number;
  shinryoucode: number;
  master: ShinryouMaster;
}

export interface ConductKizaiEx {
  conductKizaiId: number;
  conductId: number;
  kizaicode: number;
  amount: number;
  master: KizaiMaster;
}

export type ConductKindKey =
  | "HikaChuusha"
  | "JoumyakuChuusha"
  | "OtherChuusha"
  | "Gazou";

export const ConductKindKeyObject = {
  fromString(s: string): ConductKindKey {
    switch (s) {
      case "HikaChuusha":
      case "JoumyakuChuusha":
      case "OtherChuusha":
      case "Gazou":
        return s;
      default:
        throw new Error("Invalid conduct kind key: " + s);
    }
  },
};

export type ConductKindTag =
  | {
      HikaChuusha: {};
    }
  | {
      JoumyakuChuusha: {};
    }
  | {
      OtherChuusha: {};
    }
  | {
      Gazou: {};
    };

export const ConductKindTagObject = {
  fromKey(key: ConductKindKey): ConductKindTag {
    if (key === "HikaChuusha") {
      return { [key]: {} };
    } else if (key === "JoumyakuChuusha") {
      return { [key]: {} };
    } else if (key === "OtherChuusha") {
      return { [key]: {} };
    } else if (key === "Gazou") {
      return { [key]: {} };
    } else {
      throw new Error("Cannot happen");
    }
  },

  fromCode(code: number): ConductKindTag {
    for (let ctype of Object.values(ConductKind)) {
      if (ctype.code === code) {
        return ConductKindTagObject.fromKey(ctype.key);
      }
    }
    throw new Error("Invalid conduct kind code: " + code);
  },
};

export class ConductKindType {
  constructor(
    public code: number,
    public rep: string,
    public key: ConductKindKey
  ) {}
}

export const ConductKind: Record<ConductKindKey, ConductKindType> = {
  HikaChuusha: new ConductKindType(0, "皮下・筋肉注射", "HikaChuusha"),
  JoumyakuChuusha: new ConductKindType(1, "静脈注射", "JoumyakuChuusha"),
  OtherChuusha: new ConductKindType(2, "その他の注射", "OtherChuusha"),
  Gazou: new ConductKindType(3, "画像", "Gazou"),
};

export const ConductKindObject = {
  fromTag(tag: ConductKindTag): ConductKindType {
    const key: ConductKindKey = Object.keys(tag)[0] as ConductKindKey;
    return ConductKind[key];
  },

  fromCode(code: number): ConductKindType {
    for (let kind of Object.values(ConductKind)) {
      if (kind.code === code) {
        return kind;
      }
    }
    throw new Error("Invalid conduct kind code: " + code);
  },

  fromKeyString(s: string): ConductKindType {
    const key = ConductKindKeyObject.fromString(s);
    return ConductKind[key];
  },
};

export interface ConductEx {
  conductId: number;
  visitId: number;
  kind: ConductKindTag;
  gazouLabel?: String;
  drugs: ConductDrugEx[];
  shinryouList: ConductShinryouEx[];
  kizaiList: ConductKizaiEx[];
}

export const ConductExObject = {
  fromConduct(c: Conduct): ConductEx {
    return {
      conductId: c.conductId,
      visitId: c.visitId,
      kind: ConductKindTagObject.fromCode(c.kindStore),
      drugs: [],
      shinryouList: [],
      kizaiList: [],
    };
  },
};

export interface VisitAttributes {
  futanWari?: number;
}

export const VisitAttributeObject = {
  fromString(src: string | null): VisitAttributes | null {
    if (src == null) {
      return null;
    } else {
      return JSON.parse(src);
    }
  },

  updateWith(
    orig: VisitAttributes | null,
    update: VisitAttributes | null
  ): VisitAttributes {
    return Object.assign({}, orig, update);
  },
};

export interface VisitEx {
  visitId: number;
  visitedAt: string;
  attributesStore?: string;
  patient: Patient;
  hoken: HokenInfo;
  texts: Text[];
  drugs: DrugEx[];
  shinryouList: ShinryouEx[];
  conducts: ConductEx[];
  chargeOption?: Charge;
  lastPayment?: Payment;
}

export const VisitExObject = {
  attributesOf(visit: VisitEx): VisitAttributes | null {
    return VisitAttributeObject.fromString(visit.attributesStore ?? null);
  },

  asVisit(src: VisitEx): Visit {
    return {
      visitId: src.visitId,
      patientId: src.patient.patientId,
      visitedAt: src.visitedAt,
      shahokokuhoId: src.hoken.shahokokuho?.shahokokuhoId || 0,
      roujinId: src.hoken.roujin?.roujinId || 0,
      kouhi1Id: src.hoken.kouhiList[0]?.kouhiId || 0,
      kouhi2Id: src.hoken.kouhiList[1]?.kouhiId || 0,
      kouhi3Id: src.hoken.kouhiList[2]?.kouhiId || 0,
      koukikoureiId: src.hoken.koukikourei?.koukikoureiId || 0,
      attributesStore: src.attributesStore,
    };
  },
};

export enum MeisaiSectionEnum {
  ShoshinSaishin = "初・再診料",
  IgakuKanri = "医学管理等",
  Zaitaku = "在宅医療",
  Kensa = "検査",
  Gazou = "画像診断",
  Touyaku = "投薬",
  Chuusha = "注射",
  Shochi = "処置",
  Sonota = "その他",
}

export interface MeisaiSectionItem {
  tanka: number;
  count: number;
  label: string;
}

export const MeisaiSectionItemObject = {
  totalOf(item: MeisaiSectionItem): number {
    return item.tanka * item.count;
  },
};

export interface MeisaiSectionData {
  section: MeisaiSectionEnum;
  entries: MeisaiSectionItem[];
}

export const MeisaiSectionDataObject = {
  subtotalOf(data: MeisaiSectionData): number {
    const totalOf = MeisaiSectionItemObject.totalOf;
    return data.entries.reduce((acc, ele) => {
      return acc + totalOf(ele);
    }, 0);
  },
};

export interface Meisai {
  items: MeisaiSectionData[];
  futanWari: number;
  charge: number;
}

export const MeisaiObject = {
  totalTenOf(meisai: Meisai): number {
    const subtotal = MeisaiSectionDataObject.subtotalOf;
    return meisai.items.reduce((acc, ele) => {
      return acc + subtotal(ele);
    }, 0);
  },
};

export interface Conduct {
  conductId: number;
  visitId: number;
  kindStore: number;
}

export interface GazouLabel {
  conductId: number;
  label: string;
}

export interface ConductShinryou {
  conductShinryouId: number;
  conductId: number;
  shinryoucode: number;
}

export interface ConductDrug {
  conductDrugId: number;
  conductId: number;
  iyakuhincode: number;
  amount: number;
}

export interface ConductKizai {
  conductKizaiId: number;
  conductId: number;
  kizaicode: number;
  amount: number;
}

export interface CreateConductRequest {
  visitId: number;
  kind: number;
  labelOption: string | null;
  shinryouList: ConductShinryou[];
  drugs: ConductDrug[];
  kizaiList: ConductKizai[];
}

export interface CreateShinryouConductRequest {
  shinryouList: Shinryou[];
  conducts: CreateConductRequest[];
}

export interface ByoumeiMaster {
  shoubyoumeicode: number;
  name: string;
}

export function isByoumeiMaster(arg: any): arg is ByoumeiMaster {
  return (
    arg != null &&
    typeof arg === "object" &&
    typeof arg.shoubyoumeicode === "number" &&
    typeof arg.name === "string"
  );
}

export interface ShuushokugoMaster {
  shuushokugocode: number;
  name: string;
}

export const ShuushokugoMasterObject = {
  smallestPostfixCode: 8000,

  isPrefix(m: ShuushokugoMaster): boolean {
    return m.shuushokugocode < ShuushokugoMasterObject.smallestPostfixCode;
  },
};

export function isShuushokugoMaster(arg: any): arg is ShuushokugoMaster {
  return (
    arg != null &&
    typeof arg === "object" &&
    typeof arg.shuushokugocode === "number" &&
    typeof arg.name === "string"
  );
}

export interface DiseaseEndReasonType {
  code: string;
  label: string;
}

export const DiseaseEndReason: Record<string, DiseaseEndReasonType> = {
  NotEnded: { code: "N", label: "継続" },
  Cured: { code: "C", label: "治癒" },
  Stopped: { code: "S", label: "中止" },
  Dead: { code: "D", label: "死亡" },
};

export const DiseaseEndReasonObject = {
  fromCode(code: string): DiseaseEndReasonType {
    for (let r of Object.values(DiseaseEndReason)) {
      if (r.code == code) {
        return r;
      }
    }
    throw new Error("Invalid end reason code: " + code);
  },
};

export interface Disease {
  diseaseId: number;
  patientId: number;
  shoubyoumeicode: number;
  startDate: string;
  endDate: string;
  endReasonStore: string;
}

export interface DiseaseAdj {
  diseaseAdjId: number;
  diseaseId: number;
  shuushokugocode: number;
}

export interface DiseaseEnterData {
  patientId: number;
  byoumeicode: number;
  startDate: string;
  adjCodes: number[];
}

export interface DiseaseExample {
  byoumei: string | null;
  preAdjList: string[];
  postAdjList: string[];
}

export const DiseaseExampleObject = {
  repr(e: DiseaseExample): string {
    return [e.byoumei || "", ...e.preAdjList, ...e.postAdjList].join("");
  },
};

export function isDiseaseExample(arg: any): arg is DiseaseExample {
  return (
    arg != null &&
    typeof arg === "object" &&
    (arg.byoumei == null || typeof arg.byoumei === "string") &&
    Array.isArray(arg.preAdjList) &&
    Array.isArray(arg.postAdjList)
  );
}

export interface Hotline {
  message: string;
  sender: string;
  recipient: string;
}

export interface HotlineEx extends Hotline {
  appEventId: number;
}

export interface HotlineBeep {
  recipient: string;
}

export interface EventIdNotice {
  currentEventId: number;
}

export interface HeartBeat {
  heartBeatSerialId: number;
}

export interface AppEvent {
  appEventId: number;
  createdAt: string;
  model: string;
  kind: string;
  data: string;
}

export interface FileInfo {
  name: string;
  createdAt: string;
  size: number;
}

export interface PrescExample {
  prescExampleId: number;
  iyakuhincode: number;
  masterValidFrom: string;
  amount: String;
  usage: String;
  days: number;
  category: number;
  comment: String;
}
