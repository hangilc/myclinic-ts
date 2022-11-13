export const VisitObject = {
    attributesOf(visit) {
        return VisitAttributeObject.fromString(visit.attributesStore);
    },
    updateAttribute(visit, attr) {
        let newAttr;
        if (attr == null) {
            newAttr = null;
        }
        else {
            newAttr = JSON.stringify(attr);
        }
        return Object.assign({}, visit, {
            attributesStore: newAttr
        });
    }
};
export const WqueueState = {
    WaitExam: 0,
    InExam: 1,
    WaitCashier: 2,
    WaitDrug: 3,
    WaitReExam: 4,
};
export class WqueueStateData {
    code;
    label;
    constructor(code, label) {
        this.code = code;
        this.label = label;
    }
}
export const WqueueStateObject = {
    "WaitExam": new WqueueStateData(0, "診待"),
    "InExam": new WqueueStateData(1, "診中"),
    "WaitCashier": new WqueueStateData(2, "会待"),
    "WaitDrug": new WqueueStateData(3, "薬待"),
    "WaitReExam": new WqueueStateData(4, "再待"),
};
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
export const DrugCategory = {
    Naifuku: { code: 0, name: "内服" },
    Tonpuku: { code: 1, name: "頓服" },
    Gaiyou: { code: 2, name: "外用" },
};
export class ConductKindType {
    code;
    rep;
    key;
    constructor(code, rep, key) {
        this.code = code;
        this.rep = rep;
        this.key = key;
    }
}
export const ConductKind = {
    HikaChuusha: new ConductKindType(0, "皮下・筋肉注射", "HikaChuusha"),
    JoumyakuChuusha: new ConductKindType(1, "静脈注射", "JoumyakuChuusha"),
    OtherChuusha: new ConductKindType(2, "その他の注射", "OtherChuusha"),
    Gazou: new ConductKindType(3, "画像", "Gazou")
};
export const ConductKindObject = {
    fromTag(tag) {
        const key = Object.keys(tag)[0];
        return ConductKind[key];
    }
};
export const VisitAttributeObject = {
    fromString(src) {
        if (src == null) {
            return null;
        }
        else {
            return JSON.parse(src);
        }
    },
    updateWith(orig, update) {
        return Object.assign({}, orig, update);
    }
};
export const VisitExObject = {
    attributesOf(visit) {
        return VisitAttributeObject.fromString(visit.attributesStore);
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
            attributesStore: src.attributesStore
        };
    }
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
export const MeisaiSectionItemObject = {
    totalOf(item) {
        return item.tanka * item.count;
    }
};
export const MeisaiSectionDataObject = {
    subtotalOf(data) {
        const totalOf = MeisaiSectionItemObject.totalOf;
        return data.entries.reduce((acc, ele) => {
            return acc + totalOf(ele);
        }, 0);
    }
};
export const MeisaiObject = {
    totalTenOf(meisai) {
        const subtotal = MeisaiSectionDataObject.subtotalOf;
        return meisai.items.reduce((acc, ele) => {
            return acc + subtotal(ele);
        }, 0);
    }
};
export function isByoumeiMaster(arg) {
    return arg != null &&
        typeof arg === "object" &&
        typeof arg.shoubyoumeicode === "number" &&
        typeof arg.name === "string";
}
export function isShuushokugoMaster(arg) {
    return arg != null &&
        typeof arg === "object" &&
        typeof arg.shuushokugocode === "number" &&
        typeof arg.name === "string";
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
    }
};
export const DiseaseExampleObject = {
    repr(e) {
        return [e.byoumei || "", ...e.preAdjList, ...e.postAdjList].join("");
    }
};
export function isDiseaseExample(arg) {
    return arg != null &&
        typeof arg === "object" &&
        (arg.byoumei == null || typeof arg.byoumei === "string") &&
        Array.isArray(arg.preAdjList) && Array.isArray(arg.postAdjList);
}
