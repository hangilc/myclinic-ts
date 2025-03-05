import type { 剤形区分, 情報区分 } from "./denshi-shohou";
import type { IppanmeiState } from "./denshi-shohou-form/denshi-shohou-form-types";
import type { DrugKind } from "./drug-group-form/drug-group-form-types";
import type { 不均等レコード, 用法レコード, 用法補足レコード, 薬品レコード, 薬品補足レコード, 負担区分レコード } from "./presc-info";

export interface DrugGroupFormInit {
  剤形区分?: 剤形区分;
  調剤数量?: number;
  用法レコード?: 用法レコード;
  用法補足レコード?: 用法補足レコード[];
  薬品レコード?: 薬品レコード;
  不均等レコード?: 不均等レコード;
  負担区分レコード?: 負担区分レコード;
  薬品補足レコード?: 薬品補足レコード[];
  drugKind?: DrugKind;
  iyakuhinSearchText?: string;
  amount?: number;
  ippanmeiState?: IppanmeiState;
}