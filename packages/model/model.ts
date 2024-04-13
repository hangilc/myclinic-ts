import { castList, castNumber, castOption, castOptionUndefined, castString } from "./cast";
export * from "./converters";

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


export function optionalDateToSqlDate(d: Date | undefined): string {
  if (d == null) {
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
  if (s == null || s === "0000-00-00") {
    return undefined;
  } else {
    return new Date(s);
  }
}

function isValidAt(
  validFrom: string,
  validUpto: string,
  at: Date | string
): boolean {
  let atStr: string;
  if (at instanceof Date) {
    atStr = dateToSqlDate(at);
  } else {
    if (at.length === 10) {
      atStr = at;
    } else {
      atStr = at.substring(0, 10);
    }
  }
  return (
    validFrom <= atStr && (validUpto === "0000-00-00" || atStr <= validUpto)
  );
}

export class SexType {
  constructor(public code: string, public rep: string) { }

  static fromCode(code: string): SexType {
    for (let s of Object.values(Sex)) {
      if (s.code === code) {
        return s;
      }
    }
    throw new Error("Cannot convert to SexType: " + code);
  }
}

export const Sex: Record<string, SexType> = {
  Male: new SexType("M", "男"),
  Female: new SexType("F", "女"),
};

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
    public phone: string,
    public memo: string | undefined,
  ) { }

  get memoAsJson(): any {
    try {
      return this.memo ? JSON.parse(this.memo) : {};
    } catch (_ex) {
      console.error("Invalid JSON: ", this.memo);
      return {};
    }
  }

  get rezeptName(): string | undefined {
    const name = this.memoAsJson["rezept-name"];
    if (typeof name === "string") {
      return name;
    } else {
      if (name) {
        console.error("Invalid rezept-name", name);
      }
      return undefined;
    }
  }

  get onshiName(): string | undefined {
    const name = this.memoAsJson["onshi-name"];
    if (typeof name === "string") {
      return name;
    } else {
      if (name) {
        console.error("Invalid onshi-name", name);
      }
      return undefined;
    }
  }

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
      arg.phone,
      arg.memo ?? undefined,
    );
  }

  fullName(sep: string = " "): string {
    return this.lastName + sep + this.firstName;
  }

  fullYomi(sep: string = " "): string {
    return this.lastNameYomi + sep + this.firstNameYomi;
  }

  get sexType(): SexType {
    return SexType.fromCode(this.sex);
  }

  get sexAsKanji(): string {
    return this.sexType.rep;
  }
}

export class RezeptComment {
  code: number;
  text: string;
  shikibetsucode?: string; // 診療識別コードCode ("01", "11", ...)

  constructor(code: number, text: string, shikibetsucode?: string) {
    this.code = code;
    this.text = text;
    this.shikibetsucode = shikibetsucode;
  }

  static cast(arg: any): RezeptComment {
    return new RezeptComment(
      castNumber(parseInt(arg.code)),
      castString(arg.text),
      castOptionUndefined<string>(castString)(arg.shikibetsucode),
    );
  }

  static isEqualComments(a: RezeptComment, b: RezeptComment): boolean {
    return a.code === b.code && a.text === b.text;
  }
}

export class RezeptShoujouShouki {
  kubun: string;
  text: string;

  constructor(kubun: string, text: string) {
    this.kubun = kubun;
    this.text = text;
  }

  static cast(arg: any): RezeptShoujouShouki {
    return new RezeptShoujouShouki(
      castString(arg.kubun),
      castString(arg.text),
    )
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
  ) { }

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

  memoAsJson(): any {
    if (this.attributesStore) {
      return JSON.parse(this.attributesStore);
    } else {
      return {};
    }
  }

  get comments(): RezeptComment[] {
    const comm = this.memoAsJson()["comments"];
    if (comm) {
      console.log("comments json", comm);
      return comm.map(RezeptComment.cast);
    } else {
      return [];
    }
  }

  get shoujouShoukiList(): RezeptShoujouShouki[] {
    const list = this.memoAsJson()["shoujou-shouki-list"];
    if (list) {
      return list.map(RezeptShoujouShouki.cast);
    } else {
      return [];
    }
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

  get visitedAtAsDate(): Date {
    return new Date(this.visitedAt);
  }

  hasKouhiId(kouhiId: number): boolean {
    return this.kouhi1Id === kouhiId || this.kouhi2Id === kouhiId || this.kouhi3Id === kouhiId;
  }

  get kouhiIdList(): number[] {
    return [this.kouhi1Id, this.kouhi2Id, this.kouhi3Id].filter(id => id > 0);
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

export class Wqueue {
  constructor(public visitId: number, public waitState: number) { }

  get waitStateType(): WqueueStateType {
    return WqueueStateType.fromCode(this.waitState);
  }

  static cast(arg: any): Wqueue {
    return new Wqueue(arg.visitId, arg.waitState);
  }
}

export class HonninKazokuType {
  constructor(public code: 0 | 1, public rep: string) { }

  static fromCode(code: number) {
    for (let t of Object.values(HonninKazoku)) {
      if ((t.code as number) === code) {
        return t;
      }
    }
    throw new Error("Cannot find HonninKazokuType for " + code);
  }
}

export const HonninKazoku = {
  Honnin: new HonninKazokuType(1, "本人"),
  Kazoku: new HonninKazokuType(0, "家族"),
};

export interface ShahokokuhoInterface {
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
    public edaban: string,
  ) { }

  asJson(): ShahokokuhoInterface {
    return {
      shahokokuhoId: this.shahokokuhoId,
      patientId: this.patientId,
      hokenshaBangou: this.hokenshaBangou,
      hihokenshaKigou: this.hihokenshaKigou,
      hihokenshaBangou: this.hihokenshaBangou,
      honninStore: this.honninStore,
      validFrom: this.validFrom,
      validUpto: this.validUpto,
      koureiStore: this.koureiStore,
      edaban: this.edaban,
    }
  }

  static fromJson(json: ShahokokuhoInterface): Shahokokuho {
    return new Shahokokuho(
      json.shahokokuhoId,
      json.patientId,
      json.hokenshaBangou,
      json.hihokenshaKigou,
      json.hihokenshaBangou,
      json.honninStore,
      json.validFrom,
      json.validUpto,
      json.koureiStore,
      json.edaban,
    )
  }

  clone(): Shahokokuho {
    return Shahokokuho.fromJson(this.asJson());
  }

  get honnninKazokuType(): HonninKazokuType {
    return HonninKazokuType.fromCode(this.honninStore);
  }

  isValidAt(at: Date | string): boolean {
    return isValidAt(this.validFrom, this.validUpto, at);
  }

  static isContentEqual(a: Shahokokuho, b: Shahokokuho): boolean {
    return a.shahokokuhoId === b.shahokokuhoId &&
      a.patientId === b.patientId &&
      a.hokenshaBangou === b.hokenshaBangou &&
      a.hihokenshaKigou === b.hihokenshaKigou &&
      a.hihokenshaBangou === b.hihokenshaBangou &&
      a.honninStore === b.honninStore &&
      a.koureiStore === b.koureiStore &&
      a.edaban === b.edaban;
  }

  static isValidTermEqual(a: Shahokokuho, b: Shahokokuho): boolean {
    return a.validFrom === b.validFrom && a.validUpto === b.validUpto;
  }

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
  ) { }

  isValidAt(at: Date | string): boolean {
    return isValidAt(this.validFrom, this.validUpto, at);
  }

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
  ) { }

  isValidAt(at: Date | string): boolean {
    return isValidAt(this.validFrom, this.validUpto, at);
  }

  static isContentEqual(a: Koukikourei, b: Koukikourei): boolean {
    return a.koukikoureiId === b.koukikoureiId &&
      a.patientId === b.patientId &&
      a.hokenshaBangou === b.hokenshaBangou &&
      a.hihokenshaBangou === b.hihokenshaBangou &&
      a.futanWari === b.futanWari;
  }

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

export interface KouhiInterface {
  kouhiId: number;
  futansha: number;
  jukyuusha: number;
  validFrom: string;
  validUpto: string;
  patientId: number;
  memo: string | undefined;
}

export class Kouhi {
  constructor(
    public kouhiId: number,
    public futansha: number,
    public jukyuusha: number,
    public validFrom: string,
    public validUpto: string,
    public patientId: number,
    public memo: string | undefined,
  ) { }

  static fromInterface(obj: KouhiInterface): Kouhi {
    return new Kouhi(obj.kouhiId, obj.futansha, obj.jukyuusha, obj.validFrom, obj.validUpto, obj.patientId, obj.memo);
  }

  get memoAsJson(): any {
    try {
      return this.memo ? JSON.parse(this.memo) : {};
    } catch (_ex) {
      console.error("Invalid JSON: ", this.memo);
      return {};
    }
  }

  isValidAt(at: Date | string): boolean {
    return isValidAt(this.validFrom, this.validUpto, at);
  }

  static isContentEqual(a: Kouhi, b: Kouhi): boolean {
    return a.kouhiId === b.kouhiId &&
      a.futansha === b.futansha &&
      a.jukyuusha === b.jukyuusha &&
      a.patientId === b.patientId;
  }

  static cast(arg: any): Kouhi {
    return new Kouhi(
      arg.kouhiId,
      arg.futansha,
      arg.jukyuusha,
      arg.validFrom,
      arg.validUpto,
      arg.patientId,
      arg.memo || undefined,
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
    return new HokenInfo({
      shahokokuho: arg.shahokokuho ? Shahokokuho.cast(arg.shahokokuho) : undefined,
      roujin: arg.roujin ? Roujin.cast(arg.roujin) : undefined,
      koukikourei: arg.koukikourei ? Koukikourei.cast(arg.koukikourei) : undefined,
      kouhiList: arg.kouhiList ? arg.kouhiList.map((arg: any) => Kouhi.cast(arg)) : [],
    });
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
  ) { }

  static cast(arg: any): Text {
    return new Text(arg.textId, arg.visitId, arg.content);
  }
}

export class Charge {
  constructor(public visitId: number, public charge: number) { }

  static cast(arg: any): Charge {
    return new Charge(arg.visitId, arg.charge);
  }
}

export class Payment {
  constructor(
    public visitId: number,
    public amount: number,
    public paytime: string
  ) { }

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
  ) { }

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
  ) { }

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
  ) { }

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
  constructor(public code: number, public name: string) { }

  static fromCode(code: number): DrugCategoryType {
    for (let v of Object.values(DrugCategory)) {
      if (v.code === code) {
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
  ) { }

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

export class ShinryouMemo {
  json: any;

  constructor(src: string | undefined) {
    if (!src) {
      this.json = {};
    } else {
      try {
        this.json = JSON.parse(src);
      } catch (ex) {
        console.error("Invalid json: ", src);
        this.json = {};
      }
    }
  }

  get comments(): RezeptComment[] {
    const comms = this.json["comments"];
    if (!comms) {
      return [];
    } else {
      try {
        console.log("comms", comms);
        return castList(RezeptComment.cast)(comms);
      } catch (ex) {
        console.error("Invalid comments: ", comms);
        return [];
      }
    }
  }

  get amount(): number | undefined {
    return this.json.amount;
  }
}

export class Shinryou {
  constructor(
    public shinryouId: number,
    public visitId: number,
    public shinryoucode: number,
    public memo?: string,
  ) { }

  parseMemo(): ShinryouMemo {
    return new ShinryouMemo(this.memo);
  }

  get comments(): RezeptComment[] {
    return this.parseMemo().comments;
  }

  get amount(): number | undefined {
    return this.parseMemo().amount;
  }

  static cast(arg: any): Shinryou {
    return new Shinryou(arg.shinryouId, arg.visitId, arg.shinryoucode, arg.memo || undefined);
  }
}

export class ShinryouEx {
  constructor(
    public shinryouId: number,
    public visitId: number,
    public shinryoucode: number,
    public memo: string | undefined,
    public master: ShinryouMaster
  ) { }

  asShinryou(): Shinryou {
    return new Shinryou(
      this.shinryouId,
      this.visitId,
      this.shinryoucode,
      this.memo
    );
  }

  static cast(arg: any): ShinryouEx {
    return new ShinryouEx(
      arg.shinryouId,
      arg.visitId,
      arg.shinryoucode,
      arg.memo ?? undefined,
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
  ) { }

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
    public master: ShinryouMaster,
    public memo?: string,
  ) { }

  get amount(): number | undefined {
    return ConductShinryouMemo.parseJson(this.memo).amount;
  }

  get comments(): RezeptComment[] {
    return ConductShinryouMemo.parseJson(this.memo).comments ?? [];
  }

  asConductShinryou(): ConductShinryou {
    return new ConductShinryou(
      this.conductShinryouId,
      this.conductId,
      this.shinryoucode,
      this.memo
    );
  }

  static cast(arg: any): ConductShinryouEx {
    return new ConductShinryouEx(
      arg.conductShinryouId,
      arg.conductId,
      arg.shinryoucode,
      ShinryouMaster.cast(arg.master),
      arg.memo ?? undefined,
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
  ) { }

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
  constructor(public code: number, public rep: string) { }

  get key(): string {
    for (let k of Object.keys(ConductKind)) {
      if (ConductKind[k].code === this.code) {
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

export interface VisitAttributesArg {
  futanWari?: number;
  hokengai?: string[];
}

export class VisitAttributes {
  futanWari: number | undefined;
  hokengai: string[];

  constructor(arg: VisitAttributesArg = {}) {
    this.futanWari = arg.futanWari;
    this.hokengai = arg.hokengai ?? [];
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

  get visitedAtAsDate(): Date {
    return new Date(this.visitedAt);
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
  constructor(public label: string) { }

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
  ShoshinSaishin: new MeisaiSectionType("初・再診料"),
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
  ) { }

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
  ) { }

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
  ) { }

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
  ) { }

  static cast(arg: any): Conduct {
    return new Conduct(arg.conductId, arg.visitId, arg.kindStore);
  }
}

export class GazouLabel {
  constructor(public conductId: number, public label: string) { }

  static cast(arg: any): GazouLabel {
    return new GazouLabel(arg.conductId, arg.label);
  }
}

class ConductShinryouMemo {
  amount?: number | undefined;
  comments?: { code: number, text: string }[];

  constructor(json: any) {
    this.amount = json.amount;
    this.comments = json.comments;
  }

  static parseJson(str: string | undefined): ConductShinryouMemo {
    if (str) {
      return new ConductShinryouMemo(JSON.parse(str));
    } else {
      return {};
    }
  }
}

export class ConductShinryou {
  constructor(
    public conductShinryouId: number,
    public conductId: number,
    public shinryoucode: number,
    public memo?: string,
  ) { }

  get amount(): number | undefined {
    return ConductShinryouMemo.parseJson(this.memo).amount;
  }

  static cast(arg: any): ConductShinryou {
    return new ConductShinryou(
      arg.conductShinryouId,
      arg.conductId,
      arg.shinryoucode,
      arg.memo ?? undefined,
    );
  }
}

export class ConductDrug {
  constructor(
    public conductDrugId: number,
    public conductId: number,
    public iyakuhincode: number,
    public amount: number
  ) { }

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
  ) { }

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

export function diseaseFullName(
  byoumeiMaster: ByoumeiMaster | null | undefined,
  shuushokugoMasters: ShuushokugoMaster[]
): string {
  const [pres, posts] = ShuushokugoMaster.classify(shuushokugoMasters);
  const pre: string = pres.map((m) => m.name).join("");
  const post: string = posts.map((m) => m.name).join("");
  return pre + (byoumeiMaster?.name ?? "") + post;
}

export class ByoumeiMaster {
  constructor(public shoubyoumeicode: number, public name: string) { }

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
    return diseaseFullName(this, adj);
  }
}

export class ShuushokugoMaster {
  constructor(public shuushokugocode: number, public name: string) { }

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
  constructor(public code: string, public label: string) { }

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
  ) { }

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

  set startDateAsDate(d: Date) {
    this.startDate = dateToSqlDate(d);
  }

  get endDateAsDate(): Date | null {
    if (this.endDate === "0000-00-00") {
      return null;
    } else {
      return new Date(this.endDate);
    }
  }

  set endDateAsDate(d: Date | null) {
    if (d === null) {
      this.endDate = "0000-00-00";
    } else {
      this.endDate = dateToSqlDate(d);
    }
  }

  get endReason(): DiseaseEndReasonType {
    return DiseaseEndReasonType.fromCode(this.endReasonStore);
  }

  set endReason(value: DiseaseEndReasonType) {
    this.endReasonStore = value.code;
  }

  clearEndDate(): Disease {
    const c = this.clone();
    c.endDate = "0000-00-00";
    return c;
  }

  isValidAt(at: Date | string): boolean {
    return isValidAt(this.startDate, this.endDate, at);
  }

  isCurrentAt(at: Date | string): boolean {
    return this.isValidAt(at) && this.endReason === DiseaseEndReason.NotEnded;
  }
}

export class DiseaseAdj {
  constructor(
    public diseaseAdjId: number,
    public diseaseId: number,
    public shuushokugocode: number
  ) { }

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
  ) { }

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
  ) { }

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
  ) { }

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
    return this.disease.endReason;
  }

  set endReason(value: DiseaseEndReasonType) {
    this.disease.endReason = value;
  }

  get hasSusp(): boolean {
    for (let adj of this.adjList) {
      const [_, m] = adj;
      if (m.shuushokugocode === ShuushokugoMaster.suspMaster.shuushokugocode) {
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
  ) { }

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
  constructor(public recipient: string) { }

  static cast(arg: any): HotlineBeep {
    return new HotlineBeep(arg.recipient);
  }
}

export class EventIdNotice {
  constructor(public currentEventId: number) { }

  static cast(arg: any): EventIdNotice {
    return new EventIdNotice(arg.currentEventId);
  }
}

export class HeartBeat {
  constructor(public heartBeatSerialId: number) { }

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
  ) { }

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
  ) { }

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
  ) { }

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

export class ScannerDevice {
  constructor(
    public deviceId: string,
    public name: string,
    public description: string,
  ) { }

  static cast(arg: any): ScannerDevice {
    return new ScannerDevice(
      arg.deviceId,
      arg.name,
      arg.description
    );
  }
}

export const ClinicOperationCode = {
  InOperation: "in-operation",
  RegularHoliday: "regular-holiday",
  AdHocHoliday: "ad-hoc-holiday",
  AdHocWorkday: "ad-hoc-workday",
  NationalHoliday: "national-holiday"
}

export class ClinicOperation {
  constructor(
    public code: string,
    public name: string | undefined
  ) { }

  static cast(arg: any): ClinicOperation {
    return new ClinicOperation(
      arg.type,
      arg.name
    );
  }

  static InOperation: ClinicOperation = new ClinicOperation(
    ClinicOperationCode.InOperation, ""
  )
}

export class AppointTime {
  constructor(
    public appointTimeId: number,
    public date: string,
    public fromTime: string,
    public untilTime: string,
    public kind: string,
    public capacity: number
  ) { }

  isConsecutive(follower: AppointTime): boolean {
    return this.date == follower.date && this.untilTime === follower.fromTime;
  }

  isBefore(other: AppointTime): boolean {
    return this.untilTime <= other.fromTime;
  }

  isAfter(other: AppointTime): boolean {
    return other.isBefore(this);
  }

  overlapsWith(other: AppointTime): boolean {
    return this.date === other.date &&
      !(this.isBefore(other) || this.isAfter(other));
  }

  static cast(arg: any): AppointTime {
    return new AppointTime(
      arg.appointTimeId,
      arg.date,
      arg.fromTime,
      arg.untilTime,
      arg.kind,
      arg.capacity,
    );
  }
}

export class Appoint {
  memoString: string;
  tags: string[];
  constructor(
    public appointId: number,
    public appointTimeId: number,
    public patientName: string,
    public patientId: number,
    public memo: string
  ) {
    const parsed = this.parseMemo(memo);
    this.memoString = parsed.memoString;
    this.tags = parsed.tags;
  }

  parseMemo(m: string): { memoString: string, tags: string[] } {
    const tagStart = m.indexOf("{{");
    if (tagStart >= 0) {
      const tagEnd = m.indexOf("}}");
      if (tagStart < tagEnd) {
        const tagString = m.substring(tagStart + 2, tagEnd);
        const tags = tagString.split(/[,、]/).map(s => s.trim())
        const left = m.substring(0, tagStart).trim();
        const right = m.substring(tagEnd + 2).trim();
        const memoString = left === "" ? right : `${left} ${right}`;
        return { memoString, tags };
      }
    }
    return { memoString: m, tags: [] };
  }

  static composeMemo(memoString: string, tags: string[]): string {
    const pre = tags.length === 0 ? "" : `{{${tags.join("、")}}}`;
    return `${pre}${memoString}`;
  }

  static cast(arg: any): Appoint {
    return new Appoint(
      arg.appointId,
      arg.appointTimeId,
      arg.patientName,
      arg.patientId,
      arg.memo ?? undefined,
    );
  }

  toJSON() {
    return ({
      appointId: this.appointId,
      appointTimeId: this.appointTimeId,
      patientName: this.patientName,
      patientId: this.patientId,
      memo: this.memo,
    });
  };
}

export class Onshi {
  visitId: number;
  kakunin: string;

  constructor(
    visitId: number, kakunin: string
  ) {
    this.visitId = visitId;
    this.kakunin = kakunin;
  }

  static cast(arg: any): Onshi {
    return new Onshi(
      arg.visitId,
      arg.kakunin
    );
  }
}

export class ClinicInfo {
  constructor(
    public name: string,
    public postalCode: string,
    public address: string,
    public tel: string,
    public fax: string,
    public todoufukencode: string,
    public tensuuhyoucode: string,
    public kikancode: string,
    public homepage: string,
    public doctorName: string,
  ) { }

  static cast(arg: any): ClinicInfo {
    return new ClinicInfo(
      arg.name,
      arg.postalCode,
      arg.address,
      arg.tel,
      arg.fax,
      arg.todoufukencode,
      arg.tensuuhyoucode,
      arg.kikancode,
      arg.homepage,
      arg.doctorName,
    )
  }
}

export class PatientSummary {
  constructor(
    public patientId: number,
    public content: string,
  ) { }
}
