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
export declare const VisitObject: {
    attributesOf(visit: Visit): VisitAttributes | null;
    updateAttribute(visit: Visit, attr: VisitAttributes | null): Visit;
};
export declare const WqueueState: {
    readonly WaitExam: 0;
    readonly InExam: 1;
    readonly WaitCashier: 2;
    readonly WaitDrug: 3;
    readonly WaitReExam: 4;
};
export declare type WqueueStateKey = keyof typeof WqueueState;
export declare class WqueueStateData {
    code: number;
    label: string;
    constructor(code: number, label: string);
}
export declare const WqueueStateObject: Record<WqueueStateKey, WqueueStateData>;
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
export declare class Text {
    textId: number;
    visitId: number;
    content: string;
    constructor(textId: number, visitId: number, content: string);
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
export declare const DrugCategory: Record<string, DrugCategoryType>;
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
export declare type ConductKindKey = "HikaChuusha" | "JoumyakuChuusha" | "OtherChuusha" | "Gazou";
export declare const ConductKindKeyObject: {
    fromString(s: string): ConductKindKey;
};
export declare type ConductKindTag = {
    HikaChuusha: {};
} | {
    JoumyakuChuusha: {};
} | {
    OtherChuusha: {};
} | {
    Gazou: {};
};
export declare const ConductKindTagObject: {
    fromKey(key: ConductKindKey): ConductKindTag;
    fromCode(code: number): ConductKindTag;
};
export declare class ConductKindType {
    code: number;
    rep: string;
    key: ConductKindKey;
    constructor(code: number, rep: string, key: ConductKindKey);
}
export declare const ConductKind: Record<ConductKindKey, ConductKindType>;
export declare const ConductKindObject: {
    fromTag(tag: ConductKindTag): ConductKindType;
    fromCode(code: number): ConductKindType;
    fromKeyString(s: string): ConductKindType;
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
export declare const ConductExObject: {
    fromConduct(c: Conduct): ConductEx;
};
export interface VisitAttributes {
    futanWari?: number;
}
export declare const VisitAttributeObject: {
    fromString(src: string | null): VisitAttributes | null;
    updateWith(orig: VisitAttributes | null, update: VisitAttributes | null): VisitAttributes;
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
export declare const VisitExObject: {
    attributesOf(visit: VisitEx): VisitAttributes | null;
    asVisit(src: VisitEx): Visit;
};
export declare enum MeisaiSectionEnum {
    ShoshinSaisin = "\u521D\u30FB\u518D\u8A3A\u6599",
    IgakuKanri = "\u533B\u5B66\u7BA1\u7406\u7B49",
    Zaitaku = "\u5728\u5B85\u533B\u7642",
    Kensa = "\u691C\u67FB",
    Gazou = "\u753B\u50CF\u8A3A\u65AD",
    Touyaku = "\u6295\u85AC",
    Chuusha = "\u6CE8\u5C04",
    Shochi = "\u51E6\u7F6E",
    Sonota = "\u305D\u306E\u4ED6"
}
export interface MeisaiSectionItem {
    tanka: number;
    count: number;
    label: string;
}
export declare const MeisaiSectionItemObject: {
    totalOf(item: MeisaiSectionItem): number;
};
export interface MeisaiSectionData {
    section: MeisaiSectionEnum;
    entries: MeisaiSectionItem[];
}
export declare const MeisaiSectionDataObject: {
    subtotalOf(data: MeisaiSectionData): number;
};
export interface Meisai {
    items: MeisaiSectionData[];
    futanWari: number;
    charge: number;
}
export declare const MeisaiObject: {
    totalTenOf(meisai: Meisai): number;
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
export declare function isByoumeiMaster(arg: any): arg is ByoumeiMaster;
export interface ShuushokugoMaster {
    shuushokugocode: number;
    name: string;
}
export declare function isShuushokugoMaster(arg: any): arg is ShuushokugoMaster;
export interface DiseaseEndReasonType {
    code: string;
    label: string;
}
export declare const DiseaseEndReason: Record<string, DiseaseEndReasonType>;
export declare const DiseaseEndReasonObject: {
    fromCode(code: string): DiseaseEndReasonType;
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
export declare const DiseaseExampleObject: {
    repr(e: DiseaseExample): string;
};
export declare function isDiseaseExample(arg: any): arg is DiseaseExample;
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
//# sourceMappingURL=index.d.ts.map