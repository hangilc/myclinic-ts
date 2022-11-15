export interface RcptEntry {
    patientId: number;
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