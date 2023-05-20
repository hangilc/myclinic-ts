import type { Kouhi, Visit } from "myclinic-model";
import { is負担区分コードName, 診療識別コードvalues, 負担区分コード, type 負担区分コードCode } from "./codes";
import type { ShinryoukouiItem, VisitItem } from "./visit-item";

export function composeShinryoukouiItems(visitItems: VisitItem[], kouhiList: Kouhi[]): ShinryoukouiItem[] {
  const result: ShinryoukouiItem[] = [];
  visitItems.forEach(visitItem => {
    const date = visitItem.visit.visitedAt.substring(0, 10);
    visitItem.visitEx.shinryouList.forEach(shinryou => {
      const master = shinryou.master;
      const shinryouShubetsu = Math.floor(parseInt(master.shuukeisaki) / 10);
      if (!診療識別コードvalues.includes(shinryouShubetsu.toString())) {
        console.log("Unknown 診療識別コード", shinryouShubetsu);
      }
      const futanKubun = calcFutanKubun()
    })
  })
  return result;
}

function calcFutanKubun(hasHoken: boolean, visitKouhiIds: number[], kouhiIds: number[]): 負担区分コードCode {
  const kouhiParts: number[] = [];
  visitKouhiIds.forEach(visitKouhiId => {
    const index = kouhiIds.findIndex(e => e === visitKouhiId);
    if( index < 0 ){
      throw new Error("Cannot resolve 負担区分: " + visitKouhiId);
    }
    kouhiParts.push(index + 1);
  })
  const key = (hasHoken ? "H" : "") + kouhiParts.join("");
  if( is負担区分コードName(key) ){
    return 負担区分コード[key];
  } else {
    throw new Error("Invalid 負担区分コードNam: " + key);
  }
}