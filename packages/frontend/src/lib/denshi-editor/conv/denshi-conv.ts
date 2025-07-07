import type {
  剤形区分,
  力価フラグ,
  情報区分,
} from "@/lib/denshi-shohou/denshi-shohou";
import type {
  PrescInfoData,
  RP剤情報,
  不均等レコード,
  備考レコード,
  剤形レコード,
  提供情報レコード,
  提供診療情報レコード,
  検査値データ等レコード,
  用法レコード,
  用法補足レコード,
  薬品レコード,
  薬品情報,
  薬品補足レコード,
} from "@/lib/denshi-shohou/presc-info";
import type { 薬品コード種別 } from "@/lib/denshi-shohou/denshi-shohou";
import { initPrescInfoDataFromVisitId } from "@/lib/denshi-shohou/visit-shohou";
import type { Drug, DrugGroup, Shohou } from "@/lib/parse-shohou";
import { toHankaku } from "@/lib/zenkaku";
import { DateWrapper } from "myclinic-util";
import type { IyakuhinMaster, KizaiMaster } from "myclinic-model";
import { index備考レコード, type 備考レコードIndexed, type 提供診療情報レコードIndexed } from "../denshi-editor-types";

// export interface PrescInfoData {
//   医療機関コード種別: 点数表;
//   医療機関コード: string;
//   医療機関都道府県コード: 都道府県コード;
//   医療機関名称: string;
//   医療機関郵便番号?: string;
//   医療機関所在地: string;
//   医療機関電話番号: string;
//   ＦＡＸ番号?: string;
//   その他連絡先?: string;
//   診療科レコード?: {
//     診療科コード種別: 診療科コード種別;
//     診療科コード: 診療科コード;
//   },
//   医師コード?: string;
//   医師カナ氏名?: string;
//   医師漢字氏名: string; // 姓と名は全角スペースで区切る。
//   患者コード?: string;
//   患者漢字氏名: string; // 性と名は全角スペースで区切る。
//   患者カナ氏名: string; // 半角カナで記録する。姓と名は半角スペースで区切る。
//   患者性別: 性別コード;
//   患者生年月日: string;
//   保険一部負担金区分?: 保険一部負担金区分コード;
//   保険種別?: 保険種別コード;
//   保険者番号: string;
//   被保険者証記号?: string;
//   被保険者証番号: string;
//   被保険者被扶養者: 被保険者等種別;
//   被保険者証枝番?: string;
//   負担割合?: number; // 患者負担割合
//   職務上の事由?: 職務上の事由コード;
//   第一公費レコード?: 公費レコード;
//   第二公費レコード?: 公費レコード;
//   第三公費レコード?: 公費レコード;
//   特殊公費レコード?: 公費レコード;
//   レセプト種別コード?: string;
//   処方箋交付年月日: string;
//   使用期限年月日?: string;
//   麻薬施用レコード?: 麻薬施用レコード;
//   残薬確認対応フラグ?: 残薬確認対応フラグ;
//   備考レコード?: 備考レコード[];
//   引換番号?: string;
//   RP剤情報グループ: RP剤情報[];
//   提供情報レコード?: 提供情報レコード;
// }

// export interface 提供情報レコード {
//   提供診療情報レコード?: 提供診療情報レコード[];
//   検査値データ等レコード?: 検査値データ等レコード[];
// }

// export interface 提供診療情報レコード {
//   薬品名称?: string;
//   コメント: string;
// }

// export interface 検査値データ等レコード {
//   検査値データ等: string;
// }

export function get使用期限年月日FromShohou(shohou: Shohou): string | undefined {
  let kigen = shohou.kigen;
  if (kigen) {
    return DateWrapper.from(kigen).asOnshiDate();
  } else {
    return undefined;
  }
}

export function get備考レコードFromShohou(shohou: Shohou): 備考レコード[] {
  let bikou: 備考レコード[] = [];
  for (let b of shohou.bikou) {
    if (b === "高７" || b === "高８" || b === "高９") {
      continue;
    }
    bikou.push({ 備考: b });
  }
  if (shohou.comments) {
    for (let c of shohou.comments) {
      if (c === "一包化") {
        bikou.push({ 備考: "一包化", });
      }
    }
  }
  return bikou;
}

export function get提供診療情報レコードFromShohou(shohou: Shohou): 提供診療情報レコード[] {
  let 提供診療情報レコード: 提供診療情報レコード[] = [];
  if (shohou.comments) {
    for (let c of shohou.comments) {
      if (c === "一包化") {
        continue;
      } else {
        提供診療情報レコード.push({ コメント: c, });
      }
    }
  }
  return 提供診療情報レコード;
}

export function get検査値データ等レコードFromShohou(shohou: Shohou): 検査値データ等レコード[] {
  return [];
}


export interface ConvData1 {
  使用期限年月日?: string;
  備考レコード?: 備考レコード[];
  提供情報レコード?: 提供情報レコード;
}

export async function createPrescInfo(
  visitId: number,
  data1: ConvData1,
  RP剤情報グループ: RP剤情報[]
): Promise<PrescInfoData> {
  const result = await initPrescInfoDataFromVisitId(visitId);
  Object.assign(result, data1, { RP剤情報グループ });
  return result;
}

export function getConvData1(shohou: Shohou): ConvData1 {
  let kigen: string | undefined = undefined;
  if (shohou.kigen) {
    kigen = DateWrapper.from(shohou.kigen).asSqlDate().replaceAll(/-/g, "");
  }
  let bikou: 備考レコード[] = [];
  for (let b of shohou.bikou) {
    if (b === "高７" || b === "高８" || b === "高９") {
      continue;
    }
    bikou.push({ 備考: b });
  }
  let 提供診療情報レコード: 提供診療情報レコード[] = [];
  if (shohou.comments) {
    for (let c of shohou.comments) {
      if (c === "一包化") {
        bikou.push({
          備考: "一包化",
        });
      } else {
        提供診療情報レコード.push({
          コメント: c,
        });
      }
    }
  }
  let 提供情報レコード: 提供情報レコード | undefined = undefined;
  if (提供診療情報レコード.length > 0) {
    提供情報レコード = {
      提供診療情報レコード,
    };
  }

  return {
    使用期限年月日: kigen,
    備考レコード: bikou.length === 0 ? undefined : bikou,
    提供情報レコード,
  };
}

// export interface RP剤情報 {
//   剤形レコード: 剤形レコード;
//   用法レコード: 用法レコード;
//   用法補足レコード?: 用法補足レコード[];
//   薬品情報グループ: 薬品情報[];
// }

// export interface 剤形レコード {
//   剤形区分: 剤形区分;
//   剤形名称?: string;
//   調剤数量: number;
// }

// export interface 用法レコード {
//   用法コード: string;
//   用法名称: string;
//   用法１日回数?: number;
// }

// export const 用法レコードObject = {
//   isEqual(a: 用法レコード, b: 用法レコード): boolean {
//     return a.用法コード == b.用法コード &&
//       a.用法名称 === b.用法コード &&
//       a.用法１日回数 == b.用法１日回数;
//   }
// }

// export interface 用法補足レコード {
//   用法補足区分?: 用法補足区分;
//   用法補足情報: string;
// }

function extract剤形区分FromGroup(group: DrugGroup): 剤形区分 {
  // Most frequent case
  if (group.usage.kind === "days") {
    return "内服";
  }

  // Check usage pattern first
  if (group.usage.kind === "times") {
    // Times-based usage typically indicates 頓服 (as needed)
    return "頓服";
  }

  // Check drug names and units for external use indicators
  for (const drug of group.drugs) {
    const name = drug.name.toLowerCase();
    const unit = drug.unit.toLowerCase();

    // External use (外用) indicators
    if (
      name.includes("軟膏") ||
      name.includes("クリーム") ||
      name.includes("ローション") ||
      name.includes("湿布") ||
      name.includes("シール") ||
      name.includes("貼付") ||
      name.includes("点眼") ||
      name.includes("点鼻") ||
      name.includes("吸入") ||
      name.includes("うがい") ||
      name.includes("外用") ||
      name.includes("塗布") ||
      unit.includes("g") ||
      (unit.includes("ml") && (name.includes("点眼") || name.includes("点鼻")))
    ) {
      return "外用";
    }

    // Injectable (注射) indicators
    if (
      name.includes("注射") ||
      name.includes("注入") ||
      name.includes("静注") ||
      name.includes("筋注") ||
      name.includes("皮下注") ||
      unit.includes("バイアル") ||
      unit.includes("アンプル")
    ) {
      return "注射";
    }

    // Liquid internal use (内服滴剤) indicators
    if (
      (name.includes("内服液") ||
        name.includes("シロップ") ||
        name.includes("滴剤")) &&
      unit.includes("ml")
    ) {
      return "内服滴剤";
    }
  }

  // Fallback to unknown
  return "不明";
}

function extract調剤数量FromGroup(group: DrugGroup): number {
  const usage = group.usage;

  // For days-based prescriptions, return the number of days
  if (usage.kind === "days") {
    const days = parseInt(toHankaku(usage.days));
    if (isNaN(days)) {
      throw new Error(`Invalid days value: ${usage.days}`);
    }
    return days;
  }

  // For times-based prescriptions (頓服), return the number of times
  if (usage.kind === "times") {
    const times = parseInt(toHankaku(usage.times));
    if (isNaN(times)) {
      throw new Error(`Invalid times value: ${usage.times}`);
    }
    return times;
  }

  return 1;
}

function extract用法補足レコードFromGroup(group: DrugGroup): 用法補足レコード[] {
  let 用法補足レコード: 用法補足レコード[] = [];
  for (let c of group.groupComments) {
    用法補足レコード.push({
      用法補足情報: c,
    });
  }
  return 用法補足レコード;
}


export interface ConvData2 {
  剤形レコード: 剤形レコード;
  用法補足レコード?: 用法補足レコード[];
}

export function createRP剤情報(
  data: ConvData2,
  用法レコード: 用法レコード,
  薬品情報グループ: 薬品情報[]
): RP剤情報 {
  return Object.assign({}, data, { 用法レコード, 薬品情報グループ });
}

export function getConvData2(group: DrugGroup): ConvData2 {
  let 剤形区分: 剤形区分 = get剤形区分(group);
  let 調剤数量: number = get調剤数量(group);
  let 用法補足レコード: 用法補足レコード[] = get用法補足レコード(group);
  return {
    剤形レコード: {
      剤形区分,
      調剤数量,
    },
    用法補足レコード:
      用法補足レコード.length === 0 ? undefined : 用法補足レコード,
  };
}

function get剤形区分(group: DrugGroup): 剤形区分 {
  // Most frequent case
  if (group.usage.kind === "days") {
    return "内服";
  }

  // Check usage pattern first
  if (group.usage.kind === "times") {
    // Times-based usage typically indicates 頓服 (as needed)
    return "頓服";
  }

  // Check drug names and units for external use indicators
  for (const drug of group.drugs) {
    const name = drug.name.toLowerCase();
    const unit = drug.unit.toLowerCase();

    // External use (外用) indicators
    if (
      name.includes("軟膏") ||
      name.includes("クリーム") ||
      name.includes("ローション") ||
      name.includes("湿布") ||
      name.includes("シール") ||
      name.includes("貼付") ||
      name.includes("点眼") ||
      name.includes("点鼻") ||
      name.includes("吸入") ||
      name.includes("うがい") ||
      name.includes("外用") ||
      name.includes("塗布") ||
      unit.includes("g") ||
      (unit.includes("ml") && (name.includes("点眼") || name.includes("点鼻")))
    ) {
      return "外用";
    }

    // Injectable (注射) indicators
    if (
      name.includes("注射") ||
      name.includes("注入") ||
      name.includes("静注") ||
      name.includes("筋注") ||
      name.includes("皮下注") ||
      unit.includes("バイアル") ||
      unit.includes("アンプル")
    ) {
      return "注射";
    }

    // Liquid internal use (内服滴剤) indicators
    if (
      (name.includes("内服液") ||
        name.includes("シロップ") ||
        name.includes("滴剤")) &&
      unit.includes("ml")
    ) {
      return "内服滴剤";
    }
  }

  // Fallback to unknown
  return "不明";
}

function get調剤数量(group: DrugGroup): number {
  const usage = group.usage;

  // For days-based prescriptions, return the number of days
  if (usage.kind === "days") {
    const days = parseInt(toHankaku(usage.days));
    if (isNaN(days)) {
      throw new Error(`Invalid days value: ${usage.days}`);
    }
    return days;
  }

  // For times-based prescriptions (頓服), return the number of times
  if (usage.kind === "times") {
    const times = parseInt(toHankaku(usage.times));
    if (isNaN(times)) {
      throw new Error(`Invalid times value: ${usage.times}`);
    }
    return times;
  }

  return 1;
}

function get用法補足レコード(group: DrugGroup): 用法補足レコード[] {
  let 用法補足レコード: 用法補足レコード[] = [];
  for (let c of group.groupComments) {
    用法補足レコード.push({
      用法補足情報: c,
    });
  }
  return 用法補足レコード;
}

// export interface 薬品情報 {
//   薬品レコード: 薬品レコード;
//   単位変換レコード?: string;
//   不均等レコード?: 不均等レコード;
//   負担区分レコード?: 負担区分レコード;
//   薬品１回服用量レコード?: 薬品１回服用量レコード;
//   薬品補足レコード?: 薬品補足レコード[];
// }

export interface ShohouExtract {
  使用期限年月日?: string;
  備考レコード: 備考レコード[];
  提供診療情報レコード: 提供診療情報レコード[];
  RP剤情報Extract: RP剤情報Extract[];
}

export interface 薬品情報Extract {
  薬品名称: string;
  分量: string;
  単位名: string;
}

export interface RP剤情報Extract {
  剤形区分: 剤形区分;
  調剤数量: number;
  用法コード: string;
  用法名称: string;
  用法補足レコード: 用法補足レコードIndexed[];
  薬品情報グループ: 薬品情報Extract[];
}

function extract薬品情報FromDrug(drug: Drug): 薬品情報Extract {
  return {
    薬品名称: drug.name,
    分量: drug.amount,
    単位名: drug.unit,
  }
}

function extractRP剤情報(group: DrugGroup): RP剤情報Extract {
  return {
    剤形区分: extract剤形区分FromGroup(group),
    調剤数量: extract調剤数量FromGroup(group),
    用法コード: "",
    用法名称: group.usage.usage,
    用法補足レコード: extract用法補足レコードFromGroup(group),
    薬品情報グループ: group.drugs.map(extract薬品情報FromDrug),
  }
}

export function extractShohou(shohou: Shohou): ShohouExtract {
  return {
    使用期限年月日: get使用期限年月日FromShohou(shohou),
    備考レコード: get備考レコードFromShohou(shohou),
    提供診療情報レコード: get提供診療情報レコードFromShohou(shohou),
    RP剤情報Extract: shohou.groups.map(extractRP剤情報),
  }
}

export interface ShohouConv {
  使用期限年月日?: string;
  備考レコード: 備考レコードIndexed[];
  提供診療情報レコード: 提供診療情報レコードIndexed[];
  RP剤情報Extract: RP剤情報Extract[];
}


export interface ConvData3 {
  不均等レコード?: 不均等レコード;
  薬品補足レコード?: 薬品補足レコード[];
}

export function create薬品情報(
  data: ConvData3,
  薬品レコード: 薬品レコード
): 薬品情報 {
  return Object.assign({}, data, {
    薬品レコード,
  });
}

export function getConvData3(drug: Drug): ConvData3 {
  return {
    不均等レコード: get不均等レコード(drug),
    薬品補足レコード: get薬品補足レコード(drug),
  };
}

function get不均等レコード(drug: Drug): 不均等レコード | undefined {
  if (drug.uneven) {
    let uneven = drug.uneven;
    uneven = uneven.replace(/^\s*[(（]/, "");
    uneven = uneven.replace(/[)）]\s*$/, "");
    let sep = /\s*[-ー－]\s*/;
    const unevenParts = uneven.split(sep);
    if (unevenParts.length >= 2) {
      const 不均等レコード: 不均等レコード = {
        不均等１回目服用量: toHankaku(unevenParts[0]),
        不均等２回目服用量: toHankaku(unevenParts[1]),
        不均等３回目服用量: unevenParts[2]
          ? toHankaku(unevenParts[2].trim())
          : undefined,
        不均等４回目服用量: unevenParts[3]
          ? toHankaku(unevenParts[3].trim())
          : undefined,
        不均等５回目服用量: unevenParts[4]
          ? toHankaku(unevenParts[4].trim())
          : undefined,
      };
      return 不均等レコード;
    } else throw new Error("uneven record has less than two parts.");
  } else {
    undefined;
  }
}

function get薬品補足レコード(drug: Drug): 薬品補足レコード[] | undefined {
  let 薬品補足レコード: 薬品補足レコード[] = [];
  if (drug.senpatsu) {
    let 薬品補足情報: string;
    switch (drug.senpatsu) {
      case "henkoufuka":
        薬品補足情報 = "後発品変更不可";
        break;
      case "kanjakibou":
        薬品補足情報 = "先発医薬品患者希望";
        break;
      default:
        throw new Error(`Unknown senpatsu type: ${drug.senpatsu}`);
    }
    薬品補足レコード.push({ 薬品補足情報 });
  }
  if (drug.drugComments) {
    for (const comment of drug.drugComments) {
      薬品補足レコード.push({ 薬品補足情報: comment });
    }
  }
  return 薬品補足レコード.length === 0 ? undefined : 薬品補足レコード;
}

// export interface 薬品レコード {
//   情報区分: 情報区分;
//   薬品コード種別: 薬品コード種別;
//   薬品コード: string;
//   薬品名称: string;
//   分量: string;
//   力価フラグ: 力価フラグ;
//   単位名: string;
// }

export interface ConvData4 {
  分量: string;
  力価フラグ: 力価フラグ;
}

export function getConvData4(drug: Drug): ConvData4 {
  let src = drug.amount;
  src = toHankaku(src);
  if (src.startsWith("1回")) {
    src = src.replace(/^1回/, "");
  }
  let amount = Number(toHankaku(src));
  if (isNaN(amount)) {
    throw new Error(`invalid amount: ${drug.amount}`);
  }
  return {
    分量: amount.toString(),
    力価フラグ: "薬価単位",
  };
}

export interface ConvAux4 {
  情報区分: 情報区分;
  薬品コード種別: 薬品コード種別;
  薬品コード: string;
  薬品名称: string;
  単位名: string;
}

export function create薬品レコード(data: ConvData4, aux: ConvAux4): 薬品レコード {
  let { 情報区分, 薬品コード種別, 薬品コード, 薬品名称, 単位名 } = aux;
  return Object.assign({}, data, {
    情報区分,
    薬品コード種別,
    薬品コード,
    薬品名称,
    単位名,
  });
}

export function createConvData4DepsFromIyakuhinMaster(master: IyakuhinMaster): {
  情報区分: 情報区分;
  薬品コード種別: 薬品コード種別;
  薬品コード: string;
  薬品名称: string;
  単位名: string;
} {
  return {
    情報区分: "医薬品",
    薬品コード種別: "レセプト電算処理システム用コード" as const,
    薬品コード: master.iyakuhincode.toString(),
    薬品名称: master.name,
    単位名: master.unit,
  };
}

export function createConvData4DepsFromIyakuhinMasterIppanmei(
  master: IyakuhinMaster
): {
  情報区分: 情報区分;
  薬品コード種別: 薬品コード種別;
  薬品コード: string;
  薬品名称: string;
  単位名: string;
} {
  if (!master.ippanmei || !master.ippanmeicode) {
    throw new Error(`has no ippanmei: (${master.iyakuhincode}) ${master.name}`);
  }
  return {
    情報区分: "医薬品",
    薬品コード種別: "一般名コード",
    薬品コード: master.ippanmeicode.toString(),
    薬品名称: master.ippanmei,
    単位名: master.unit,
  };
}

export function createConvData4DepsFromKizaiMaster(master: KizaiMaster): {
  情報区分: 情報区分;
  薬品コード種別: 薬品コード種別;
  薬品コード: string;
  薬品名称: string;
  単位名: string;
} {
  return {
    情報区分: "医療材料",
    薬品コード種別: "レセプト電算処理システム用コード",
    薬品コード: master.kizaicode.toString(),
    薬品名称: master.name,
    単位名: master.unit,
  };
}
