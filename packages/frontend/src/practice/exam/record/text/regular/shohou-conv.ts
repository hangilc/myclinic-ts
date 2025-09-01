import { cache } from "@/lib/cache";
import type { PrescInfoData, RP剤情報, 薬品情報 } from "@/lib/denshi-shohou/presc-info";
import type { DrugPrefab } from "@/lib/drug-prefab";

export async function applyPrescExample(list: DrugPrefab[], data: PrescInfoData) {
  for (let group of data.RP剤情報グループ) {
    for (let drug of group.薬品情報グループ) {
      applyDrug(list, drug);
    }
    applyGroup(list, group);
  }
}

function applyGroup(list: DrugPrefab[], group: RP剤情報) {
  if( group.用法レコード.用法コード === "" ){
    let code = findUsageCodeByName(list, group.用法レコード.用法名称);
    if( code !== undefined ){
      group.用法レコード.用法コード = code;
      return;
    }
  }
}

function findUsageCodeByName(list: DrugPrefab[], name: string): string | undefined {
  for(let pre of list){
    if( pre.presc.用法レコード.用法名称 === name ){
      return pre.presc.用法レコード.用法コード;
    }
  }
  return undefined;
}

function applyDrug(list: DrugPrefab[], drug: 薬品情報) {
  if (drug.薬品レコード.薬品コード === "") {
    let code = findIyakuhincodeByName(list, drug.薬品レコード.薬品名称);
    if (code !== undefined) {
      drug.薬品レコード.薬品コード = code;
      return;
    }
  }
}

function findIyakuhincodeByName(
  list: DrugPrefab[],
  name: string
): string | undefined {
  for (let pre of list) {
    if (pre.presc.薬品情報グループ[0].薬品レコード.薬品名称 === name) {
      return pre.presc.薬品情報グループ[0].薬品レコード.薬品コード;
    }
    for (let a of pre.alias) {
      if (a === name) {
        return pre.presc.薬品情報グループ[0].薬品レコード.薬品コード;
      }
    }
  }
  return undefined;
}
