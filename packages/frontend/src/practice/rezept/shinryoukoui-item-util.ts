import type { Kouhi, Visit } from "myclinic-model";
import { is負担区分コードName, 診療識別コードvalues, 負担区分コード, type 負担区分コードCode } from "./codes";
import { DateSet } from "./date-set";
import { Santeibi } from "./santeibi";
import type { ShinryoukouiItem, VisitItem } from "./visit-item";

export function composeShinryoukouiItems(visitItems: VisitItem[], kouhiIdList: number[]): ShinryoukouiItem[] {
  const result: ShinryoukouiItem[] = [];
  visitItems.forEach(visitItem => {
    const date = visitItem.visit.visitedAt.substring(0, 10);
    visitItem.visitEx.shinryouList.forEach(shinryou => {
      const master = shinryou.master;
      const shinryouShubetsu = Math.floor(parseInt(master.shuukeisaki) / 10);
      if (!診療識別コードvalues.includes(shinryouShubetsu.toString())) {
        console.log("Unknown 診療識別コード", shinryouShubetsu);
      }
      const futanKubun = calcFutanKubun(hasHoken(visitItem), visitItem.hoken.kouhiList.map(k => k.kouhiId), kouhiIdList);
      const santeibi = new Santeibi();
      santeibi.add(date);
      result.push({
        shinryouShubetsu: shinryouShubetsu.toString(),
        futanKubun,
        shinryoucode: shinryou.shinryoucode,
        count:1,
        santeibiInfo: santeibi.getSanteibiMap(),
      })
    })
  })
  return result;
}

function hasHoken(visitItem: VisitItem): boolean {
  return visitItem.hoken.shahokokuho !== undefined || visitItem.hoken.koukikourei !== undefined;
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