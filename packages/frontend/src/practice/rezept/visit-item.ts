import type { Disease, HokenInfo, Meisai, Patient, Visit, VisitEx } from "myclinic-model";
import type { OnshiResult } from "onshi-result";
import type { 負担区分コードCode } from "./codes";
import type { SanteibiCount, SanteibiDate } from "./util";

export interface VisitItem {
  visit: Visit;
  hoken: HokenInfo;
  patient: Patient;
  onshiResult?: OnshiResult;
  meisai: Meisai;
  visitEx: VisitEx;
}

export interface DiseaseItem {
  disease: Disease;
  shuushokugoCodes: number[];
  isPrimary: boolean;
}

export interface ShinryoukouiItem {
  shinryouShubetsu: string;
  futanKubun: 負担区分コードCode;
  shinryoucode: number;
  tensuu?: number;
  count: number;
  santeibiInfo: Record<SanteibiDate, SanteibiCount>;
}

export interface TokuteikizaiItem {
  shinryouShubetsu: string;
  futanKubun: 負担区分コードCode;
  kizaicode: number;
  amount: number;
  tensuu?: number;
  count: number;
  santeibiInfo: Record<SanteibiDate, SanteibiCount>;

}
