import type { RP剤情報, 不均等レコード, 剤形レコード, 提供診療情報レコード, 検査値データ等レコード, 用法レコード, 用法補足レコード, 薬品レコード, 薬品情報, 薬品補足レコード, 薬品１回服用量レコード, 負担区分レコード } from "@/lib/denshi-shohou/presc-info";
import type { 用法補足区分 } from "../denshi-shohou/denshi-shohou";

let serialId = 1;

export interface 薬品補足レコードIndexed {
  id: number;
  薬品補足情報: string;
  isEditing: boolean;
  orig薬品補足情報: string;
}

export interface 薬品情報Indexed {
  id: number;
  薬品レコード: 薬品レコード;
  単位変換レコード?: string;
  不均等レコード?: 不均等レコード;
  負担区分レコード?: 負担区分レコード;
  薬品１回服用量レコード?: 薬品１回服用量レコード;
  薬品補足レコード?: 薬品補足レコードIndexed[];
}

export interface 用法補足レコードIndexed {
  id: number;
  用法補足区分?: 用法補足区分;
  用法補足情報: string;
  isEditing: boolean;
  orig: 用法補足レコード;
}

export interface RP剤情報Indexed {
  id: number;
  剤形レコード: 剤形レコード;
  用法レコード: 用法レコード;
  用法補足レコード?: 用法補足レコードIndexed[];
  薬品情報グループ: 薬品情報Indexed[];
}

export interface 提供診療情報レコードIndexed {
  id: number;
  薬品名称?: string;
  コメント: string;
  isEditing: boolean;
  orig: 提供診療情報レコード;
}

export interface 検査値データ等レコードIndexed {
  id: number;
  検査値データ等: string;
  isEditing: boolean;
  orig: 検査値データ等レコード;
}

export function index薬品補足レコード(obj: 薬品補足レコード): 薬品補足レコードIndexed {
  return {
    id: serialId++,
    薬品補足情報: obj.薬品補足情報,
    isEditing: obj.薬品補足情報 === "" ? true : false,
    orig薬品補足情報: obj.薬品補足情報,
  }
}

export function index薬品情報(obj: 薬品情報): 薬品情報Indexed {
  return Object.assign({}, obj, {
    id: serialId++,
    薬品補足レコード: obj.薬品補足レコード?.map(a => index薬品補足レコード(a)),
  });
}

export function index用法補足レコード(obj: 用法補足レコード): 用法補足レコードIndexed {
  return {
    id: serialId++,
    用法補足区分: obj.用法補足区分,
    用法補足情報: obj.用法補足情報,
    isEditing: obj.用法補足情報 === "",
    orig: obj,
  }
}

export function indexRP剤情報(obj: RP剤情報): RP剤情報Indexed {
  return Object.assign({}, obj, {
    id: serialId++,
    用法補足レコード: obj.用法補足レコード?.map(a => index用法補足レコード(a)),
    薬品情報グループ: obj.薬品情報グループ.map(a => index薬品情報(a)),
  });
}

export function unindex薬品補足レコード(obj: 薬品補足レコードIndexed): 薬品補足レコード {
  return { 薬品補足情報: obj.薬品補足情報 };
}

export function unindex薬品情報(obj: 薬品情報Indexed): 薬品情報 {
  const { id, ...rest} = obj;
  return {
    ...rest,
    薬品補足レコード: obj.薬品補足レコード?.map(a => unindex薬品補足レコード(a)),
  };
}

export function unindex用法補足レコード(obj: 用法補足レコードIndexed): 用法補足レコード {
  const { id, ...rest } = obj;
  return rest;
}

export function unindexRP剤情報(obj: RP剤情報Indexed): RP剤情報 {
  const { id, ...rest } = obj;
  return {
    ...rest,
    用法補足レコード: obj.用法補足レコード?.map(a => unindex用法補足レコード(a)),
    薬品情報グループ: obj.薬品情報グループ.map(a => unindex薬品情報(a)),
  };
}

export function index提供診療情報レコード(obj: 提供診療情報レコード): 提供診療情報レコードIndexed {
  return {
    id: serialId++,
    薬品名称: obj.薬品名称,
    コメント: obj.コメント,
    isEditing: obj.コメント === "",
    orig: obj,
  };
}

export function index検査値データ等レコード(obj: 検査値データ等レコード): 検査値データ等レコードIndexed {
  return {
    id: serialId++,
    検査値データ等: obj.検査値データ等,
    isEditing: obj.検査値データ等 === "",
    orig: obj,
  };
}

export function unindex提供診療情報レコード(obj: 提供診療情報レコードIndexed): 提供診療情報レコード {
  return {
    薬品名称: obj.薬品名称,
    コメント: obj.コメント,
  };
}

export function unindex検査値データ等レコード(obj: 検査値データ等レコードIndexed): 検査値データ等レコード {
  return {
    検査値データ等: obj.検査値データ等,
  };
}



