import { 診療識別コードName, 負担区分コードCode } from "codes";
import { HokenCollection, futanKubunCodeByHokenCollection } from "hoken-collector";
import { Hokensha, RezeptKouhi } from "rezept-types";

export interface CalcItem {
  ten: number;
  count: number;
}

export const CalcItemObject = {
  totalTenOf(item: CalcItem): number {
    return item.ten * item.count;
  }
}

