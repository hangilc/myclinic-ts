import { calcAge } from "@/lib/calc-age";
import { KanjiDate } from "kanjidate";

export interface HoumonKangoData {
  "タイトル"?: string;
  "サブタイトル"?: string;
  validFrom?: string;
  "訪問看護指示期間開始（元号）"?: string;
  "訪問看護指示期間開始（年）"?: string;
  "訪問看護指示期間開始（月）"?: string;
  "訪問看護指示期間開始（日）"?: string;
  validUpto?: string;
  "訪問看護指示期間期限（元号）"?: string;
  "訪問看護指示期間期限（年）"?: string;
  "訪問看護指示期間期限（月）"?: string;
  "訪問看護指示期間期限（日）"?: string;
  "患者氏名"?: string;
  birthdate?: string;
  "生年月日（元号：明治）"?: string;
  "生年月日（元号：大正）"?: string;
  "生年月日（元号：昭和）"?: string;
  "生年月日（元号：平成）"?: string;
  "生年月日（年）"?: string;
  "生年月日（月）"?: string;
  "生年月日（日）"?: string;
  "年齢"?: string;
  "患者住所"?: string;
  "主たる傷病名"?: string;
  "病状"?: string;
  "薬剤"?: string;
  netakiri?: "J1" | "J2" | "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  "寝たきり度(J1)"?: string;
  "寝たきり度(J2)"?: string;
  "寝たきり度(A1)"?: string;
  "寝たきり度(A2)"?: string;
  "寝たきり度(B1)"?: string;
  "寝たきり度(B2)"?: string;
  "寝たきり度(C1)"?: string;
  "寝たきり度(C2)"?: string;
  ninchi?: "Ｉ" | "IIa" | "IIb" | "IIIa" | "IIIb" | "IV" | "Ｍ"; 
  "認知症の状況(Ｉ)"?: string;
  "認知症の状況(IIa)"?: string;
  "認知症の状況(IIb)"?: string;
  "認知症の状況(IIIa)"?: string;
  "認知症の状況(IIIb)"?: string;
  "認知症の状況(IV)"?: string;
  "認知症の状況(Ｍ)"?: string;
  youkaigo?: "自立" | "要支援1" | "要支援2" | "要介護1" | "要介護2" | "要介護3" | "要介護4" | "要介護5";
  "要介護認定の状況（自立）"?: string;
  "要介護認定の状況（要支援1）"?: string;
  "要介護認定の状況（要支援2）"?: string;
  "要介護認定の状況（要介護1）"?: string;
  "要介護認定の状況（要介護2）"?: string;
  "要介護認定の状況（要介護3）"?: string;
  "要介護認定の状況（要介護4）"?: string;
  "要介護認定の状況（要介護5）"?: string;
  jukusou?: "3" | "4" | "D3" | "D4" | "D5";
  "褥瘡の深さ(3)"?: string;
  "褥瘡の深さ(4)"?: string;
  "褥瘡の深さ(D3)"?: string;
  "褥瘡の深さ(D4)"?: string;
  "褥瘡の深さ(D5)"?: string;

  issueDate?: string;
}

//   constructor(arg: HoumonKangoDataArg = {}) {
//     this.title = arg.title ?? "介護予防訪問看護・訪問看護指示書";
//     this.subtitle = arg.subtitle ?? "訪問看護指示期間";
//     this.validFrom = arg.validFrom;
//     this.validUpto = arg.validUpto;
//   }
// }

function extend(data: any, key: string, value: string | undefined) {
  data[key] = data[key] ?? value;
}

export function extendData(data: HoumonKangoData): void {
  if (data.validFrom) {
    const k = new KanjiDate(new Date(data.validFrom));
    extend(data, "訪問看護指示期間開始（元号）", k.gengou);
    extend(data, "訪問看護指示期間開始（年）", k.nen.toString());
    extend(data, "訪問看護指示期間開始（月）", k.month.toString());
    extend(data, "訪問看護指示期間開始（日）", k.day.toString());
  }
  if (data.validUpto) {
    const k = new KanjiDate(new Date(data.validUpto));
    extend(data, "訪問看護指示期間期限（元号）", k.gengou);
    extend(data, "訪問看護指示期間期限（年）", k.nen.toString());
    extend(data, "訪問看護指示期間期限（月）", k.month.toString());
    extend(data, "訪問看護指示期間期限（日）", k.day.toString());
  }
  if (data.birthdate) {
    const k = new KanjiDate(new Date(data.birthdate));
    const at = data.issueDate ? new Date(data.issueDate) : new Date();
    const age = calcAge(data.birthdate, at);
    extend(data, `生年月日（元号：${k.gengou}）`, "1");
    extend(data, "生年月日（年）", k.nen.toString());
    extend(data, "生年月日（月）", k.month.toString());
    extend(data, "生年月日（日）", k.day.toString());
    extend(data, "年齢", age.toString());
  }
  if (data.netakiri) {
    extend(data, `寝たきり度(${data.netakiri})`, "1");
  }
  if( data.ninchi ){
    extend(data, `認知症の状況(${data.ninchi})`, "1");
  }
  if( data.youkaigo ){
    extend(data, `要介護認定の状況（${data.youkaigo}）`, "1");
  }
  if( data.jukusou ){
    extend(data, `褥瘡の深さ(${data.jukusou})`, "1");
  }
}