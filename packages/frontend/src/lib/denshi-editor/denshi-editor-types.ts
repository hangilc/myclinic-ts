import type { RP剤情報, 不均等レコード, 剤形レコード, 用法レコード, 用法補足レコード, 薬品レコード, 薬品情報, 薬品補足レコード, 薬品１回服用量レコード, 負担区分レコード } from "@/lib/denshi-shohou/presc-info";

let serialId = 1;

export type Indexed = {
  id: number;
};


export function indexed<T>(t: T): T & Indexed {
  return Object.assign({}, t, { id: serialId++ });
}

export interface 薬品情報Indexed {
  id: number;
  薬品レコード: 薬品レコード;
  単位変換レコード?: string;
  不均等レコード?: 不均等レコード;
  負担区分レコード?: 負担区分レコード;
  薬品１回服用量レコード?: 薬品１回服用量レコード;
  薬品補足レコード?: (薬品補足レコード & Indexed)[];
}

export function index薬品情報(joho: 薬品情報): 薬品情報Indexed {
  return Object.assign({}, joho, {
    id: serialId++,
    薬品補足レコード: joho.薬品補足レコード?.map(r => indexed(r))
  })
}

export interface RP剤情報Indexed {
  id: number;
  剤形レコード: 剤形レコード;
  用法レコード: 用法レコード;
  用法補足レコード?: (用法補足レコード & Indexed)[];
  薬品情報グループ: 薬品情報Indexed[];
}

export function indexRP剤情報(info: RP剤情報): RP剤情報Indexed {
  return Object.assign({}, info, {
    id: serialId++,
    用法補足レコード: info.用法補足レコード?.map(r => indexed(r)),
    薬品情報グループ: info.薬品情報グループ.map(g => index薬品情報(g)),
  })
}

