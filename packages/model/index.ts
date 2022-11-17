export class Patient {
  constructor(
    public patientId: number,
    public lastName: string,
    public firstName: string,
    public lastNameYomi: string,
    public firstNameYomi: string,
    public sex: string,
    public birthday: string,
    public address: string,
    public phone: string
  ) { }
}

export class Visit {
  constructor(
    public visitId: number,
    public patientId: number,
    public visitedAt: string,
    public shahokokuhoId: number,
    public roujinId: number,
    public kouhi1Id: number,
    public kouhi2Id: number,
    public kouhi3Id: number,
    public koukikoureiId: number,
    public attributesStore?: string
  ) { }

  clone(): Visit {
    return Object.assign({}, this) as Visit;
  }

  get attributes(): VisitAttributes | null {
    return VisitAttributes.fromString(this.attributesStore ?? null);
  }

  updateAttribute(attr: VisitAttributes | undefined): Visit {
    let newAttr: string | undefined;
    if (attr == undefined) {
      newAttr = undefined;
    } else {
      newAttr = JSON.stringify(attr);
    }
    const newVisit = this.clone();
    newVisit.attributesStore = newAttr;
    return newVisit;
  }
}

export class WqueueStateType {
  constructor(public code: number, public label: string) { }

  static fromCode(code: number): WqueueStateType {
    for (let wq of Object.values(WqueueState)) {
      if (wq.code === code) {
        return wq;
      }
    }
    throw new Error("Invalid wqueue state code: " + code);
  }
}

export const WqueueState = {
  WaitExam: new WqueueStateType(0, "診待"),
  InExam: new WqueueStateType(1, "診中"),
  WaitCashier: new WqueueStateType(2, "会待"),
  WaitDrug: new WqueueStateType(3, "薬待"),
  WaitReExam: new WqueueStateType(4, "再待"),
} as const;

export interface Wqueue {
  visitId: number;
  waitState: number;
}

export class Wqueue {
  constructor(public visitId: number, public waitState: number) { }

  get waitStateType(): WqueueStateType {
    return WqueueStateType.fromCode(this.waitState);
  }
}

export class Shahokokuho {
  constructor(
    public shahokokuhoId: number,
    public patientId: number,
    public hokenshaBangou: number,
    public hihokenshaKigou: string,
    public hihokenshaBangou: string,
    public honninStore: number,
    public validFrom: string,
    public validUpto: string,
    public koureiStore: number,
    public edaban: string
  ) { }
}

export class Roujin {
  constructor(
    public roujinId: number,
    public patientId: number,
    public shichouson: number,
    public jukyuusha: number,
    public futanWari: number,
    public validFrom: string,
    public validUpto: string
  ) { }
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

export class Koukikourei {
  constructor(
    public koukikoureiId: number,
    public patientId: number,
    public hokenshaBangou: string,
    public hihokenshaBangou: string,
    public futanWari: number,
    public validFrom: string,
    public validUpto: string
  ) { }
}

export class Kouhi {
  constructor(
    public kouhiId: number,
    public futansha: number,
    public jukyuusha: number,
    public validFrom: string,
    public validUpto: string,
    public patientId: number
  ) { }
}

export class HokenInfo {
  public shahokokuho: Shahokokuho | undefined;
  public roujin: Roujin | undefined;
  public koukikourei: Koukikourei | undefined;
  public kouhiList: Kouhi[];

  constructor({
    shahokokuho = undefined,
    roujin = undefined,
    koukikourei = undefined,
    kouhiList = [],
  }: {
    shahokokuho?: Shahokokuho;
    roujin?: Roujin;
    koukikourei?: Koukikourei;
    kouhiList?: Kouhi[];
  }) {
    this.shahokokuho = shahokokuho;
    this.roujin = roujin;
    this.koukikourei = koukikourei;
    this.kouhiList = kouhiList ?? [];
  }

  static createBlank(): HokenInfo {
    return new HokenInfo({});
  }
}

export class HokenIdSet {
  constructor(
    public shahokokuhoId: number,
    public koukikoureiId: number,
    public roujinId: number,
    public kouhi1Id: number,
    public kouhi2Id: number,
    public kouhi3Id: number
  ) { }
}

export class Text {
  constructor(
    public textId: number,
    public visitId: number,
    public content: string
  ) { }
}

export class Charge {
  constructor(public visitId: number, public charge: number) { }
}

export class Payment {
  constructor(
    public visitId: number,
    public amount: number,
    public paytime: string
  ) { }
}

export class IyakuhinMaster {
  constructor(
    public iyakuhincode: number,
    public yakkacode: string,
    public name: string,
    public yomi: string,
    public unit: string,
    public yakkaStore: string,
    public madoku: string,
    public kouhatsu: string,
    public zaikei: string,
    public validFrom: string,
    public validUpto: string
  ) { }
}

export class ShinryouMaster {
  constructor(
    public shinryoucode: number,
    public name: string,
    public tensuuStore: string,
    public tensuuShikibetsu: string,
    public shuukeisaki: string,
    public houkatsukensa: string,
    public oushinkubun: string,
    public kensagroup: string,
    public validFrom: string,
    public validUpto: string
  ) { }
}

export class KizaiMaster {
  constructor(
    public kizaicode: number,
    public name: string,
    public yomi: string,
    public unit: string,
    public kingakuStore: string,
    public validFrom: string,
    public validUpto: string
  ) { }
}

export class DrugCategoryType {
  constructor(public code: number, public name: string) { }
}

export const DrugCategory: Record<string, DrugCategoryType> = {
  Naifuku: new DrugCategoryType(0, "内服"),
  Tonpuku: new DrugCategoryType(1, "頓服"),
  Gaiyou: new DrugCategoryType(2, "外用"),
};

export class DrugEx {
  constructor(
    public drugId: number,
    public visitId: number,
    public iyakuhincode: number,
    public amount: number,
    public usage: string,
    public days: number,
    public categoryStore: number,
    public prescribed: boolean,
    public master: IyakuhinMaster
  ) { }
}

export class Shinryou {
  constructor(
    public shinryouId: number,
    public visitId: number,
    public shinryoucode: number
  ) { }
}

export class ShinryouEx {
  constructor(
    public shinryouId: number,
    public visitId: number,
    public shinryoucode: number,
    public master: ShinryouMaster
  ) { }
}

export class ConductDrugEx {
  constructor(
    public conductDrugId: number,
    public conductId: number,
    public iyakuhincode: number,
    public amount: number,
    public master: IyakuhinMaster
  ) { }
}

export class ConductShinryouEx {
  constructor(
    public conductShinryouId: number,
    public conductId: number,
    public shinryoucode: number,
    public master: ShinryouMaster
  ) { }
}

export class ConductKizaiEx {
  constructor(
    public conductKizaiId: number,
    public conductId: number,
    public kizaicode: number,
    public amount: number,
    public master: KizaiMaster
  ) { }
}

export class ConductKindType {
  constructor(public code: number, public rep: string) { }

  toTag(): ConductKindTag {
    for (let k of Object.keys(ConductKind)) {
      const ct = ConductKind[k];
      if (ct.code === this.code) {
        return { [k]: {} };
      }
    }
    throw new Error("Cannot convert to ConductKindTag: " + this.code);
  }

  static fromCode(code: number): ConductKindType {
    for (let ck of Object.values(ConductKind)) {
      if (ck.code === code) {
        return ck;
      }
    }
    throw new Error("Invalid conduct kind code: " + code);
  }

  static fromKey(key: string): ConductKindType {
    const ck = ConductKind[key];
    if (ck === undefined) {
      throw new Error("Invalid conduct kind key: " + key);
    }
    return ck;
  }

  static fromTag(tag: ConductKindTag): ConductKindType {
    const key = Object.keys(tag)[0];
    return ConductKindType.fromKey(key);
  }
}

export const ConductKind: Record<string, ConductKindType> = {
  HikaChuusha: new ConductKindType(0, "皮下・筋肉注射"),
  JoumyakuChuusha: new ConductKindType(1, "静脈注射"),
  OtherChuusha: new ConductKindType(2, "その他の注射"),
  Gazou: new ConductKindType(3, "画像"),
};

export type ConductKindTag = {
  [key in keyof typeof ConductKind]: {};
};

export class ConductEx {
  conductId: number;
  visitId: number;
  kind: ConductKindTag;
  gazouLabel: string | undefined;
  drugs: ConductDrugEx[];
  shinryouList: ConductShinryouEx[];
  kizaiList: ConductKizaiEx[];

  constructor({
    conductId,
    visitId,
    kind,
    gazouLabel,
    drugs = [],
    shinryouList = [],
    kizaiList = [],
  }: {
    conductId: number;
    visitId: number;
    kind: ConductKindTag;
    gazouLabel?: string;
    drugs?: ConductDrugEx[];
    shinryouList?: ConductShinryouEx[];
    kizaiList?: ConductKizaiEx[];
  }) {
    this.conductId = conductId;
    this.visitId = visitId;
    this.kind = kind;
    this.gazouLabel = gazouLabel;
    this.drugs = drugs;
    this.shinryouList = shinryouList;
    this.kizaiList = kizaiList;
  }

  static fromConduct(c: Conduct): ConductEx {
    return new ConductEx({
      conductId: c.conductId,
      visitId: c.visitId,
      kind: ConductKindType.fromCode(c.kindStore).toTag(),
    });
  }
}

export class VisitAttributes {
  futanWari: number | undefined;

  constructor({ futanWari = undefined }: { futanWari?: number }) {
    this.futanWari = futanWari;
  }

  updateWith(other: VisitAttributes): VisitAttributes {
    const a = Object.assign({}, this, other);
    if (VisitAttributes.isVisitAttributes(a)) {
      return a;
    } else {
      throw new Error("Cannot update with: " + other);
    }
  }

  static isVisitAttributes(arg: any): arg is VisitAttributes {
    return (
      arg != null &&
      typeof arg === "object" &&
      (arg.futanWari === undefined ||
        (typeof arg.futanWari === "number" && Number.isInteger(arg.futanWari)))
    );
  }

  static fromString(src: string | null): VisitAttributes | null {
    if (src == null) {
      return null;
    } else {
      const json = JSON.parse(src);
      if (this.isVisitAttributes(json)) {
        return json;
      } else {
        throw new Error("Cannot convert to VisitAttributes: " + src);
      }
    }
  }
}

export class VisitEx {
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

  constructor({
    visitId,
    visitedAt,
    attributesStore = undefined,
    patient,
    hoken,
    texts,
    drugs,
    shinryouList,
    conducts,
    chargeOption = undefined,
    lastPayment = undefined,
  }: {
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
  }) {
    this.visitId = visitId;
    this.visitedAt = visitedAt;
    this.attributesStore = attributesStore;
    this.patient = patient;
    this.hoken = hoken;
    this.texts = texts;
    this.drugs = drugs;
    this.shinryouList = shinryouList;
    this.conducts = conducts;
    this.chargeOption = chargeOption;
    this.lastPayment = lastPayment;
  }

  get attributes(): VisitAttributes | null {
    return VisitAttributes.fromString(this.attributesStore ?? null);
  }

  get asVisit(): Visit {
    return new Visit(
      this.visitId,
      this.patient.patientId,
      this.visitedAt,
      this.hoken.shahokokuho?.shahokokuhoId ?? 0,
      this.hoken.roujin?.roujinId ?? 0,
      this.hoken.kouhiList.length >= 1 ? this.hoken.kouhiList[0].kouhiId ?? 0,
      this.hoken.kouhiList.length >= 2 ? this.hoken.kouhiList[1].kouhiId ?? 0,
      this.hoken.kouhiList.length >= 3 ? this.hoken.kouhiList[2].kouhiId ?? 0,
      this.hoken.koukikourei?.koukikoureiId ?? 0,
      this.attributesStore
    );
  }
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
  constructor(
    public tanka: number,
    public count: number,
    public label: string,
  ) { }

  get totalTen(): number {
    return this.tanka * this.count;
  }
}

export class MeisaiSectionData {
  constructor(
    public section: MeisaiSectionEnum,
    public entries: MeisaiSectionItem[],
  ) { }

  get totalTen(): number {
    return this.entries.reduce((acc, ele) => {
      return acc + ele.totalTen;
    }, 0);

  }
}

export class Meisai {
  constructor() { }
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

export class Conduct {
  constructor() { }
  conductId: number;
  visitId: number;
  kindStore: number;
}

export class GazouLabel {
  constructor() { }
  conductId: number;
  label: string;
}

export class ConductShinryou {
  constructor() { }
  conductShinryouId: number;
  conductId: number;
  shinryoucode: number;
}

export class ConductDrug {
  constructor() { }
  conductDrugId: number;
  conductId: number;
  iyakuhincode: number;
  amount: number;
}

export class ConductKizai {
  constructor() { }
  conductKizaiId: number;
  conductId: number;
  kizaicode: number;
  amount: number;
}

export class CreateConductRequest {
  constructor() { }
  visitId: number;
  kind: number;
  labelOption: string | null;
  shinryouList: ConductShinryou[];
  drugs: ConductDrug[];
  kizaiList: ConductKizai[];
}

export class CreateShinryouConductRequest {
  constructor() { }
  shinryouList: Shinryou[];
  conducts: CreateConductRequest[];
}

export class ByoumeiMaster {
  constructor() { }
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

export class ShuushokugoMaster {
  constructor() { }
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

export class DiseaseEndReasonType {
  constructor() { }
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

export class Disease {
  constructor() { }
  diseaseId: number;
  patientId: number;
  shoubyoumeicode: number;
  startDate: string;
  endDate: string;
  endReasonStore: string;
}

export class DiseaseAdj {
  constructor() { }
  diseaseAdjId: number;
  diseaseId: number;
  shuushokugocode: number;
}

export class DiseaseEnterData {
  constructor() { }
  patientId: number;
  byoumeicode: number;
  startDate: string;
  adjCodes: number[];
}

export class DiseaseExample {
  constructor() { }
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

export class Hotline {
  constructor() { }
  message: string;
  sender: string;
  recipient: string;
}

export class HotlineEx extends Hotline {
  constructor() { }
  appEventId: number;
}

export class HotlineBeep {
  constructor() { }
  recipient: string;
}

export class EventIdNotice {
  constructor() { }
  currentEventId: number;
}

export class HeartBeat {
  constructor() { }
  heartBeatSerialId: number;
}

export class AppEvent {
  constructor() { }
  appEventId: number;
  createdAt: string;
  model: string;
  kind: string;
  data: string;
}

export class FileInfo {
  constructor() { }
  name: string;
  createdAt: string;
  size: number;
}

export class PrescExample {
  constructor() { }
  prescExampleId: number;
  iyakuhincode: number;
  masterValidFrom: string;
  amount: String;
  usage: String;
  days: number;
  category: number;
  comment: String;
}
