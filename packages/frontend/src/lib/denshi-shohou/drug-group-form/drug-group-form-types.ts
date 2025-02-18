import type { 薬品コード種別 } from "../denshi-shohou";

export interface DrugKind {
    薬品コード種別: 薬品コード種別;
    薬品コード: string;
    薬品名称: string;
    単位名: string;
}