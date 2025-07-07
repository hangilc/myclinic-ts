import type {
  剤形区分,
  力価フラグ,
  情報区分,
  用法補足区分,
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
import type { Drug, DrugGroup, Shohou } from "@/lib/parse-shohou";
import { DateWrapper } from "myclinic-util";
import { initPrescInfoDataFromVisitId } from "../denshi-shohou/visit-shohou";
import { toHankaku } from "@/lib/zenkaku";

let serialId = 1;

export class DenshiWrapper {
  data: PrescInfoData;
  備考レコード: 備考レコードWrapper[];
  提供診療情報レコード: 提供診療情報レコードWrapper[];
  検査値データ等レコード: 検査値データ等レコードWrapper[];
  RP剤情報グループ: RP剤情報Wrapper[];

  constructor(data: PrescInfoData) {
    this.data = data;
    this.備考レコード = [];
    this.提供診療情報レコード = [];
    this.検査値データ等レコード = [];
    this.RP剤情報グループ = [];
  }

  static async fromShohou(
    shohou: Shohou,
    visitId: number
  ): Promise<DenshiWrapper> {
    const prescInfo = await initPrescInfoDataFromVisitId(visitId);
    prescInfo.使用期限年月日 = get使用期限年月日FromShohou(shohou);
    const self = new DenshiWrapper(prescInfo);
    self.備考レコード = get備考レコードFromShohou(shohou).map(
      (r) => new 備考レコードWrapper(r)
    );
    self.提供診療情報レコード = get提供診療情報レコードFromShohou(shohou).map(
      (r) => new 提供診療情報レコードWrapper(r)
    );
    self.検査値データ等レコード = get検査値データ等レコードFromShohou(
      shohou
    ).map((r) => new 検査値データ等レコードWrapper(r));
    self.RP剤情報グループ = shohou.groups.map(g => new RP剤情報Wrapper(getRP剤情報FromGroup(g)));
    return self;
  }

  toPrescInfoData(): PrescInfoData {
    return Object.assign({}, this.data, {
      備考レコード: this.備考レコード.map((r) => r.data),
      提供情報レコード: create提供情報レコード(this.提供診療情報レコード, this.検査値データ等レコード),
    });
  }
}

function create提供情報レコード(
  提供診療情報レコード: 提供診療情報レコードWrapper[],
  検査値データ等レコード: 検査値データ等レコードWrapper[]
): 提供情報レコード | undefined {
  let a: 提供診療情報レコード[] = 提供診療情報レコード.map(r => r.data);
  let b: 検査値データ等レコード[] = 検査値データ等レコード.map(r => r.data);
  if( a.length === 0 && b.length === 0 ){
    return undefined;
  } else {
    return {
      提供診療情報レコード: a,
      検査値データ等レコード: b,
    }
  }
}

export class 備考レコードWrapper {
  id: number;
  data: 備考レコード;

  constructor(data: 備考レコード) {
    this.id = serialId++;
    this.data = data;
  }
}

export class 提供診療情報レコードWrapper {
  id: number;
  data: 提供診療情報レコード;

  constructor(data: 提供診療情報レコード) {
    this.id = serialId++;
    this.data = data;
  }
}

export class 検査値データ等レコードWrapper {
  id: number;
  data: 検査値データ等レコード;

  constructor(data: 検査値データ等レコード) {
    this.id = serialId++;
    this.data = data;
  }
}

export interface TopTmpl {
  orig:
    | {
        kind: "denshi";
        data: PrescInfoData;
      }
    | {
        kind: "none";
        visitId: number;
      };
  使用期限年月日: string | undefined;
  備考レコード: 備考レコードTmpl[];
  提供診療情報レコード: 提供診療情報レコードTmpl[];
  検査値データ等レコード: 検査値データ等レコードTmpl[];
}

export interface 備考レコードTmpl {
  id: number;
  備考: string;
}

export interface 提供診療情報レコードTmpl {
  id: number;
  薬品名称?: string;
  コメント: string;
}

export interface 検査値データ等レコードTmpl {
  id: number;
  検査値データ等: string;
}

export function get使用期限年月日FromShohou(
  shohou: Shohou
): string | undefined {
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
        bikou.push({ 備考: "一包化" });
      }
    }
  }
  return bikou;
}

export function get提供診療情報レコードFromShohou(
  shohou: Shohou
): 提供診療情報レコード[] {
  let 提供診療情報レコード: 提供診療情報レコード[] = [];
  if (shohou.comments) {
    for (let c of shohou.comments) {
      if (c === "一包化") {
        continue;
      } else {
        提供診療情報レコード.push({ コメント: c });
      }
    }
  }
  return 提供診療情報レコード;
}

export function get検査値データ等レコードFromShohou(
  shohou: Shohou
): 検査値データ等レコード[] {
  return [];
}

export class RP剤情報Wrapper {
  id: number;
  data: RP剤情報;
  用法補足レコード: 用法補足レコードWrapper[];
  薬品情報グループ: 薬品情報Wrapper[];

  constructor(data: RP剤情報) {
    this.id = serialId++;
    this.data = data;
    this.用法補足レコード = [];
    this.薬品情報グループ = [];
  }
}

export class 用法補足レコードWrapper {
  id: number;
  data: 用法補足レコード;

  constructor(data: 用法補足レコード) {
    this.id = serialId++;
    this.data = data;
  }
}

export class 薬品情報Wrapper {
  id: number;
  data: 薬品情報;
  薬品補足レコード: 薬品補足レコードWrapper[];

  constructor(data: 薬品情報) {
    this.id = serialId++;
    this.data = data;
    this.薬品補足レコード = [];
  }
}

export class 薬品補足レコードWrapper {
  id: number;
  data: 薬品補足レコード;

  constructor(data: 薬品補足レコード) {
    this.id = serialId++;
    this.data = data;
  }
}

function getRP剤情報FromGroup(group: DrugGroup): RP剤情報 {
  return {

  }
}

// export interface RP剤情報Tmpl {
//   id: number;
//   isEditing: boolean;
//   剤形区分: 剤形区分;
//   調剤数量: number;
//   用法コード: string;
//   用法名称: string;
//   用法補足レコード: 用法補足レコードTmpl[];
//   薬品情報グループ: 薬品情報Tmpl[];
// }

// export interface 用法補足レコードTmpl {
//   id: number;
//   isEditing: boolean;
//   用法補足区分?: 用法補足区分;
//   用法補足情報: string;
// }

function get剤形区分FromGroup(group: DrugGroup): 剤形区分 {
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

// export interface 薬品情報Tmpl {
//   id: number;
//   isEditing: boolean;
//   薬品レコード: 薬品レコード;
//   不均等レコード?: 不均等レコード;
//   負担区分レコード?: 負担区分レコード;
//   薬品１回服用量レコード?: 薬品１回服用量レコード;
//   薬品補足レコード?: 薬品補足レコード[];
// }

function get薬品情報FromDrug(drug: Drug): 薬品情報 {
  return {
    不均等レコード: get不均等レコードFromDrug(drug),
    薬品補足レコード: get薬品補足レコードFromDrug(drug),
  }
}

function get不均等レコードFromDrug(drug: Drug): 不均等レコード | undefined {
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

function get薬品補足レコードFromDrug(drug: Drug): 薬品補足レコード[] | undefined {
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