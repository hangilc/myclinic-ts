import type { PrescInfoData, RP剤情報, 薬品レコード } from "@/lib/denshi-shohou/presc-info";
import api from "@/lib/api";

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
export async function confirmDrugCode(record: 薬品レコード, at: string): Promise<undefined | string> {
  const name = record.薬品名称;
  const code = record.薬品コード;
  if (record.情報区分 === "医薬品") {
    if (/^\d+$/.test(code)) {
      try {
        let m = await api.getIyakuhinMaster(parseInt(record.薬品コード), at);
        if (m.name !== name) {
          return `医薬品マスターと名前が一致しません:${code}|${name}|${m.name}`;
        }
      } catch {
        return `医薬品マスターがみつかりません：${code}:${name}`;
      }
    } else { // 一般名コード
      let ms = await api.listIyakuhinMasterByIppanmeicode(code, at);
      if (ms.length === 0) {
        return `医薬品マスターがみつかりません：${code}:${name}`;
      } else {
        let m = ms[0];
        if (m.ippanmei !== name) {
          return `医薬品マスターと名前が一致しません:${code}|${name}|${m.name}`;
        }
      }
    }
  } else {
    try {
      let m = await api.getKizaiMaster(parseInt(record.薬品コード), at);
      if (m.name !== name) {
        return `器材マスターと名前が一致しません:${code}|${name}|${m.name}`;
      }
    } catch {
      return `器材マスターがみつかりません：${code}:${name}`;
    }
  }
  return undefined;
}

export async function confirmDrugCodesOfGroups(groups: RP剤情報[], at: string, opt: {
  skipBlankCodes?: boolean;
} = {}): Promise<undefined | string[]> {
  let errs: string[] = [];
  const skipBlankCodes = opt.skipBlankCodes ?? false;
  for (let group of groups) {
    for (let drug of group.薬品情報グループ) {
      if( skipBlankCodes && drug.薬品レコード.薬品コード === "" ){
        continue;
      }
      const e = await confirmDrugCode(drug.薬品レコード, at);
      if( e ){
        errs.push(e);
      }
    }
  }
  return errs.length === 0 ? undefined : errs;
}


