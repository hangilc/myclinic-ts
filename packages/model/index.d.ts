export declare class Patient {
    patientId: number;
    lastName: string;
    firstName: string;
    lastNameYomi: string;
    firstNameYomi: string;
    sex: string;
    birthday: string;
    address: string;
    phone: string;
    constructor(patientId: number, lastName: string, firstName: string, lastNameYomi: string, firstNameYomi: string, sex: string, birthday: string, address: string, phone: string);
}
export declare class Visit {
    visitId: number;
    patientId: number;
    visitedAt: string;
    shahokokuhoId: number;
    roujinId: number;
    kouhi1Id: number;
    kouhi2Id: number;
    kouhi3Id: number;
    koukikoureiId: number;
    attributesStore?: string | undefined;
    constructor(visitId: number, patientId: number, visitedAt: string, shahokokuhoId: number, roujinId: number, kouhi1Id: number, kouhi2Id: number, kouhi3Id: number, koukikoureiId: number, attributesStore?: string | undefined);
    clone(): Visit;
    get attributes(): VisitAttributes | null;
    updateAttribute(attr: VisitAttributes | undefined): Visit;
}
export declare class WqueueStateType {
    code: number;
    label: string;
    constructor(code: number, label: string);
    static fromCode(code: number): WqueueStateType;
}
export declare const WqueueState: {
    readonly WaitExam: WqueueStateType;
    readonly InExam: WqueueStateType;
    readonly WaitCashier: WqueueStateType;
    readonly WaitDrug: WqueueStateType;
    readonly WaitReExam: WqueueStateType;
};
export interface Wqueue {
    visitId: number;
    waitState: number;
}
export declare class Wqueue {
    visitId: number;
    waitState: number;
    constructor(visitId: number, waitState: number);
    get waitStateType(): WqueueStateType;
}
export declare class Shahokokuho {
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
    constructor(shahokokuhoId: number, patientId: number, hokenshaBangou: number, hihokenshaKigou: string, hihokenshaBangou: string, honninStore: number, validFrom: string, validUpto: string, koureiStore: number, edaban: string);
}
export declare class Roujin {
    roujinId: number;
    patientId: number;
    shichouson: number;
    jukyuusha: number;
    futanWari: number;
    validFrom: string;
    validUpto: string;
    constructor(roujinId: number, patientId: number, shichouson: number, jukyuusha: number, futanWari: number, validFrom: string, validUpto: string);
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
export declare class Koukikourei {
    koukikoureiId: number;
    patientId: number;
    hokenshaBangou: string;
    hihokenshaBangou: string;
    futanWari: number;
    validFrom: string;
    validUpto: string;
    constructor(koukikoureiId: number, patientId: number, hokenshaBangou: string, hihokenshaBangou: string, futanWari: number, validFrom: string, validUpto: string);
}
export declare class Kouhi {
    kouhiId: number;
    futansha: number;
    jukyuusha: number;
    validFrom: string;
    validUpto: string;
    patientId: number;
    constructor(kouhiId: number, futansha: number, jukyuusha: number, validFrom: string, validUpto: string, patientId: number);
}
export declare class HokenInfo {
    shahokokuho: Shahokokuho | undefined;
    roujin: Roujin | undefined;
    koukikourei: Koukikourei | undefined;
    kouhiList: Kouhi[];
    constructor({ shahokokuho, roujin, koukikourei, kouhiList, }: {
        shahokokuho?: Shahokokuho;
        roujin?: Roujin;
        koukikourei?: Koukikourei;
        kouhiList?: Kouhi[];
    });
    static createBlank(): HokenInfo;
}
export declare class HokenIdSet {
    shahokokuhoId: number;
    koukikoureiId: number;
    roujinId: number;
    kouhi1Id: number;
    kouhi2Id: number;
    kouhi3Id: number;
    constructor(shahokokuhoId: number, koukikoureiId: number, roujinId: number, kouhi1Id: number, kouhi2Id: number, kouhi3Id: number);
}
export declare class Text {
    textId: number;
    visitId: number;
    content: string;
    constructor(textId: number, visitId: number, content: string);
}
export declare class Charge {
    visitId: number;
    charge: number;
    constructor(visitId: number, charge: number);
}
export declare class Payment {
    visitId: number;
    amount: number;
    paytime: string;
    constructor(visitId: number, amount: number, paytime: string);
}
export declare class IyakuhinMaster {
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
    constructor(iyakuhincode: number, yakkacode: string, name: string, yomi: string, unit: string, yakkaStore: string, madoku: string, kouhatsu: string, zaikei: string, validFrom: string, validUpto: string);
}
export declare class ShinryouMaster {
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
    constructor(shinryoucode: number, name: string, tensuuStore: string, tensuuShikibetsu: string, shuukeisaki: string, houkatsukensa: string, oushinkubun: string, kensagroup: string, validFrom: string, validUpto: string);
}
export declare class KizaiMaster {
    kizaicode: number;
    name: string;
    yomi: string;
    unit: string;
    kingakuStore: string;
    validFrom: string;
    validUpto: string;
    constructor(kizaicode: number, name: string, yomi: string, unit: string, kingakuStore: string, validFrom: string, validUpto: string);
}
export declare class DrugCategoryType {
    code: number;
    name: string;
    constructor(code: number, name: string);
}
export declare const DrugCategory: Record<string, DrugCategoryType>;
export declare class DrugEx {
    drugId: number;
    visitId: number;
    iyakuhincode: number;
    amount: number;
    usage: string;
    days: number;
    categoryStore: number;
    prescribed: boolean;
    master: IyakuhinMaster;
    constructor(drugId: number, visitId: number, iyakuhincode: number, amount: number, usage: string, days: number, categoryStore: number, prescribed: boolean, master: IyakuhinMaster);
}
export declare class Shinryou {
    shinryouId: number;
    visitId: number;
    shinryoucode: number;
    constructor(shinryouId: number, visitId: number, shinryoucode: number);
}
export declare class ShinryouEx {
    shinryouId: number;
    visitId: number;
    shinryoucode: number;
    master: ShinryouMaster;
    constructor(shinryouId: number, visitId: number, shinryoucode: number, master: ShinryouMaster);
}
export declare class ConductDrugEx {
    conductDrugId: number;
    conductId: number;
    iyakuhincode: number;
    amount: number;
    master: IyakuhinMaster;
    constructor(conductDrugId: number, conductId: number, iyakuhincode: number, amount: number, master: IyakuhinMaster);
}
export declare class ConductShinryouEx {
    conductShinryouId: number;
    conductId: number;
    shinryoucode: number;
    master: ShinryouMaster;
    constructor(conductShinryouId: number, conductId: number, shinryoucode: number, master: ShinryouMaster);
}
export declare class ConductKizaiEx {
    conductKizaiId: number;
    conductId: number;
    kizaicode: number;
    amount: number;
    master: KizaiMaster;
    constructor(conductKizaiId: number, conductId: number, kizaicode: number, amount: number, master: KizaiMaster);
}
export declare class ConductKindType {
    code: number;
    rep: string;
    constructor(code: number, rep: string);
    toTag(): ConductKindTag;
    static fromCode(code: number): ConductKindType;
    static fromKey(key: string): ConductKindType;
    static fromTag(tag: ConductKindTag): ConductKindType;
}
export declare const ConductKind: Record<string, ConductKindType>;
export declare type ConductKindTag = {
    [key in keyof typeof ConductKind]: {};
};
export declare class ConductEx {
    conductId: number;
    visitId: number;
    kind: ConductKindTag;
    gazouLabel: string | undefined;
    drugs: ConductDrugEx[];
    shinryouList: ConductShinryouEx[];
    kizaiList: ConductKizaiEx[];
    constructor({ conductId, visitId, kind, gazouLabel, drugs, shinryouList, kizaiList, }: {
        conductId: number;
        visitId: number;
        kind: ConductKindTag;
        gazouLabel?: string;
        drugs?: ConductDrugEx[];
        shinryouList?: ConductShinryouEx[];
        kizaiList?: ConductKizaiEx[];
    });
    static fromConduct(c: Conduct): ConductEx;
}
export declare class VisitAttributes {
    futanWari: number | undefined;
    constructor({ futanWari }: {
        futanWari?: number;
    });
    updateWith(other: VisitAttributes): VisitAttributes;
    static isVisitAttributes(arg: any): arg is VisitAttributes;
    static fromString(src: string | null): VisitAttributes | null;
}
export declare class VisitEx {
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
    constructor({ visitId, visitedAt, attributesStore, patient, hoken, texts, drugs, shinryouList, conducts, chargeOption, lastPayment, }: {
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
    });
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
export declare class MeisaiSectionItem {
    constructor();
    tanka: number;
    count: number;
    label: string;
}
export declare const MeisaiSectionItemObject: {
    totalOf(item: MeisaiSectionItem): number;
};
export declare class MeisaiSectionData {
    constructor();
    section: MeisaiSectionEnum;
    entries: MeisaiSectionItem[];
}
export declare const MeisaiSectionDataObject: {
    subtotalOf(data: MeisaiSectionData): number;
};
export declare class Meisai {
    constructor();
    items: MeisaiSectionData[];
    futanWari: number;
    charge: number;
}
export declare const MeisaiObject: {
    totalTenOf(meisai: Meisai): number;
};
export declare class Conduct {
    constructor();
    conductId: number;
    visitId: number;
    kindStore: number;
}
export declare class GazouLabel {
    constructor();
    conductId: number;
    label: string;
}
export declare class ConductShinryou {
    constructor();
    conductShinryouId: number;
    conductId: number;
    shinryoucode: number;
}
export declare class ConductDrug {
    constructor();
    conductDrugId: number;
    conductId: number;
    iyakuhincode: number;
    amount: number;
}
export declare class ConductKizai {
    constructor();
    conductKizaiId: number;
    conductId: number;
    kizaicode: number;
    amount: number;
}
export declare class CreateConductRequest {
    constructor();
    visitId: number;
    kind: number;
    labelOption: string | null;
    shinryouList: ConductShinryou[];
    drugs: ConductDrug[];
    kizaiList: ConductKizai[];
}
export declare class CreateShinryouConductRequest {
    constructor();
    shinryouList: Shinryou[];
    conducts: CreateConductRequest[];
}
export declare class ByoumeiMaster {
    constructor();
    shoubyoumeicode: number;
    name: string;
}
export declare function isByoumeiMaster(arg: any): arg is ByoumeiMaster;
export declare class ShuushokugoMaster {
    constructor();
    shuushokugocode: number;
    name: string;
}
export declare const ShuushokugoMasterObject: {
    smallestPostfixCode: number;
    isPrefix(m: ShuushokugoMaster): boolean;
};
export declare function isShuushokugoMaster(arg: any): arg is ShuushokugoMaster;
export declare class DiseaseEndReasonType {
    constructor();
    code: string;
    label: string;
}
export declare const DiseaseEndReason: Record<string, DiseaseEndReasonType>;
export declare const DiseaseEndReasonObject: {
    fromCode(code: string): DiseaseEndReasonType;
};
export declare class Disease {
    constructor();
    diseaseId: number;
    patientId: number;
    shoubyoumeicode: number;
    startDate: string;
    endDate: string;
    endReasonStore: string;
}
export declare class DiseaseAdj {
    constructor();
    diseaseAdjId: number;
    diseaseId: number;
    shuushokugocode: number;
}
export declare class DiseaseEnterData {
    constructor();
    patientId: number;
    byoumeicode: number;
    startDate: string;
    adjCodes: number[];
}
export declare class DiseaseExample {
    constructor();
    byoumei: string | null;
    preAdjList: string[];
    postAdjList: string[];
}
export declare const DiseaseExampleObject: {
    repr(e: DiseaseExample): string;
};
export declare function isDiseaseExample(arg: any): arg is DiseaseExample;
export declare class Hotline {
    constructor();
    message: string;
    sender: string;
    recipient: string;
}
export declare class HotlineEx extends Hotline {
    constructor();
    appEventId: number;
}
export declare class HotlineBeep {
    constructor();
    recipient: string;
}
export declare class EventIdNotice {
    constructor();
    currentEventId: number;
}
export declare class HeartBeat {
    constructor();
    heartBeatSerialId: number;
}
export declare class AppEvent {
    constructor();
    appEventId: number;
    createdAt: string;
    model: string;
    kind: string;
    data: string;
}
export declare class FileInfo {
    constructor();
    name: string;
    createdAt: string;
    size: number;
}
export declare class PrescExample {
    constructor();
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