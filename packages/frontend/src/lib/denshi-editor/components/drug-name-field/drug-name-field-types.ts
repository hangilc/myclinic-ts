import type { DrugPrefab } from "@/lib/drug-prefab";
import type { IyakuhinMaster } from "myclinic-model"
import { drugRep } from "../../helper";
import { daysTimesDisp } from "@/lib/denshi-shohou/disp/disp-util";

export type SearchIyakuhinResult = ({
  kind: "master";
  master: IyakuhinMaster;
} | {
  kind: "ippanmei";
  master: IyakuhinMaster;
} | {
  kind: "prefab";
  prefab: DrugPrefab;
  master: IyakuhinMaster;
}) & { id: number };

let iyakuhinResultSerialId = 1;

export function createIyakuhinResultFromMaster(m: IyakuhinMaster): SearchIyakuhinResult {
  return { id: iyakuhinResultSerialId++, kind: "master", master: m };
}

export function createIyakuhinResultFromIppanmei(m: IyakuhinMaster): SearchIyakuhinResult {
  return { id: iyakuhinResultSerialId++, kind: "ippanmei", master: m };
}

export function createIyakuhinResultFromPrefab(prefab: DrugPrefab, master: IyakuhinMaster): SearchIyakuhinResult {
  return { id: iyakuhinResultSerialId++, kind: "prefab", prefab, master };
}

export function iyakuhinResultRep(r: SearchIyakuhinResult, isNewDrug: boolean): string {
  switch(r.kind){
    case "master": return r.master.name;
    case "ippanmei": return r.master.ippanmei;
    case "prefab": {
      if( isNewDrug ){
        return `(登) ${drugRep(r.prefab.presc.薬品情報グループ[0])}${daysTimesDisp(r.prefab.presc)}`;
      } else {
        return `(登薬) ${r.prefab.presc.薬品情報グループ[0].薬品レコード.薬品名称}`;
      }
    }
  }
}
