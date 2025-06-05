import { type RyouyouKeikakushoData } from "@/lib/drawer/forms/ryouyou-keikakusho/ryouyou-keikakusho-data";
import { dateToSql } from "@/lib/util";

export interface FormData {
  format: number;
  mode: "shokai" | "keizoku";
  issueDate: string;
  patientId: number;
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
  undouWalking: boolean;
  undouEveryDay: boolean;
  undouIntensityBreath: boolean;
  tabakoCheck: boolean;
  tabakoChecks: {
    "juuten-たばこ-非喫煙者-mark": boolean;
    "juuten-たばこ-禁煙・節煙の有効性-mark": boolean;
    "juuten-たばこ-禁煙の実施補法等-mark": boolean;
  };
  sonotaCheck: boolean;
  sonotaChecks: {
    "juuten-その他-仕事-mark": boolean;
    "juuten-その他-余暇-mark": boolean;
    "juuten-その他-睡眠の確保-mark": boolean;
    "juuten-その他-減量-mark": boolean;
    "juuten-その他-家庭での計測-mark": boolean;
    "juuten-その他-その他-mark": boolean;
  };
  kensaDate: string;
  kensaChecks: {
    "kensa-血糖-mark": boolean;
    "kensa-血糖-空腹時-mark": boolean;
    "kensa-血糖-随時-mark": boolean;
    "kensa-血糖-食後-mark": boolean;
    "kensa-総コレステロール-mark": boolean;
    "kensa-中性脂肪-mark": boolean;
    "kensa-ＨＤＬコレステロール-mark": boolean;
    "kensa-HbA1c-mark": boolean;
    "kensa-ＬＤＬコレステロール-mark": boolean;
    "kensa-栄養状態-mark": boolean;
    "kensa-栄養状態-低栄養状態の恐れ": boolean;
    "kensa-栄養状態-良好": boolean;
    "kensa-栄養状態-肥満": boolean;
    "kensa-血液検査項目-その他-mark": boolean;
    "kensa-その他-その他-mark": boolean;
  };
  immediates: {
    [Key in keyof RyouyouKeikakushoData]?: string;
  };
}

export function mkFormData(): FormData {
  return {
    format: 1,
    mode: "shokai",
    issueDate: dateToSql(new Date()),
    patientId: 0,
    diseaseDiabetes: false,
    diseaseHypertension: false,
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
    undouWalking: false,
    undouEveryDay: false,
    undouIntensityBreath: false,
    tabakoCheck: false,
    tabakoChecks: {
      "juuten-たばこ-非喫煙者-mark": false,
      "juuten-たばこ-禁煙・節煙の有効性-mark": false,
      "juuten-たばこ-禁煙の実施補法等-mark": false,
    },
    sonotaCheck: false,
    sonotaChecks: {
      "juuten-その他-仕事-mark": false,
      "juuten-その他-余暇-mark": false,
      "juuten-その他-睡眠の確保-mark": false,
      "juuten-その他-減量-mark": false,
      "juuten-その他-家庭での計測-mark": false,
      "juuten-その他-その他-mark": false,
    },
    kensaDate: "",
    kensaChecks: {
      "kensa-血糖-mark": false,
      "kensa-血糖-空腹時-mark": false,
      "kensa-血糖-随時-mark": false,
      "kensa-血糖-食後-mark": false,
      "kensa-HbA1c-mark": false,
      "kensa-総コレステロール-mark": false,
      "kensa-中性脂肪-mark": false,
      "kensa-ＨＤＬコレステロール-mark": false,
      "kensa-ＬＤＬコレステロール-mark": false,
      "kensa-血液検査項目-その他-mark": false,
      "kensa-栄養状態-mark": false,
      "kensa-栄養状態-低栄養状態の恐れ": false,
      "kensa-栄養状態-良好": false,
      "kensa-栄養状態-肥満": false,
      "kensa-その他-その他-mark": false,
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
      "juuten-運動-種類": "",
      "juuten-運動-時間": "",
      "juuten-運動-頻度": "",
      "juuten-運動-強度-脈拍": "",
      "juuten-運動-強度-その他": "",
      "juuten-運動-活動量": "",
      "juuten-運動-注意事項": "",
      "juuten-その他-その他": "",
      "kensa-血糖-食後": "",
      "kensa-血糖-値": "",
      "kensa-HbA1c": "",
      "kensa-総コレステロール": "",
      "kensa-中性脂肪": "",
      "kensa-ＨＤＬコレステロール": "",
      "kensa-ＬＤＬコレステロール": "",
      "kensa-血液検査項目-その他": "",
      "kensa-その他-その他": "",
    },
  }
}

export function getMostRecent(
  dataList: Partial<FormData>[]
): Partial<FormData> | undefined {
  let issue: string = "";
  let index = -1;
  dataList.forEach((d, i) => {
    if (d.issueDate) {
      if (d.issueDate > issue) {
        index = i;
        issue = d.issueDate;
      }
    }
  });
  return index >= 0 ? dataList[index] : undefined;
}

export function effectiveFormDataOf(data: FormData): Partial<FormData> {
  function removeIfDefault(obj: any) {
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      if (typeof value === "object") {
        if (Object.keys(value).length === 0) {
          delete obj[key];
        }
      } else if (value == null || value === "" || value === false) {
        delete obj[key];
      }

    })
  }
  let obj = Object.assign({}, data);
  removeIfDefault(obj.shokujiChecks);
  removeIfDefault(obj.undouChecks);
  removeIfDefault(obj.tabakoChecks);
  removeIfDefault(obj.sonotaChecks);
  removeIfDefault(obj.kensaChecks);
  removeIfDefault(obj.immediates);
  removeIfDefault(obj);
  return obj;
}

function copy(dstObj: any, srcObj: any) {
  if( typeof dstObj !== "object" ){
    throw new Error("not an object");
  }
  if( typeof srcObj !== "object" ){
    throw new Error("not an object")
  }
  for(let key of Object.keys(srcObj) ){
    let value = srcObj[key];
    if( typeof value === "object" ){
      if( dstObj[key] == undefined ){
        dstObj[key] = {};
      }
      copy(dstObj[key], value);
    } else {
      dstObj[key] = value;
    }
  }
}

export function updateByPartial(obj: FormData, partial: Partial<FormData>): FormData {
  copy(obj, partial);
  return obj;
}


