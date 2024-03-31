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
  if( data.validFrom ){
    const k = new KanjiDate(new Date(data.validFrom));
    extend(data, "訪問看護指示期間開始（元号）", k.gengou);
    extend(data, "訪問看護指示期間開始（年）", k.nen.toString());
    extend(data, "訪問看護指示期間開始（月）", k.month.toString());
    extend(data, "訪問看護指示期間開始（日）", k.day.toString());
  }
  if( data.validUpto ){
    const k = new KanjiDate(new Date(data.validUpto));
    extend(data, "訪問看護指示期間期限（元号）", k.gengou);
    extend(data, "訪問看護指示期間期限（年）", k.nen.toString());
    extend(data, "訪問看護指示期間期限（月）", k.month.toString());
    extend(data, "訪問看護指示期間期限（日）", k.day.toString());
  }
  if( data.birthdate ){
    const k = new KanjiDate(new Date(data.birthdate));
    const at = data.issueDate ? new Date(data.issueDate) : new Date();
    const age = calcAge(data.birthdate, at);
    extend(data, `生年月日（元号：${k.gengou}）`, "1");
    extend(data, "生年月日（年）", k.nen.toString());
    extend(data, "生年月日（月）", k.month.toString());
    extend(data, "生年月日（日）", k.day.toString());
    extend(data, "年齢", age.toString());
  }
}