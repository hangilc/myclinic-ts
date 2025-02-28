import type { PrescInfoData, RP剤情報, 剤形レコード, 用法レコード, 用法補足レコード, 薬品情報 } from "@/lib/denshi-shohou/presc-info";
import type { Shohousen } from "@/lib/shohousen/parse-shohousen";
import type { UsageMaster } from "myclinic-model";

export type Source = ({
  kind: "parsed";
  name: string;
  amount: string;
  usage: string;
  times: string | undefined;
} |
{
  kind: "denshi";
  剤形レコード: 剤形レコード;
  用法レコード: 用法レコード;
  用法補足レコード?: 用法補足レコード[];
  薬品情報: 薬品情報;
}) & { id: number, ippanmeiState: IppanmeiState };

export type TargetUsage = {
  kind: "master";
  master: UsageMaster;
} | {
  kind: "free-style";
  text: string;
}

export interface DrugGroupFormInitExtent {
  sourceDrugName?: string;
}

export type Mode = "edit-drug" | "new-drug" | "expire-date" | "bikou" | "joho";

export type Init = { kind: "parsed"; shohousen: Shohousen; template: PrescInfoData; }
| { kind: "denshi"; data: PrescInfoData };

export type IppanmeiState = {
  kind: "is-ippanmei"
} | {
  kind: "has-ippanemi",
  name: string,
  code: string,
};