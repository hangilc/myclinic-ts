import type { Disease, HokenInfo, Meisai, Patient, Visit, VisitEx } from "myclinic-model";
import type { OnshiResult } from "onshi-result";
import type { 症状詳記区分コードCode, 負担区分コードCode } from "./codes";
import type { SanteibiCount, SanteibiDate } from "./util";

export interface CommentItem {
  shikibetsucode?: string;
  commentcode: number;
  text: string;
}

export interface ShoujouhoukiItem {
  kubun: 症状詳記区分コードCode;
  text: string;
}

export interface VisitItem {
  visit: Visit;
  hoken: HokenInfo;
  patient: Patient;
  onshiResult?: OnshiResult;
  meisai: Meisai;
  visitEx: VisitEx;
  comments: CommentItem[];
  shoukiList: ShoujouhoukiItem[];
}

export interface DiseaseItem {
  disease: Disease;
  shuushokugoCodes: number[];
  isPrimary: boolean;
}

// export interface ShinryoukouiItem {
//   shikibetsucode: string;
//   futanKubun: 負担区分コードCode;
//   shinryoucode: number;
//   tensuu?: number;
//   count: number;
//   santeibiInfo: Record<SanteibiDate, SanteibiCount>;
// }

export interface IyakuhinItem {
  shikibetsucode: string;
  futanKubun: 負担区分コードCode;
  iyakuhincode: number;
  amount: number;
  tensuu?: number;
  count: number;
  santeibiInfo: Record<SanteibiDate, SanteibiCount>;
}

export interface TokuteikizaiItem {
  shikibetsucode: string;
  futanKubun: 負担区分コードCode;
  kizaicode: number;
  amount: number;
  tensuu?: number;
  count: number;
  santeibiInfo: Record<SanteibiDate, SanteibiCount>;
}
