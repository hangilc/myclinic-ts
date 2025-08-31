import { cache } from "@/lib/cache";
import type { PrescInfoData } from "@/lib/denshi-shohou/presc-info";
import type { DrugPrefab } from "@/lib/drug-prefab";

export async function applyPrescExample(data: PrescInfoData) {
  const list: DrugPrefab[] = await cache.getDrugPrefabList();
  for(let group of data.RP剤情報グループ){
    for(let drug of group.薬品情報グループ){
      if( drug.薬品レコード.薬品コード === "" ){
        let code = findIyakuhincodeByName(list, drug.薬品レコード.薬品名称);
        if( code !== undefined ){
          drug.薬品レコード.薬品コード = code;
        }
      }
    }
  }
}

function findIyakuhincodeByName(list: DrugPrefab[], name: string): string | undefined {
  for(let pre of list) {
    if( pre.presc.薬品情報グループ[0].薬品レコード.薬品名称 === name ){
      return pre.presc.薬品情報グループ[0].薬品レコード.薬品コード;
    }
    for(let a of pre.alias){
      if( a === name ){
        return pre.presc.薬品情報グループ[0].薬品レコード.薬品コード;
      }
    }
  }
  return undefined;
}