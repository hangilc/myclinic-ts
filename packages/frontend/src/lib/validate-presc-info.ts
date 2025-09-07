import type { PrescInfoData, RP剤情報, 薬品レコード } from "@/lib/denshi-shohou/presc-info";
import api from "@/lib/api";
import { issueDateOfPrescInfoAsSqlDate } from "./denshi-shohou/presc-info-helper";
import { toHankaku } from "./zenkaku";
import { freeTextCode } from "./denshi-editor/helper";

export async function validatePrescinfoData(data: PrescInfoData): Promise<string | undefined> {
  let at = issueDateOfPrescInfoAsSqlDate(data);
  for (let group of data.RP剤情報グループ) {
    let err = validateRP剤情報(group, at);
    if( err ){
      return err;
    }
  }
}

export async function validateRP剤情報(group: RP剤情報, at: string): Promise<string | undefined> {
  for (let drug of group.薬品情報グループ) {
    if (drug.薬品レコード.薬品コード === "") {
      return `薬品コードが設定されていません：（${drug.薬品レコード.薬品名称}）`;
    }
    {
      let amount = drug.薬品レコード.分量;
      amount = toHankaku(amount);
      const value = Number(amount);
      if( isNaN(value) ||  amount.startsWith(".") || amount.endsWith(".") ){
        return `薬品の分量が不適切です：${drug.薬品レコード.薬品名称}:${drug.薬品レコード.分量}`;
      }
      drug.薬品レコード.分量 = amount;
    }
    let err = await confirmDrugCode(drug.薬品レコード, at);
    if (err) {
      return err;
    }
  }
  if (group.用法レコード.用法コード === "") {
    return `用法コードが設定されていません：（${group.用法レコード.用法名称}）`;
  }
  if( group.剤形レコード.調剤数量 <= 0) {
    return `調剤数量が正でありません`;
  }
  let err = await confirmUsageCode(group.用法レコード.用法コード, group.用法レコード.用法名称);
  if (!err) {
    return err;
  }
  if( group.剤形レコード.剤形区分 === "医療材料" ){
    for(let drug of group.薬品情報グループ){
      if( drug.薬品レコード.情報区分 !== "医療材料" ){
        return `剤形区分が医療材料ですが、薬剤が医療材料でありません：${drug.薬品レコード.薬品名称}`;
      }
    }
  } else {
    for(let drug of group.薬品情報グループ){
      if( drug.薬品レコード.情報区分 === "医療材料" ){
        return `医薬品でなく医療材料です：${drug.薬品レコード.薬品名称}`;
      }
    }
  }
  return undefined;
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
        if( m.unit !== record.単位名 ){
          return `医薬品マスターと単位名が一致しません:${m.unit}|${record.単位名}`;
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
        if( m.unit !== record.単位名 ){
          return `医薬品マスターと単位名が一致しません:${m.unit}|${record.単位名}`;
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
      if (skipBlankCodes && drug.薬品レコード.薬品コード === "") {
        continue;
      }
      const e = await confirmDrugCode(drug.薬品レコード, at);
      if (e) {
        errs.push(e);
      }
    }
  }
  return errs.length === 0 ? undefined : errs;
}

export async function confirmUsageCode(code: string, text: string): Promise<undefined | string> {
  if (code === "") {
    return `用法コードが設定されていません：${text}`;
  }
  if( code === freeTextCode ){
    return undefined;
  }
  try {
    const m = await api.getUsageMaster(code);
    if (m.usage_name !== text) {
      return `用法名称が一致しません：${code}:${m.usage_name}:${name}`;
    }
  } catch {
    return `用法マスターが取得できません：${code}:${name}`;
  }
  return undefined;
}


