import { readFileSync } from "fs"
import { Parser } from "xml2js";

export interface Byoumei {
  name: string,
  startDate: string,
}

export interface RcptShinryou {
  shinryoucode: number,
  name: string,
  tensuu: string,
  shuukeisaki: string,
}

export interface Jushin {
  visitDate: string,
  shinryouList: RcptShinryou[],
}

export interface RcptEntry {
  patientId: number,
  patientName: string,
  sex: string,
  birthday: string,
  hokenShubetsu: string,
  hokenTandoku: string,
  hokennFutan: string,
  kyuufuWariai: string,
  tokkijikou: string,
  hokenshaBangou: string,
  hihokenshaKigou: string,
  hihokenshaBangou: string,
  edaban: string,
  shouki: string,
  byoumeiList: Byoumei[],
  jushinList: Jushin[],
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
    console.log(root['請求'][0]);
    console.log(root['請求'][0]["受診"][0]["診療"]);
    return {
      gengou: root["元号"][0],
      nen: parseInt(root["年"][0]),
      month: parseInt(root["月"][0]),
      regionCode: root["都道府県番号"][0],
      iryoukikanCode: formatIryoukikanCode(root["医療機関コード"][0]),
      address: root["医療機関住所"][0],
      phone: formatPhone(root["医療機関電話"][0]),
      clinicName: root["医療機関名称"][0],
      entries: root['請求'].slice(0, 1).map(xmlToEntry)
    };
  }
}

function formatIryoukikanCode(s: string): string {
  return s.replaceAll(".", "");
}

function formatPhone(s: string): string {
  return s.replaceAll(/\s*[)(]\s*/g, "-");
}

function xmlToEntry(xml: any): RcptEntry {
  return {
    patientId: parseInt(xml["患者番号"][0]),
    patientName: xml["氏名"][0],
    sex: xml["性別"][0],
    birthday: formatBirthday(xml["生年月日"][0]),
    hokenShubetsu: xml["保険種別"][0],
    hokenTandoku: xml["保険単独"][0],
    hokennFutan: xml["保険負担"][0],
    kyuufuWariai: xml["給付割合"][0],
    tokkijikou: xml["特記事項"][0],
    hokenshaBangou: xml["保険者番号"][0],
    hihokenshaKigou: xml["被保険者記号"][0],
    hihokenshaBangou: xml["被保険者番号"][0],
    edaban: xml["被保険者枝番"][0],
    shouki: xml["症状詳記"][0],
    byoumeiList: xml["傷病名"].map(xmlToByoumei),
    jushinList: xml["受診"].map(xmlToJushin),
  };
}

function formatBirthday(s: string): string {
  return formatDate(s);
}

function formatDate(s: string): string {
  return s.replaceAll("-", "");
}

function xmlToByoumei(xml: any): Byoumei {
  return {
    name: xml["名称"][0],
    startDate: formatDate(xml["診療開始日"][0])
  }
}

function formatJushinDate(s: string): string {
  return formatDate(s).substring(0, 10);
}

function xmlToJushin(xml: any): Jushin {
  return {
    visitDate: formatJushinDate(xml["受診日"][0]),
    shinryouList: xml["診療"].map(xmlToShinryou),
  }
}

function xmlToShinryou(xml: any): RcptShinryou {
  return {
    shinryoucode: parseInt(xml["診療コード"][0]),
    name: xml["名称"][0],
    tensuu: xml["点数"][0],
    shuukeisaki: xml["集計先"][0],
  }
}