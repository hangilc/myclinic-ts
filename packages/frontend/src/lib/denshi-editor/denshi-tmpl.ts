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
import type { Shohou } from "@/lib/parse-shohou";
import { DateWrapper } from "myclinic-util";

let serialId = 1;

export interface TopTmpl {
  orig: {
    kind: "denshi";
    data: PrescInfoData;
  } | {
    kind: "none";
    visitId: number;
  };
  使用期限年月日: string | undefined;
  備考レコード: 備考レコードTmpl[];
  提供診療情報レコード: 提供診療情報レコードTmpl[];
  検査値データ等レコード: 検査値データ等レコードTmpl[];
}

export function createTopTmplFromShohou(shohou: Shohou, visitId: number): TopTmpl {
  return {
    orig: { kind: "none", visitId },
    使用期限年月日: get使用期限年月日FromShohou(shohou),
    備考レコード: get備考レコードFromShohou(shohou).map(tmpl備考レコード),
    提供診療情報レコード: get提供診療情報レコードFromShohou(shohou).map(tmpl提供診療情報レコード),
    検査値データ等レコード: get検査値データ等レコードFromShohou(shohou).map(tmpl検査値データ等レコード),
  }
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

export function get使用期限年月日FromShohou(shohou: Shohou): string | undefined {
  let kigen = shohou.kigen;
  if (kigen) {
    return DateWrapper.from(kigen).asOnshiDate();
  } else {
    return undefined;
  }
}

function tmpl備考レコード(備考レコード: 備考レコード): 備考レコードTmpl {
  return Object.assign({}, 備考レコード, { id: serialId++ });
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

function tmpl提供診療情報レコード(提供診療情報レコード: 提供診療情報レコード): 提供診療情報レコードTmpl {
  return Object.assign({}, 提供診療情報レコード, { id: serialId++ });
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

function tmpl検査値データ等レコード(検査値データ等レコード: 検査値データ等レコード): 検査値データ等レコードTmpl {
  return Object.assign({}, 検査値データ等レコード, { id: serialId++ });
}

export function get検査値データ等レコードFromShohou(shohou: Shohou): 検査値データ等レコード[] {
  return [];
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

// export interface 薬品情報Tmpl {
//   id: number;
//   isEditing: boolean;
//   薬品レコード: 薬品レコード;
//   不均等レコード?: 不均等レコード;
//   負担区分レコード?: 負担区分レコード;
//   薬品１回服用量レコード?: 薬品１回服用量レコード;
//   薬品補足レコード?: 薬品補足レコード[];
// }