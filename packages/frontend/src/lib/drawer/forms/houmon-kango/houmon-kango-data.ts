import { calcAge } from "@/lib/calc-age";
import { DateWrapper } from "myclinic-util";

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
  "自動腹膜灌流装置"?: string;
  "透析液供給装置"?: string;
  "酸素療法"?: string;
  "酸素療法流速"?: string;
  "吸引器"?: string;
  "中心静脈栄養"?: string;
  "輸液ポンプ"?: string;

  "経管栄養"?: string;
  "経管栄養経鼻"?: string;
  "経管栄養胃ろう"?: string;
  "経管栄養チューブサイズ"?: string;
  "経管栄養交換日"?: string;

  "留置カテーテル"?: string;
  "留置カテーテルサイズ"?: string;
  "留置カテーテル交換日"?: string;

  "人工呼吸器"?: string;
  "人工呼吸器陽圧式"?: string;
  "人工呼吸器陰圧式"?: string;
  "人工呼吸器設定"?: string;

  "気管カニューレ"?: string;
  "気管カニューレサイズ"?: string;
  "人工肛門"?: string;
  "人工膀胱"?: string;
  "装置その他マーク"?: string;
  "装置その他"?: string;

  "留意事項"?: string;

  "留意事項：リハビリテーションマーク"?: string;
  "留意事項：リハビリテーション"?: string;
  "留意事項：褥瘡の処置などマーク"?: string;
  "留意事項：褥瘡の処置など"?: string;
  "留意事項：装置マーク"?: string;
  "留意事項：装置"?: string;
  "留意事項：その他マーク"?: string;
  "留意事項：その他"?: string;

  "点滴指示"?: string;

  "緊急時の連絡先"?: string;
  "不在時の対応法"?: string;

  "特記すべき留意事項"?: string;

  "他の訪問看護ステーションへの指示：無"?: string;
  "他の訪問看護ステーションへの指示：有"?: string;
  "他の訪問看護ステーションへの指示：ステーション名"?: string;
  "たんの吸引等実施のための訪問介護事業所への指示：無"?: string;
  "たんの吸引等実施のための訪問介護事業所への指示：有"?: string;
  "たんの吸引等実施のための訪問介護事業所への指示：指定訪問介護事業所名"?: string;

  "発行日（元号）"?: string;
  "発行日（年）"?: string;
  "発行日（月）"?: string;
  "発行日（日）"?: string;
  "医療機関名"?: string;
  "医療機関（住所）"?: string;
  "医療機関（電話）"?: string;
  "医療機関（ＦＡＸ）"?: string;
  "医師氏名"?: string;
  "提出先"?: string;

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
    const k = DateWrapper.from(new Date(data.validFrom));
    extend(data, "訪問看護指示期間開始（元号）", k.getGengou());
    extend(data, "訪問看護指示期間開始（年）", k.getNen().toString());
    extend(data, "訪問看護指示期間開始（月）", k.getMonth().toString());
    extend(data, "訪問看護指示期間開始（日）", k.getDay().toString());
  }
  if (data.validUpto) {
    const k = DateWrapper.from(new Date(data.validUpto));
    extend(data, "訪問看護指示期間期限（元号）", k.getGengou());
    extend(data, "訪問看護指示期間期限（年）", k.getNen().toString());
    extend(data, "訪問看護指示期間期限（月）", k.getMonth().toString());
    extend(data, "訪問看護指示期間期限（日）", k.getDay().toString());
  }
  if (data.birthdate) {
    const k = DateWrapper.from(new Date(data.birthdate));
    const at = data.issueDate ? new Date(data.issueDate) : new Date();
    const age = calcAge(data.birthdate, at);
    extend(data, `生年月日（元号：${k.getGengou()}）`, "1");
    extend(data, "生年月日（年）", k.getNen().toString());
    extend(data, "生年月日（月）", k.getMonth().toString());
    extend(data, "生年月日（日）", k.getDay().toString());
    extend(data, "年齢", age.toString());
  }
  if (data.netakiri) {
    extend(data, `寝たきり度(${data.netakiri})`, "1");
  }
  if (data.ninchi) {
    extend(data, `認知症の状況(${data.ninchi})`, "1");
  }
  if (data.youkaigo) {
    extend(data, `要介護認定の状況（${data.youkaigo}）`, "1");
  }
  if (data.jukusou) {
    extend(data, `褥瘡の深さ(${data.jukusou})`, "1");
  }
}

