export class Patient {
    patientId;
    lastName;
    firstName;
    lastNameYomi;
    firstNameYomi;
    sex;
    birthday;
    address;
    phone;
    constructor(patientId, lastName, firstName, lastNameYomi, firstNameYomi, sex, birthday, address, phone) {
        this.patientId = patientId;
        this.lastName = lastName;
        this.firstName = firstName;
        this.lastNameYomi = lastNameYomi;
        this.firstNameYomi = firstNameYomi;
        this.sex = sex;
        this.birthday = birthday;
        this.address = address;
        this.phone = phone;
    }
}
export class Visit {
    visitId;
    patientId;
    visitedAt;
    shahokokuhoId;
    roujinId;
    kouhi1Id;
    kouhi2Id;
    kouhi3Id;
    koukikoureiId;
    attributesStore;
    constructor(visitId, patientId, visitedAt, shahokokuhoId, roujinId, kouhi1Id, kouhi2Id, kouhi3Id, koukikoureiId, attributesStore) {
        this.visitId = visitId;
        this.patientId = patientId;
        this.visitedAt = visitedAt;
        this.shahokokuhoId = shahokokuhoId;
        this.roujinId = roujinId;
        this.kouhi1Id = kouhi1Id;
        this.kouhi2Id = kouhi2Id;
        this.kouhi3Id = kouhi3Id;
        this.koukikoureiId = koukikoureiId;
        this.attributesStore = attributesStore;
    }
    clone() {
        return Object.assign({}, this);
    }
    get attributes() {
        return VisitAttributeObject.fromString(this.attributesStore ?? null);
    }
    updateAttribute(attr) {
        let newAttr;
        if (attr == undefined) {
            newAttr = undefined;
        }
        else {
            newAttr = JSON.stringify(attr);
        }
        const newVisit = this.clone();
        newVisit.attributesStore = newAttr;
        return newVisit;
    }
}
export class WqueueStateType {
    code;
    label;
    constructor(code, label) {
        this.code = code;
        this.label = label;
    }
    static fromCode(code) {
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
};
export class Wqueue {
    visitId;
    waitState;
    constructor(visitId, waitState) {
        this.visitId = visitId;
        this.waitState = waitState;
    }
    get waitStateType() {
        return WqueueStateType.fromCode(this.waitState);
    }
}
export class Shahokokuho {
    shahokokuhoId;
    patientId;
    hokenshaBangou;
    hihokenshaKigou;
    hihokenshaBangou;
    honninStore;
    validFrom;
    validUpto;
    koureiStore;
    edaban;
    constructor(shahokokuhoId, patientId, hokenshaBangou, hihokenshaKigou, hihokenshaBangou, honninStore, validFrom, validUpto, koureiStore, edaban) {
        this.shahokokuhoId = shahokokuhoId;
        this.patientId = patientId;
        this.hokenshaBangou = hokenshaBangou;
        this.hihokenshaKigou = hihokenshaKigou;
        this.hihokenshaBangou = hihokenshaBangou;
        this.honninStore = honninStore;
        this.validFrom = validFrom;
        this.validUpto = validUpto;
        this.koureiStore = koureiStore;
        this.edaban = edaban;
    }
}
export class Roujin {
    roujinId;
    patientId;
    shichouson;
    jukyuusha;
    futanWari;
    validFrom;
    validUpto;
    constructor(roujinId, patientId, shichouson, jukyuusha, futanWari, validFrom, validUpto) {
        this.roujinId = roujinId;
        this.patientId = patientId;
        this.shichouson = shichouson;
        this.jukyuusha = jukyuusha;
        this.futanWari = futanWari;
        this.validFrom = validFrom;
        this.validUpto = validUpto;
    }
}
export class Koukikourei {
    koukikoureiId;
    patientId;
    hokenshaBangou;
    hihokenshaBangou;
    futanWari;
    validFrom;
    validUpto;
    constructor(koukikoureiId, patientId, hokenshaBangou, hihokenshaBangou, futanWari, validFrom, validUpto) {
        this.koukikoureiId = koukikoureiId;
        this.patientId = patientId;
        this.hokenshaBangou = hokenshaBangou;
        this.hihokenshaBangou = hihokenshaBangou;
        this.futanWari = futanWari;
        this.validFrom = validFrom;
        this.validUpto = validUpto;
    }
}
export class Kouhi {
    kouhiId;
    futansha;
    jukyuusha;
    validFrom;
    validUpto;
    patientId;
    constructor(kouhiId, futansha, jukyuusha, validFrom, validUpto, patientId) {
        this.kouhiId = kouhiId;
        this.futansha = futansha;
        this.jukyuusha = jukyuusha;
        this.validFrom = validFrom;
        this.validUpto = validUpto;
        this.patientId = patientId;
    }
}
export class HokenInfo {
    shahokokuho;
    roujin;
    koukikourei;
    kouhiList;
    constructor({ shahokokuho = undefined, roujin = undefined, koukikourei = undefined, kouhiList = [], }) {
        this.shahokokuho = shahokokuho;
        this.roujin = roujin;
        this.koukikourei = koukikourei;
        this.kouhiList = kouhiList ?? [];
    }
    static createBlank() {
        return new HokenInfo({});
    }
}
export class HokenIdSet {
    shahokokuhoId;
    koukikoureiId;
    roujinId;
    kouhi1Id;
    kouhi2Id;
    kouhi3Id;
    constructor(shahokokuhoId, koukikoureiId, roujinId, kouhi1Id, kouhi2Id, kouhi3Id) {
        this.shahokokuhoId = shahokokuhoId;
        this.koukikoureiId = koukikoureiId;
        this.roujinId = roujinId;
        this.kouhi1Id = kouhi1Id;
        this.kouhi2Id = kouhi2Id;
        this.kouhi3Id = kouhi3Id;
    }
}
export class Text {
    textId;
    visitId;
    content;
    constructor(textId, visitId, content) {
        this.textId = textId;
        this.visitId = visitId;
        this.content = content;
    }
}
export class Charge {
    visitId;
    charge;
    constructor(visitId, charge) {
        this.visitId = visitId;
        this.charge = charge;
    }
}
export class Payment {
    visitId;
    amount;
    paytime;
    constructor(visitId, amount, paytime) {
        this.visitId = visitId;
        this.amount = amount;
        this.paytime = paytime;
    }
}
export class IyakuhinMaster {
    iyakuhincode;
    yakkacode;
    name;
    yomi;
    unit;
    yakkaStore;
    madoku;
    kouhatsu;
    zaikei;
    validFrom;
    validUpto;
    constructor(iyakuhincode, yakkacode, name, yomi, unit, yakkaStore, madoku, kouhatsu, zaikei, validFrom, validUpto) {
        this.iyakuhincode = iyakuhincode;
        this.yakkacode = yakkacode;
        this.name = name;
        this.yomi = yomi;
        this.unit = unit;
        this.yakkaStore = yakkaStore;
        this.madoku = madoku;
        this.kouhatsu = kouhatsu;
        this.zaikei = zaikei;
        this.validFrom = validFrom;
        this.validUpto = validUpto;
    }
}
export class ShinryouMaster {
    shinryoucode;
    name;
    tensuuStore;
    tensuuShikibetsu;
    shuukeisaki;
    houkatsukensa;
    oushinkubun;
    kensagroup;
    validFrom;
    validUpto;
    constructor(shinryoucode, name, tensuuStore, tensuuShikibetsu, shuukeisaki, houkatsukensa, oushinkubun, kensagroup, validFrom, validUpto) {
        this.shinryoucode = shinryoucode;
        this.name = name;
        this.tensuuStore = tensuuStore;
        this.tensuuShikibetsu = tensuuShikibetsu;
        this.shuukeisaki = shuukeisaki;
        this.houkatsukensa = houkatsukensa;
        this.oushinkubun = oushinkubun;
        this.kensagroup = kensagroup;
        this.validFrom = validFrom;
        this.validUpto = validUpto;
    }
}
export class KizaiMaster {
    kizaicode;
    name;
    yomi;
    unit;
    kingakuStore;
    validFrom;
    validUpto;
    constructor(kizaicode, name, yomi, unit, kingakuStore, validFrom, validUpto) {
        this.kizaicode = kizaicode;
        this.name = name;
        this.yomi = yomi;
        this.unit = unit;
        this.kingakuStore = kingakuStore;
        this.validFrom = validFrom;
        this.validUpto = validUpto;
    }
}
export class DrugCategoryType {
    code;
    name;
    constructor(code, name) {
        this.code = code;
        this.name = name;
    }
}
export const DrugCategory = {
    Naifuku: new DrugCategoryType(0, "内服"),
    Tonpuku: new DrugCategoryType(1, "頓服"),
    Gaiyou: new DrugCategoryType(2, "外用"),
};
export class DrugEx {
    drugId;
    visitId;
    iyakuhincode;
    amount;
    usage;
    days;
    categoryStore;
    prescribed;
    master;
    constructor(drugId, visitId, iyakuhincode, amount, usage, days, categoryStore, prescribed, master) {
        this.drugId = drugId;
        this.visitId = visitId;
        this.iyakuhincode = iyakuhincode;
        this.amount = amount;
        this.usage = usage;
        this.days = days;
        this.categoryStore = categoryStore;
        this.prescribed = prescribed;
        this.master = master;
    }
}
export class Shinryou {
    shinryouId;
    visitId;
    shinryoucode;
    constructor(shinryouId, visitId, shinryoucode) {
        this.shinryouId = shinryouId;
        this.visitId = visitId;
        this.shinryoucode = shinryoucode;
    }
}
export class ShinryouEx {
    shinryouId;
    visitId;
    shinryoucode;
    master;
    constructor(shinryouId, visitId, shinryoucode, master) {
        this.shinryouId = shinryouId;
        this.visitId = visitId;
        this.shinryoucode = shinryoucode;
        this.master = master;
    }
}
export class ConductDrugEx {
    conductDrugId;
    conductId;
    iyakuhincode;
    amount;
    master;
    constructor(conductDrugId, conductId, iyakuhincode, amount, master) {
        this.conductDrugId = conductDrugId;
        this.conductId = conductId;
        this.iyakuhincode = iyakuhincode;
        this.amount = amount;
        this.master = master;
    }
}
export class ConductShinryouEx {
    conductShinryouId;
    conductId;
    shinryoucode;
    master;
    constructor(conductShinryouId, conductId, shinryoucode, master) {
        this.conductShinryouId = conductShinryouId;
        this.conductId = conductId;
        this.shinryoucode = shinryoucode;
        this.master = master;
    }
}
export class ConductKizaiEx {
    conductKizaiId;
    conductId;
    kizaicode;
    amount;
    master;
    constructor(conductKizaiId, conductId, kizaicode, amount, master) {
        this.conductKizaiId = conductKizaiId;
        this.conductId = conductId;
        this.kizaicode = kizaicode;
        this.amount = amount;
        this.master = master;
    }
}
export class ConductKindType {
    code;
    rep;
    constructor(code, rep) {
        this.code = code;
        this.rep = rep;
    }
    toTag() {
        for (let k of Object.keys(ConductKind)) {
            const ct = ConductKind[k];
            if (ct.code === this.code) {
                return { [k]: {} };
            }
        }
        throw new Error("Cannot convert to ConductKindTag: " + this.code);
    }
    static fromCode(code) {
        for (let ck of Object.values(ConductKind)) {
            if (ck.code === code) {
                return ck;
            }
        }
        throw new Error("Invalid conduct kind code: " + code);
    }
    static fromKey(key) {
        const ck = ConductKind[key];
        if (ck === undefined) {
            throw new Error("Invalid conduct kind key: " + key);
        }
        return ck;
    }
    static fromTag(tag) {
        const key = Object.keys(tag)[0];
        return ConductKindType.fromKey(key);
    }
}
export const ConductKind = {
    HikaChuusha: new ConductKindType(0, "皮下・筋肉注射"),
    JoumyakuChuusha: new ConductKindType(1, "静脈注射"),
    OtherChuusha: new ConductKindType(2, "その他の注射"),
    Gazou: new ConductKindType(3, "画像"),
};
export class ConductEx {
    conductId;
    visitId;
    kind;
    gazouLabel;
    drugs;
    shinryouList;
    kizaiList;
    constructor({ conductId, visitId, kind, gazouLabel, drugs = [], shinryouList = [], kizaiList = [], }) {
        this.conductId = conductId;
        this.visitId = visitId;
        this.kind = kind;
        this.gazouLabel = gazouLabel;
        this.drugs = drugs;
        this.shinryouList = shinryouList;
        this.kizaiList = kizaiList;
    }
    static fromConduct(c) {
        return new ConductEx({
            conductId: c.conductId,
            visitId: c.visitId,
            kind: ConductKindType.fromCode(c.kindStore).toTag(),
        });
    }
}
export class VisitAttributes {
    futanWari;
    constructor({ futanWari = undefined }) {
        this.futanWari = futanWari;
    }
    updateWith(other) {
        const a = Object.assign({}, this, other);
        if (VisitAttributes.isVisitAttributes(a)) {
            return a;
        }
        else {
            throw new Error("Cannot update with: " + other);
        }
    }
    static isVisitAttributes(arg) {
        return (arg != null &&
            typeof arg === "object" &&
            (arg.futanWari === undefined ||
                (typeof arg.futanWari === "number" && Number.isInteger(arg.futanWari))));
    }
    static fromString(src) {
        if (src == null) {
            return null;
        }
        else {
            const json = JSON.parse(src);
            if (this.isVisitAttributes(json)) {
                return json;
            }
            else {
                throw new Error("Cannot convert to VisitAttributes: " + src);
            }
        }
    }
}
export class VisitEx {
    visitId;
    visitedAt;
    attributesStore;
    patient;
    hoken;
    texts;
    drugs;
    shinryouList;
    conducts;
    chargeOption;
    lastPayment;
    constructor({ visitId, visitedAt, attributesStore = undefined, patient, hoken, texts, drugs, shinryouList, conducts, chargeOption = undefined, lastPayment = undefined, }) {
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
}
export const VisitExObject = {
    attributesOf(visit) {
        return VisitAttributeObject.fromString(visit.attributesStore ?? null);
    },
    asVisit(src) {
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
export var MeisaiSectionEnum;
(function (MeisaiSectionEnum) {
    MeisaiSectionEnum["ShoshinSaisin"] = "\u521D\u30FB\u518D\u8A3A\u6599";
    MeisaiSectionEnum["IgakuKanri"] = "\u533B\u5B66\u7BA1\u7406\u7B49";
    MeisaiSectionEnum["Zaitaku"] = "\u5728\u5B85\u533B\u7642";
    MeisaiSectionEnum["Kensa"] = "\u691C\u67FB";
    MeisaiSectionEnum["Gazou"] = "\u753B\u50CF\u8A3A\u65AD";
    MeisaiSectionEnum["Touyaku"] = "\u6295\u85AC";
    MeisaiSectionEnum["Chuusha"] = "\u6CE8\u5C04";
    MeisaiSectionEnum["Shochi"] = "\u51E6\u7F6E";
    MeisaiSectionEnum["Sonota"] = "\u305D\u306E\u4ED6";
})(MeisaiSectionEnum || (MeisaiSectionEnum = {}));
export class MeisaiSectionItem {
    constructor() { }
    tanka;
    count;
    label;
}
export const MeisaiSectionItemObject = {
    totalOf(item) {
        return item.tanka * item.count;
    },
};
export class MeisaiSectionData {
    constructor() { }
    section;
    entries;
}
export const MeisaiSectionDataObject = {
    subtotalOf(data) {
        const totalOf = MeisaiSectionItemObject.totalOf;
        return data.entries.reduce((acc, ele) => {
            return acc + totalOf(ele);
        }, 0);
    },
};
export class Meisai {
    constructor() { }
    items;
    futanWari;
    charge;
}
export const MeisaiObject = {
    totalTenOf(meisai) {
        const subtotal = MeisaiSectionDataObject.subtotalOf;
        return meisai.items.reduce((acc, ele) => {
            return acc + subtotal(ele);
        }, 0);
    },
};
export class Conduct {
    constructor() { }
    conductId;
    visitId;
    kindStore;
}
export class GazouLabel {
    constructor() { }
    conductId;
    label;
}
export class ConductShinryou {
    constructor() { }
    conductShinryouId;
    conductId;
    shinryoucode;
}
export class ConductDrug {
    constructor() { }
    conductDrugId;
    conductId;
    iyakuhincode;
    amount;
}
export class ConductKizai {
    constructor() { }
    conductKizaiId;
    conductId;
    kizaicode;
    amount;
}
export class CreateConductRequest {
    constructor() { }
    visitId;
    kind;
    labelOption;
    shinryouList;
    drugs;
    kizaiList;
}
export class CreateShinryouConductRequest {
    constructor() { }
    shinryouList;
    conducts;
}
export class ByoumeiMaster {
    constructor() { }
    shoubyoumeicode;
    name;
}
export function isByoumeiMaster(arg) {
    return (arg != null &&
        typeof arg === "object" &&
        typeof arg.shoubyoumeicode === "number" &&
        typeof arg.name === "string");
}
export class ShuushokugoMaster {
    constructor() { }
    shuushokugocode;
    name;
}
export const ShuushokugoMasterObject = {
    smallestPostfixCode: 8000,
    isPrefix(m) {
        return m.shuushokugocode < ShuushokugoMasterObject.smallestPostfixCode;
    },
};
export function isShuushokugoMaster(arg) {
    return (arg != null &&
        typeof arg === "object" &&
        typeof arg.shuushokugocode === "number" &&
        typeof arg.name === "string");
}
export class DiseaseEndReasonType {
    constructor() { }
    code;
    label;
}
export const DiseaseEndReason = {
    NotEnded: { code: "N", label: "継続" },
    Cured: { code: "C", label: "治癒" },
    Stopped: { code: "S", label: "中止" },
    Dead: { code: "D", label: "死亡" },
};
export const DiseaseEndReasonObject = {
    fromCode(code) {
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
    diseaseId;
    patientId;
    shoubyoumeicode;
    startDate;
    endDate;
    endReasonStore;
}
export class DiseaseAdj {
    constructor() { }
    diseaseAdjId;
    diseaseId;
    shuushokugocode;
}
export class DiseaseEnterData {
    constructor() { }
    patientId;
    byoumeicode;
    startDate;
    adjCodes;
}
export class DiseaseExample {
    constructor() { }
    byoumei;
    preAdjList;
    postAdjList;
}
export const DiseaseExampleObject = {
    repr(e) {
        return [e.byoumei || "", ...e.preAdjList, ...e.postAdjList].join("");
    },
};
export function isDiseaseExample(arg) {
    return (arg != null &&
        typeof arg === "object" &&
        (arg.byoumei == null || typeof arg.byoumei === "string") &&
        Array.isArray(arg.preAdjList) &&
        Array.isArray(arg.postAdjList));
}
export class Hotline {
    constructor() { }
    message;
    sender;
    recipient;
}
export class HotlineEx extends Hotline {
    constructor() { }
    appEventId;
}
export class HotlineBeep {
    constructor() { }
    recipient;
}
export class EventIdNotice {
    constructor() { }
    currentEventId;
}
export class HeartBeat {
    constructor() { }
    heartBeatSerialId;
}
export class AppEvent {
    constructor() { }
    appEventId;
    createdAt;
    model;
    kind;
    data;
}
export class FileInfo {
    constructor() { }
    name;
    createdAt;
    size;
}
export class PrescExample {
    constructor() { }
    prescExampleId;
    iyakuhincode;
    masterValidFrom;
    amount;
    usage;
    days;
    category;
    comment;
}
