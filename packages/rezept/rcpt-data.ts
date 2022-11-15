import { readFileSync } from "fs"
import { Parser } from "xml2js";

export interface RcptEntry {
  patientId: number;
}

export interface RcptData {
  gengou: string,
  nen: number,
  month: number,
  regionCode: string,
  iryoukikanCode: string,
  address: string,
  phone: string,
  clinicName: string,
  entries: RcptEntry[]
}

export const RcptDataObject = {
  async readFromXmlFile(dataFile: string): Promise<RcptData> {
    const data: string = readFileSync(dataFile, "utf8");
    const parser = new Parser({});
    const xml = await parser.parseStringPromise(data);
    const root = xml['レセプト'];
    console.log(xml);
    return {
      gengou: root["元号"][0],
      nen: parseInt(root["年"][0]),
      month: parseInt(root["月"][0]),
      regionCode: root["都道府県番号"][0],
      iryoukikanCode: formatIryoukikanCode(root["医療機関コード"][0]),
      address: root["医療機関住所"][0],
      phone: root["医療機関電話"][0],
      clinicName: root["医療機関名称"][0],
      entries: []
    };
  }
} 

function formatIryoukikanCode(s: string): string {
  return s.replaceAll(".", "");
}