import { type RyouyouKeikakushoData } from "@/lib/drawer/forms/ryouyou-keikakusho/ryouyou-keikakusho-data";
import { dateToSql } from "@/lib/util";

export interface FormData {
  mode: "shokai" | "keizoku";
  issueDate: string;
  diseaseDiabetes: boolean;
  diseaseHypertension: boolean;
  diseaseHyperlipidemia: boolean;
  shokujiCheck: boolean;
  shokujiChecks: {
    "juuten-食事-摂取量を適正にする-mark": boolean;
    "juuten-食事-食塩・調味料を控える-mark": boolean;
    "juuten-食事-食物繊維の摂取を増やす-mark": boolean;
    "juuten-食事-外食の際の注意事項-mark": boolean;
    "juuten-食事-油を使った料理の摂取を減らす-mark": boolean;
    "juuten-食事-その他-mark": boolean;
    "juuten-食事-節酒-mark": boolean;
    "juuten-食事-間食-mark": boolean;
    "juuten-食事-食べ方-mark": boolean;
    "juuten-食事-食事時間-mark": boolean;
  };
  shokujiYukkuri: boolean;
  undouCheck: boolean;
  undouChecks: {
    "juuten-運動-種類-mark": boolean;
    "juuten-運動-活動量-mark": boolean;
    "juuten-運動-注意事項-mark": boolean;
  };
  undouEveryDay: boolean;
  undouIntensityBreath: boolean;
  tabakoCheck: boolean;
  tabakoChecks: {
    "juuten-たばこ-非喫煙者-mark": boolean;
    "juuten-たばこ-禁煙・節煙の有効性-mark": boolean;
    "juuten-たばこ-禁煙の実施補法等-mark": boolean;
  }
  immediates: {
    [Key in keyof RyouyouKeikakushoData]?: string;
  };
}

export function mkFormData(): FormData {
  return {
    mode: "shokai",
    issueDate: dateToSql(new Date()),
    diseaseDiabetes: false,
    diseaseHypertension: true,
    diseaseHyperlipidemia: false,
    shokujiCheck: false,
    shokujiChecks: {
      "juuten-食事-摂取量を適正にする-mark": false,
      "juuten-食事-食塩・調味料を控える-mark": false,
      "juuten-食事-食物繊維の摂取を増やす-mark": false,
      "juuten-食事-外食の際の注意事項-mark": false,
      "juuten-食事-油を使った料理の摂取を減らす-mark": false,
      "juuten-食事-その他-mark": false,
      "juuten-食事-節酒-mark": false,
      "juuten-食事-間食-mark": false,
      "juuten-食事-食べ方-mark": false,
      "juuten-食事-食事時間-mark": false,
    },
    shokujiYukkuri: false,
    undouCheck: false,
    undouChecks: {
      "juuten-運動-種類-mark": false,
      "juuten-運動-活動量-mark": false,
      "juuten-運動-注意事項-mark": false,
    },
    undouEveryDay: false,
    undouIntensityBreath: false,
    tabakoCheck: false,
    tabakoChecks: {
      "juuten-たばこ-非喫煙者-mark": false,
      "juuten-たばこ-禁煙・節煙の有効性-mark": false,
      "juuten-たばこ-禁煙の実施補法等-mark": false,
    },
    immediates: {
      "mokuhyou-体重": "",
      "mokuhyou-BMI": "",
      "mokuhyou-BP": "",
      "mokuhyou-HbA1c": "",
      "mokuhyou-達成目標": "",
      "mokuhyou-行動目標": "",
      "juuten-食事-外食の際の注意事項": "",
      "juuten-食事-節酒": "",
      "juuten-食事-節酒-回": "",
      "juuten-食事-間食": "",
      "juuten-食事-間食-回": "",
      "juuten-食事-食べ方": "",
      "juuten-運動-種類" : "",
      "juuten-運動-時間": "",
      "juuten-運動-頻度": "",
      "juuten-運動-強度-脈拍": "",
      "juuten-運動-強度-その他": "",
      "juuten-運動-活動量": "",
      "juuten-運動-注意事項": "",
    },
  }
}