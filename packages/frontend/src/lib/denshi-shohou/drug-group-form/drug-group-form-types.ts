import type { 薬品コード種別 } from "../denshi-shohou";

export type EditMode = "剤形区分" | "調剤数量" | "用法レコード" | "用法補足レコード" | "情報区分" | "薬剤種別" |
  "用量";

export interface DrugKind {
    薬品コード種別: 薬品コード種別;
    薬品コード: string;
    薬品名称: string;
    単位名: string;
}