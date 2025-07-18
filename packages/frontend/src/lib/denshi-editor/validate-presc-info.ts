import type { PrescInfoData } from "../denshi-shohou/presc-info";

export function validatePrescinfoData(data: PrescInfoData): string | undefined {
  for(let group of data.RP剤情報グループ){
    for(let drug of group.薬品情報グループ){
      if( drug.薬品レコード.薬品コード === "" ){
        return `薬品コードが設定されていません：（${drug.薬品レコード.薬品名称}）`;
      }
    }
    if( group.用法レコード.用法コード === "" ){
      return `用法コードが設定されていません：（${group.用法レコード.用法名称}）`;
    }
  }
}