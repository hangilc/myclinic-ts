export interface Byoumei {
    name: string;
    startDate: string;
}
export interface RcptKouhi {
    futansha: number;
    jukyuusha: number;
}
export interface RcptShinryou {
    shinryoucode: number;
    name: string;
    tensuu: string;
    shuukeisaki: string;
}
export interface Jushin {
    visitDate: string;
    shinryouList: RcptShinryou[];
}
export interface RcptEntry {
    patientId: number;
    patientName: string;
    sex: string;
    birthday: string;
    hokenShubetsu: string;
    hokenTandoku: string;
    hokennFutan: string;
    kyuufuWariai: string;
    tokkijikou: string;
    hokenshaBangou: string;
    hihokenshaKigou: string;
    hihokenshaBangou: string;
    kouhiList: RcptKouhi[];
    edaban: string;
    shouki: string;
    byoumeiList: Byoumei[];
    jushinList: Jushin[];
}
export interface RcptData {
    gengou: string;
    nen: number;
    month: number;
    regionCode: string;
    iryoukikanCode: string;
    address: string;
    phone: string;
    clinicName: string;
    entries: RcptEntry[];
}
export declare const RcptDataObject: {
    readFromXmlFile(dataFile: string): Promise<RcptData>;
};
//# sourceMappingURL=rcpt-data.d.ts.map