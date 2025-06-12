import type { RP剤情報, 剤形レコード, 用法レコード, 用法補足レコード, 薬品情報 } from "@/lib/denshi-shohou/presc-info";

let serialId = 1;

export type Indexed = {
  id: number;
};


export function indexed<T>(t: T): T & Indexed {
  return Object.assign({}, t, { id: serialId++ });
}

export interface RP剤情報Indexed {
  剤形レコード: 剤形レコード;
  用法レコード: 用法レコード;
  用法補足レコード?: (用法補足レコード & Indexed)[];
  薬品情報グループ: (薬品情報& Indexed)[];
}

export function indexRP剤情報(info: RP剤情報): RP剤情報Indexed {
  return Object.assign({}, info, {
    用法補足レコード: info.用法補足レコード?.map(r => indexed(r)),
    薬品情報グループ: info.薬品情報グループ.map(g => indexed(g)),
  })
}
