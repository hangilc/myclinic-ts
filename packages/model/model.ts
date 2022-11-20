export function padNumber(n: number | string, finalSize: number, pad: string) {
  let s: string;
  if (typeof n === "number") {
    s = n.toString();
  } else {
    s = n;
  }
  while (s.length < finalSize) {
    s = pad + s;
  }
  return s;
}

export function dateToSqlDate(d: Date): string {
  const year: number = d.getFullYear();
  const month: number = d.getMonth() + 1;
  const day: number = d.getDate();
  return `${padNumber(year, 4, "0")}-${padNumber(month, 2, "0")}-${padNumber(
    day,
    2,
    "0"
  )}`;
}

export function optionalDateToSqlDate(d: Date | undefined): string {
  if( d == null ){
    return "0000-00-00";
  } else {
    return dateToSqlDate(d);
  }
}

export function dateToSqlTime(d: Date): string {
  const hours: number = d.getHours();
  const minutes: number = d.getMinutes();
  const seconds: number = d.getSeconds();
  return `${padNumber(hours, 2, "0")}:${padNumber(minutes, 2, "0")}:${padNumber(
    seconds,
    2,
    "0"
  )}`;
}

export function dateToSqlDateTime(d: Date): string {
  return `${dateToSqlDate(d)} ${dateToSqlTime(d)}`;
}

export function stringToOptionalDate(s: string): Date | undefined {
  if( s == null || s === "0000-00-00" ) {
    return undefined;
  } else {
    return new Date(s);
  }
}

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
  ) {}

  static cast(arg: any): Patient {
    return new Patient(
      arg.patientId,
      arg.lastName,
      arg.firstName,
      arg.lastNameYomi,
      arg.firstNameYomi,
      arg.sex,
      arg.birthday,
      arg.address,
      arg.phone
    );
  }
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
  ) {}

  static cast(arg: any): Visit {
    return new Visit(
      arg.visitId,
      arg.patientId,
      arg.visitedAt,
      arg.shahokokuhoId,
      arg.roujinId,
      arg.kouhi1Id,
      arg.kouhi2Id,
      arg.kouhi3Id,
      arg.koukikoureiId,
      arg.attributesStore
    );
  }

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
  constructor(public code: number, public label: string) {}

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

export class Wqueue {
  constructor(public visitId: number, public waitState: number) {}

  get waitStateType(): WqueueStateType {
    return WqueueStateType.fromCode(this.waitState);
  }

  static cast(arg: any): Wqueue {
    return new Wqueue(arg.visitId, arg.waitState);
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
  ) {}

  static cast(arg: any): Shahokokuho {
    return new Shahokokuho(
      arg.shahokokuhoId,
      arg.patientId,
      arg.hokenshaBangou,
      arg.hihokenshaKigou,
      arg.hihokenshaBangou,
      arg.honninStore,
      arg.validFrom,
      arg.validUpto,
      arg.koureiStore,
      arg.edaban
    );
  }
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
  ) {}

  static cast(arg: any): Roujin {
    return new Roujin(
      arg.roujinId,
      arg.patientId,
      arg.shichouson,
      arg.jukyuusha,
      arg.futanWari,
      arg.validFrom,
      arg.validUpto
    );
  }
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
  ) {}

  static cast(arg: any): Koukikourei {
    return new Koukikourei(
      arg.koukikoureiId,
      arg.patientId,
      arg.hokenshaBangou,
      arg.hihokenshaBangou,
      arg.futanWari,
      arg.validFrom,
      arg.validUpto
    );
  }
}

export class Kouhi {
  constructor(
    public kouhiId: number,
    public futansha: number,
    public jukyuusha: number,
    public validFrom: string,
    public validUpto: string,
    public patientId: number
  ) {}

  static cast(arg: any): Kouhi {
    return new Kouhi(
      arg.kouhiId,
      arg.futansha,
      arg.jukyuusha,
      arg.validFrom,
      arg.validUpto,
      arg.patientId
    );
  }
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

  static cast(arg: any): HokenInfo {
    return new HokenInfo(arg);
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
  ) {}

  static cast(arg: any): HokenIdSet {
    return new HokenIdSet(
      arg.shahokokuhoId,
      arg.koukikoureiId,
      arg.roujinId,
      arg.kouhi1Id,
      arg.kouhi2Id,
      arg.kouhi3Id
    );
  }
}

export class Text {
  constructor(
    public textId: number,
    public visitId: number,
    public content: string
  ) {}

  static cast(arg: any): Text {
    return new Text(arg.textId, arg.visitId, arg.content);
  }
}

export class Charge {
  constructor(public visitId: number, public charge: number) {}

  static cast(arg: any): Charge {
    return new Charge(arg.visitId, arg.charge);
  }
}

export class Payment {
  constructor(
    public visitId: number,
    public amount: number,
    public paytime: string
  ) {}

  static cast(arg: any): Payment {
    return new Payment(arg.visitId, arg.amount, arg.paytime);
  }
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
  ) {}

  static cast(arg: any): IyakuhinMaster {
    return new IyakuhinMaster(
      arg.iyakuhincode,
      arg.yakkacode,
      arg.name,
      arg.yomi,
      arg.unit,
      arg.yakkaStore,
      arg.madoku,
      arg.kouhatsu,
      arg.zaikei,
      arg.validFrom,
      arg.validUpto
    );
  }
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
  ) {}

  static cast(arg: any): ShinryouMaster {
    return new ShinryouMaster(
      arg.shinryoucode,
      arg.name,
      arg.tensuuStore,
      arg.tensuuShikibetsu,
      arg.shuukeisaki,
      arg.houkatsukensa,
      arg.oushinkubun,
      arg.kensagroup,
      arg.validFrom,
      arg.validUpto
    );
  }
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
  ) {}

  static cast(arg: any): KizaiMaster {
    return new KizaiMaster(
      arg.kizaicode,
      arg.name,
      arg.yomi,
      arg.unit,
      arg.kingakuStore,
      arg.validFrom,
      arg.validUpto
    );
  }
}

export class DrugCategoryType {
  constructor(public code: number, public name: string) {}

  static fromCode(code: number): DrugCategoryType {
    for(let v of Object.values(DrugCategory)){
      if( v.code === code ){
        return v;
      }
    }
    throw new Error("Cannot find drug category: " + code);
  }
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
  ) {}

  get category(): DrugCategoryType {
    return DrugCategoryType.fromCode(this.categoryStore);
  }

  static cast(arg: any): DrugEx {
    return new DrugEx(
      arg.drugId,
      arg.visitId,
      arg.iyakuhincode,
      arg.amount,
      arg.usage,
      arg.days,
      arg.categoryStore,
      arg.prescribed,
      IyakuhinMaster.cast(arg.master)
    );
  }
}

export class Shinryou {
  constructor(
    public shinryouId: number,
    public visitId: number,
    public shinryoucode: number
  ) {}

  static cast(arg: any): Shinryou {
    return new Shinryou(arg.shinryouId, arg.visitId, arg.shinryoucode);
  }
}

export class ShinryouEx {
  constructor(
    public shinryouId: number,
    public visitId: number,
    public shinryoucode: number,
    public master: ShinryouMaster
  ) {}

  static cast(arg: any): ShinryouEx {
    return new ShinryouEx(
      arg.shinryouId,
      arg.visitId,
      arg.shinryoucode,
      ShinryouMaster.cast(arg.master)
    );
  }
}

export class ConductDrugEx {
  constructor(
    public conductDrugId: number,
    public conductId: number,
    public iyakuhincode: number,
    public amount: number,
    public master: IyakuhinMaster
  ) {}

  static cast(arg: any): ConductDrugEx {
    return new ConductDrugEx(
      arg.conductDrugId,
      arg.conductId,
      arg.iyakuhincode,
      arg.amount,
      IyakuhinMaster.cast(arg.master)
    );
  }
}

export class ConductShinryouEx {
  constructor(
    public conductShinryouId: number,
    public conductId: number,
    public shinryoucode: number,
    public master: ShinryouMaster
  ) {}

  static cast(arg: any): ConductShinryouEx {
    return new ConductShinryouEx(
      arg.conductShinryouId,
      arg.conductId,
      arg.shinryoucode,
      ShinryouMaster.cast(arg.master)
    );
  }
}

export class ConductKizaiEx {
  constructor(
    public conductKizaiId: number,
    public conductId: number,
    public kizaicode: number,
    public amount: number,
    public master: KizaiMaster
  ) {}

  static cast(arg: any): ConductKizaiEx {
    return new ConductKizaiEx(
      arg.conductKizaiId,
      arg.conductId,
      arg.kizaicode,
      arg.amount,
      KizaiMaster.cast(arg.master)
    );
  }
}

export class ConductKindType {
  constructor(public code: number, public rep: string) {}

  get key(): string {
    for(let k of Object.keys(ConductKind) ){
      if( ConductKind[k].code === this.code ){
        return k;
      }
    }
    throw new Error("Cannot find Conduct kind key: " + this);
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

  static cast(arg: any): ConductKindType {
    const key = Object.keys(arg)[0];
    return ConductKindType.fromKey(key);
  }
}

export const ConductKind: Record<string, ConductKindType> = {
  HikaChuusha: new ConductKindType(0, "皮下・筋肉注射"),
  JoumyakuChuusha: new ConductKindType(1, "静脈注射"),
  OtherChuusha: new ConductKindType(2, "その他の注射"),
  Gazou: new ConductKindType(3, "画像"),
};

export type ConductKindKey = keyof typeof ConductKind;

export class ConductEx {
  conductId: number;
  visitId: number;
  kind: ConductKindType;
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
    kind: ConductKindType;
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

  static cast(arg: any): ConductEx {
    arg = Object.assign({}, arg);
    arg.kind = ConductKindType.cast(arg.kind);
    arg.drgs = arg.drugs?.map((a: any) => ConductDrugEx.cast(a)) ?? [];
    arg.shinryouList = arg.shinryouList?.map((a: any) =>
      ConductShinryouEx.cast(a)
    );
    arg.kizaiList = arg.kizaiList?.map((a: any) => ConductKizaiEx.cast(a));
    return new ConductEx(arg);
  }

  static fromConduct(c: Conduct): ConductEx {
    return new ConductEx({
      conductId: c.conductId,
      visitId: c.visitId,
      kind: ConductKindType.fromCode(c.kindStore),
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

  static cast(arg: any): VisitEx {
    arg = Object.assign({}, arg);
    arg.patient = Patient.cast(arg.patient);
    arg.hoken = HokenInfo.cast(arg.hoken);
    arg.texts = arg.texts.map((a: any) => Text.cast(a));
    arg.drugs = arg.drugs.map((a: any) => DrugEx.cast(a));
    arg.shinryouList = arg.shinryouList.map((a: any) => ShinryouEx.cast(a));
    arg.conducts = arg.conducts.map((a: any) => ConductEx.cast(a));
    arg.chargeOption =
      arg.chargeOption != undefined ? Charge.cast(arg.chargeOption) : undefined;
    arg.lastPayment =
      arg.lastPayment != undefined ? Payment.cast(arg.lastPayment) : undefined;
    return new VisitEx(arg);
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
      this.hoken.kouhiList.length >= 1 ? this.hoken.kouhiList[0].kouhiId : 0,
      this.hoken.kouhiList.length >= 2 ? this.hoken.kouhiList[1].kouhiId : 0,
      this.hoken.kouhiList.length >= 3 ? this.hoken.kouhiList[2].kouhiId : 0,
      this.hoken.koukikourei?.koukikoureiId ?? 0,
      this.attributesStore
    );
  }
}

export class MeisaiSectionType {
  constructor(public label: string) {}

  static fromString(s: string): MeisaiSectionType {
    for (let e of Object.values(MeisaiSectionEnum)) {
      if (e.label === s) {
        return e;
      }
    }
    throw new Error("Cannot find meisai section enum for: " + s);
  }
}

export const MeisaiSectionEnum: Record<string, MeisaiSectionType> = {
  ShoshinSaisin: new MeisaiSectionType("初・再診料"),
  IgakuKanri: new MeisaiSectionType("医学管理等"),
  Zaitaku: new MeisaiSectionType("在宅医療"),
  Kensa: new MeisaiSectionType("検査"),
  Gazou: new MeisaiSectionType("画像診断"),
  Touyaku: new MeisaiSectionType("投薬"),
  Chuusha: new MeisaiSectionType("注射"),
  Shochi: new MeisaiSectionType("処置"),
  Sonota: new MeisaiSectionType("その他"),
};

export class MeisaiSectionItem {
  constructor(
    public tanka: number,
    public count: number,
    public label: string
  ) {}

  get totalTen(): number {
    return this.tanka * this.count;
  }

  static cast(arg: any): MeisaiSectionItem {
    return new MeisaiSectionItem(arg.tanka, arg.count, arg.label);
  }
}

export class MeisaiSectionData {
  constructor(
    public section: MeisaiSectionType,
    public entries: MeisaiSectionItem[]
  ) {}

  get totalTen(): number {
    return this.entries.reduce((acc, ele) => {
      return acc + ele.totalTen;
    }, 0);
  }

  static cast(arg: any): MeisaiSectionData {
    return new MeisaiSectionData(
      MeisaiSectionType.fromString(arg.section),
      arg.entries.map((e: any) => MeisaiSectionItem.cast(e))
    );
  }
}

export class Meisai {
  constructor(
    public items: MeisaiSectionData[],
    public futanWari: number,
    public charge: number
  ) {}

  get totalTen(): number {
    return this.items.reduce((acc, ele) => {
      return acc + ele.totalTen;
    }, 0);
  }

  static cast(arg: any): Meisai {
    return new Meisai(
      arg.items.map((a: any) => MeisaiSectionData.cast(a)),
      arg.futanWari,
      arg.charge
    );
  }
}

export class Conduct {
  constructor(
    public conductId: number,
    public visitId: number,
    public kindStore: number
  ) {}

  static cast(arg: any): Conduct {
    return new Conduct(arg.conductId, arg.visitId, arg.kindStore);
  }
}

export class GazouLabel {
  constructor(public conductId: number, public label: string) {}

  static cast(arg: any): GazouLabel {
    return new GazouLabel(arg.conductId, arg.label);
  }
}

export class ConductShinryou {
  constructor(
    public conductShinryouId: number,
    public conductId: number,
    public shinryoucode: number
  ) {}

  static cast(arg: any): ConductShinryou {
    return new ConductShinryou(
      arg.conductShinryouId,
      arg.conductId,
      arg.shinryoucode
    );
  }
}

export class ConductDrug {
  constructor(
    public conductDrugId: number,
    public conductId: number,
    public iyakuhincode: number,
    public amount: number
  ) {}

  static cast(arg: any): ConductDrug {
    return new ConductDrug(
      arg.conductDrugId,
      arg.conductId,
      arg.iyakuhincode,
      arg.amount
    );
  }
}

export class ConductKizai {
  constructor(
    public conductKizaiId: number,
    public conductId: number,
    public kizaicode: number,
    public amount: number
  ) {}

  static cast(arg: any): ConductKizai {
    return new ConductKizai(
      arg.conductKizaiId,
      arg.conductId,
      arg.kizaicode,
      arg.amount
    );
  }
}

export class CreateConductRequest {
  visitId: number;
  kind: number;
  labelOption: string | undefined;
  shinryouList: ConductShinryou[];
  drugs: ConductDrug[];
  kizaiList: ConductKizai[];

  constructor({
    visitId,
    kind,
    labelOption = undefined,
    shinryouList = [],
    drugs = [],
    kizaiList = [],
  }: {
    visitId: number;
    kind: number;
    labelOption?: string;
    shinryouList?: ConductShinryou[];
    drugs?: ConductDrug[];
    kizaiList?: ConductKizai[];
  }) {
    this.visitId = visitId;
    this.kind = kind;
    this.labelOption = labelOption;
    this.shinryouList = shinryouList;
    this.drugs = drugs;
    this.kizaiList = kizaiList;
  }

  static cast(arg: any): CreateConductRequest {
    arg = Object.assign({}, arg);
    arg.shinryouList =
      arg.shinryouList?.map((a: any) => ConductShinryou.cast(a)) ?? [];
    arg.drugs = arg.drugs?.map((a: any) => ConductDrug.cast(a)) ?? [];
    arg.kizaiList = arg.kizaiList?.map((a: any) => ConductKizai.cast(a)) ?? [];
    return new CreateConductRequest(arg);
  }
}

export class CreateShinryouConductRequest {
  shinryouList: Shinryou[];
  conducts: CreateConductRequest[];

  constructor({
    shinryouList = [],
    conducts = [],
  }: {
    shinryouList?: Shinryou[];
    conducts?: CreateConductRequest[];
  }) {
    this.shinryouList = shinryouList;
    this.conducts = conducts;
  }

  static cast(arg: any): CreateShinryouConductRequest {
    arg.shinryouList =
      arg.shinryouList?.map((a: any) => Shinryou.cast(a)) ?? [];
    arg.conducts =
      arg.conducts?.map((a: any) => CreateConductRequest.cast(a)) ?? [];
    return new CreateShinryouConductRequest(arg);
  }
}

export class ByoumeiMaster {
  constructor(public shoubyoumeicode: number, public name: string) {}

  static cast(arg: any): ByoumeiMaster {
    return new ByoumeiMaster(arg.shoubyoumeicode, arg.name);
  }

  static isByoumeiMaster(arg: any): arg is ByoumeiMaster {
    return (
      arg != null &&
      typeof arg === "object" &&
      typeof arg.shoubyoumeicode === "number" &&
      typeof arg.name === "string"
    );
  }

  fullName(adj: ShuushokugoMaster[]): string {
    const [pres, posts] = ShuushokugoMaster.classify(adj);
    const pre: string = pres.map(m => m.name).join("")
    const post: string = posts.map(m => m.name).join("")
    return pre + this.name + post;
  }
}

export class ShuushokugoMaster {
  constructor(public shuushokugocode: number, public name: string) {}

  static cast(arg: any): ShuushokugoMaster {
    return new ShuushokugoMaster(arg.shuushokugocode, arg.name);
  }

  get isPrefix(): boolean {
    return this.shuushokugocode < ShuushokugoMaster.smallestPostfixCode;
  }

  static classify(
    list: ShuushokugoMaster[]
  ): [ShuushokugoMaster[], ShuushokugoMaster[]] {
    const pres: ShuushokugoMaster[] = [];
    const posts: ShuushokugoMaster[] = [];
    list.forEach((m) => {
      const list = m.isPrefix ? pres : posts;
      list.push(m);
    });
    return [pres, posts];
  }

  static smallestPostfixCode = 8000;
  static suspMaster: ShuushokugoMaster = new ShuushokugoMaster(8002, "の疑い");

  static isShuushokugoMaster(arg: any): arg is ShuushokugoMaster {
    return (
      arg != null &&
      typeof arg === "object" &&
      typeof arg.shuushokugocode === "number" &&
      typeof arg.name === "string"
    );
  }
}

export class DiseaseEndReasonType {
  constructor(public code: string, public label: string) {}

  static cast(arg: any): DiseaseEndReasonType {
    return DiseaseEndReasonType.fromCode(arg);
  }

  static fromCode(code: string): DiseaseEndReasonType {
    for (let e of Object.values(DiseaseEndReason)) {
      if (e.code === code) {
        return e;
      }
    }
    throw new Error("Invalid disease end reason code: " + code);
  }
}

export const DiseaseEndReason: Record<string, DiseaseEndReasonType> = {
  NotEnded: { code: "N", label: "継続" },
  Cured: { code: "C", label: "治癒" },
  Stopped: { code: "S", label: "中止" },
  Dead: { code: "D", label: "死亡" },
};

export const DiseaseEndReasonKeys: string[] = Object.keys(DiseaseEndReason);

export class Disease {
  constructor(
    public diseaseId: number,
    public patientId: number,
    public shoubyoumeicode: number,
    public startDate: string,
    public endDate: string,
    public endReasonStore: string
  ) {}

  clone(): Disease {
    return new Disease(
      this.diseaseId,
      this.patientId,
      this.shoubyoumeicode,
      this.startDate,
      this.endDate,
      this.endReasonStore
    );
  }

  static cast(arg: any): Disease {
    return new Disease(
      arg.diseaseId,
      arg.patientId,
      arg.shoubyoumeicode,
      arg.startDate,
      arg.endDate,
      arg.endReasonStore
    );
  }

  get startDateAsDate(): Date {
    return new Date(this.startDate);
  }

  get endReason(): DiseaseEndReasonType {
    return DiseaseEndReasonType.fromCode(this.endReasonStore);
  }
}

export class DiseaseAdj {
  constructor(
    public diseaseAdjId: number,
    public diseaseId: number,
    public shuushokugocode: number
  ) {}

  clone(): DiseaseAdj {
    return new DiseaseAdj(
      this.diseaseAdjId,
      this.diseaseId,
      this.shuushokugocode
    );
  }

  static cast(arg: any): DiseaseAdj {
    return new DiseaseAdj(arg.diseaseAdjId, arg.diseaseId, arg.shuushokugocode);
  }
}

export class DiseaseEnterData {
  constructor(
    public patientId: number,
    public byoumeicode: number,
    public startDate: string,
    public adjCodes: number[]
  ) {}

  static cast(arg: any): DiseaseEnterData {
    return new DiseaseEnterData(
      arg.patientId,
      arg.byoumeicode,
      arg.startDate,
      arg.adjCodes
    );
  }
}

export class DiseaseExample {
  constructor(
    public byoumei: string | null,
    public preAdjList: string[],
    public postAdjList: string[]
  ) {}

  static cast(arg: any): DiseaseExample {
    return new DiseaseExample(arg.byoumei, arg.preAdjList, arg.postAdjList);
  }

  get repr(): string {
    return [...this.preAdjList, this.byoumei || "", ...this.postAdjList].join(
      ""
    );
  }

  static isDiseaseExample(arg: any): arg is DiseaseExample {
    return (
      arg != null &&
      typeof arg === "object" &&
      (arg.byoumei == null || typeof arg.byoumei === "string") &&
      Array.isArray(arg.preAdjList) &&
      Array.isArray(arg.postAdjList)
    );
  }
}

export class DiseaseData {
  constructor(
    public disease: Disease,
    public byoumeiMaster: ByoumeiMaster,
    public adjList: [DiseaseAdj, ShuushokugoMaster][]
  ) {}

  clone(): DiseaseData {
    return new DiseaseData(
      this.disease.clone(),
      this.byoumeiMaster,
      this.adjList.map((tuple) => [tuple[0].clone(), tuple[1]])
    );
  }

  get shuushokugoMasters(): ShuushokugoMaster[] {
    return this.adjList.map((tpl) => tpl[1]);
  }

  static castFromTuple(tuple: any[]): DiseaseData {
    return new DiseaseData(
      Disease.cast(tuple[0]),
      ByoumeiMaster.cast(tuple[1]),
      tuple[2].map((pair: any) => [
        DiseaseAdj.cast(pair[0]),
        ShuushokugoMaster.cast(pair[1]),
      ])
    );
  }

  get fullName(): string {
    return this.byoumeiMaster.fullName(this.shuushokugoMasters);
  }

  get startDate(): Date {
    return this.disease.startDateAsDate;
  }

  get endDate(): Date | undefined {
    return stringToOptionalDate(this.disease.endDate);
  }

  get hasEndDate(): boolean {
    return this.endDate != undefined;
  }

  get endReason(): DiseaseEndReasonType {
    return DiseaseEndReasonType.fromCode(this.disease.endReasonStore);
  }

  get hasSusp(): boolean {
    for(let adj of this.adjList){
      const [_, m] = adj;
      if( m.shuushokugocode === ShuushokugoMaster.suspMaster.shuushokugocode ){
        return true;
      }
    }
    return false;
  }
}

export class Hotline {
  constructor(
    public message: string,
    public sender: string,
    public recipient: string
  ) {}

  static cast(arg: any): Hotline {
    return new Hotline(arg.message, arg.sender, arg.recipient);
  }
}

export class HotlineEx extends Hotline {
  constructor(
    public message: string,
    public sender: string,
    public recipient: string,
    public appEventId: number
  ) {
    super(message, sender, recipient);
  }
}

export class HotlineBeep {
  constructor(public recipient: string) {}

  static cast(arg: any): HotlineBeep {
    return new HotlineBeep(arg.recipient);
  }
}

export class EventIdNotice {
  constructor(public currentEventId: number) {}

  static cast(arg: any): EventIdNotice {
    return new EventIdNotice(arg.currentEventId);
  }
}

export class HeartBeat {
  constructor(public heartBeatSerialId: number) {}

  static cast(arg: any): HeartBeat {
    return new HeartBeat(arg.heartBeatSerialId);
  }
}

export class AppEvent {
  constructor(
    public appEventId: number,
    public createdAt: string,
    public model: string,
    public kind: string,
    public data: string
  ) {}

  static cast(arg: any): AppEvent {
    return new AppEvent(
      arg.appEventId,
      arg.createdAt,
      arg.model,
      arg.kind,
      arg.data
    );
  }
}

export class FileInfo {
  constructor(
    public name: string,
    public createdAt: string,
    public size: number
  ) {}

  static cast(arg: any): FileInfo {
    return new FileInfo(arg.name, arg.createdAt, arg.size);
  }
}

export class PrescExample {
  constructor(
    public prescExampleId: number,
    public iyakuhincode: number,
    public masterValidFrom: string,
    public amount: string,
    public usage: string,
    public days: number,
    public category: number,
    public comment: string
  ) {}

  static cast(arg: any): PrescExample {
    return new PrescExample(
      arg.prescExampleId,
      arg.iyakuhincode,
      arg.masterValidFrom,
      arg.amount,
      arg.usage,
      arg.days,
      arg.category,
      arg.comment
    );
  }
}
