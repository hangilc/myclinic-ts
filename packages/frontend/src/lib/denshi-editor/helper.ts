import type { RP剤情報, 不均等レコード, 用法レコード, 用法補足レコード, 薬品レコード, 薬品情報, 薬品補足レコード } from "@/lib/denshi-shohou/presc-info";
import type { 力価フラグ, 情報区分, 薬品コード種別 } from "@/lib/denshi-shohou/denshi-shohou";
import { toHankaku, toZenkaku } from "@/lib/zenkaku";
import { 不均等レコードWrapper } from "../denshi-shohou/denshi-type-wrappers";
import type { Drug, Usage } from "@/lib/parse-shohou";
import type { ConvData2 } from "./conv/denshi-conv";
import { 薬品情報Edit } from "./denshi-edit";
import api from "../api";
import type { IyakuhinMaster, KizaiMaster } from "myclinic-model";

export function validateDrug(drug: {
  情報区分: 情報区分;
  薬品コード種別: 薬品コード種別;
  薬品コード: string;
  薬品名称: string;
  分量: string;
  力価フラグ: 力価フラグ;
  単位名: string | undefined;
}): 薬品レコード | string {
  if (drug.薬品コード === "") {
    return "薬品コードが設定されていません。";
  } if (drug.薬品名称 === "") {
    return "薬品名称が設定されていません。";
  }
  if (drug.分量 === "") {
    return "分量が設定されていません。";
  } else {
    const n = parseFloat(drug.分量);
    if (isNaN(n)) {
      return "分量が数値でありません。";
    }
  }
  if (drug.単位名 === undefined) {
    return "単位名が設定されていません。";
  }
  return Object.assign({}, drug, { 単位名: drug.単位名 });
}

function unevenRep(u: 不均等レコード | undefined): string {
  if (u) {
    let wrapper = new 不均等レコードWrapper(u);
    return "(" + wrapper.getParts().join("-") + ")"
  } else {
    return "";
  }
}

function hosokuRep(h: 薬品補足レコード[] | undefined) {
  if (h) {
    return h.map(e => `　${e.薬品補足情報}`).join("");
  } else {
    return "";
  }
}

export function drugRep(drug: 薬品情報): string {
  return `${drug.薬品レコード.薬品名称}　${toZenkaku(
    drug.薬品レコード.分量,
  )}${drug.薬品レコード.単位名}${unevenRep(drug.不均等レコード)}${hosokuRep(drug.薬品補足レコード)}`;
}

export function unconvDrugRep(drug: Drug): string {
  let s = `${drug.name}　${drug.amount}${drug.unit}${drug.uneven ?? ""}`;
  if (drug.senpatsu === "henkoufuka") {
    s += " 変更不可";
  } else if (drug.senpatsu === "kanjakibou") {
    s += "　患者希望";
  }
  if (drug.drugComments.length > 0) {
    for (let c of drug.drugComments) {
      s += `　${c}`;
    }
  }
  return s;
}

export function usageRep(usage: 用法レコード, data2: ConvData2): string {
  let s = usage.用法名称;
  if (data2.用法補足レコード && data2.用法補足レコード.length > 0) {
    for (let rec of data2.用法補足レコード) {
      s += `　${rec.用法補足情報}`
    }
  }
  return s;
}

export function unconvUsageRep(usage: Usage, data2: ConvData2): string {
  let s = usage.usage;
  if (data2.用法補足レコード && data2.用法補足レコード.length > 0) {
    for (let rec of data2.用法補足レコード) {
      s += `　${rec.用法補足情報}`
    }
  }
  return s;
}


export function runner(...fs: (() => any)[]): () => void {
  return () => {
    for (let f of fs) {
      f();
    }
  }
}

export function serializeUneven(r: 不均等レコード | undefined): string {
  if (r) {
    let parts: string[] = [r.不均等１回目服用量, r.不均等２回目服用量];
    [
      r.不均等３回目服用量,
      r.不均等４回目服用量,
      r.不均等５回目服用量,
    ].forEach((e) => {
      if (e) {
        parts.push(e);
      }
    });
    return parts.join("-");
  } else {
    return "";
  }
}

export function deserializeUneven(s: string): 不均等レコード | undefined {
  s = s.trim();
  if (s === "") {
    return undefined;
  } else {
    s = toHankaku(s);
    let parts: string[] = [];
    for (let e of s.split(/\s*-\s*/)) {
      let f = parseFloat(e);
      if (isNaN(f)) {
        throw new Error(`数値でありません: ${e}`);
      } else {
        parts.push(f.toString());
      }
    }
    if (parts.length < 2) {
      throw new Error(`分割数が少なすぎます（２つ以上必要）`);
    }
    return {
      不均等１回目服用量: parts[0],
      不均等２回目服用量: parts[1],
      不均等３回目服用量: parts[2],
      不均等４回目服用量: parts[3],
      不均等５回目服用量: parts[4],
    };
  }
}

export function isValidDrug(drug: 薬品情報): boolean {
  return drug.薬品レコード.薬品コード !== "";
}

export function isValidUsage(usage: 用法レコード): boolean {
  return usage.用法コード !== "";
}

export const henkoufukaInfo = "後発品変更不可";
export const kanjakibouInfo = "先発医薬品患者希望";

export function henkoufukaDrugSuppl(): 薬品補足レコード {
  return {
    "薬品補足情報": henkoufukaInfo
  }
}

export function kanjakibouDrugSuppl(): 薬品補足レコード {
  return {
    "薬品補足情報": kanjakibouInfo
  }
}

export function hasHenkoufukaDrugSuppl(list: 薬品補足レコード[]): boolean {
  return list.some(s => s.薬品補足情報 === henkoufukaInfo);
}

export function hasKanjakibouDrugSuppl(list: 薬品補足レコード[]): boolean {
  return list.some(s => s.薬品補足情報 === kanjakibouInfo);
}

export function hasIppoukaUsageSuppl(list: 用法補足レコード[]): boolean {
  return list.some(s => s.用法補足情報 === "一包化");
}

export function ippoukaUsageSuppl(): 用法補足レコード {
  return {
    "用法補足情報": "一包化"
  }
}

export const freeTextCode = "0X0XXXXXXXXX0000";

// export async function confirmDrugCode(drug: 薬品レコード, at: string): Promise<undefined | string> {
//   let code = drug.薬品コード;
//   if (code === "") {
//     return `no-drug-code:薬品コードが設定されていません（${drug.薬品名称}）`;
//   }
//   if (drug.情報区分 === "医薬品") {
//     if (/^\d+$/.test(code)) {
//       let m: IyakuhinMaster;
//       try {
//         m = await api.getIyakuhinMaster(parseInt(code), at);
//       } catch {
//         return `invalid-code:不適切な薬品コードです（${drug.薬品コード}|${drug.薬品名称}）`
//       }
//       if (m.name === drug.薬品名称) {
//         return undefined;
//       } else {
//         return `incompat-name:薬品名称が一致しません（${drug.薬品名称}）|${m.name})`;
//       }
//     } else {
//       let ms = await api.listIyakuhinMasterByIppanmeicode(code, at);
//       if (ms.length !== 0) {
//         let name = ms[0].name;
//         if (name === drug.薬品名称) {
//           return undefined;
//         } else {
//           return `incompat-name:薬品名称が一致しません（${drug.薬品名称}）|${name})`;
//         }
//       } else {
//         return `invalid-code:不適切な薬品コードです（${drug.薬品コード}|${drug.薬品名称}）`
//       }
//     }
//   } else if (drug.情報区分 === "医療材料") {
//     let m: KizaiMaster;
//     try {
//       m = await api.getKizaiMaster(parseInt(code), at);
//     } catch {
//       return `invalid-code:不適切な器材コードです（${drug.薬品コード}|${drug.薬品名称}）`
//     }
//     if (m.name === drug.薬品名称) {
//       return undefined;
//     } else {
//       return `incompat-name:器材名称が一致しません（${drug.薬品名称}）|${m.name})`;
//     }
//   } else {
//     throw new Error("cannot happen")
//   }
// }

// export async function confirmDrugCodesOfGroups(groups: RP剤情報[], at: string, {
//   skipBlankCode
// }: { skipBlankCode?: boolean }): Promise<undefined | string[]> {
//   let errs: string[] = [];
//   for(let group of groups) {
//     for(let drug of group.薬品情報グループ){
//       if(skipBlankCode &&  drug.薬品レコード.薬品コード === "" ) {
//         continue;
//       }
//       let e = await confirmDrugCode(drug.薬品レコード, at);
//       if( e ){
//         errs.push(e);
//       }
//     }
//   }
//   return errs.length === 0 ? undefined: errs;
// }

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


