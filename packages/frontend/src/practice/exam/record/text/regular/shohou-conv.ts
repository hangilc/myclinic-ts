import api from "@/lib/api";
import { cache } from "@/lib/cache";
import type { 薬品コード種別 } from "@/lib/denshi-shohou/denshi-shohou";
import type {
  PrescInfoData,
  RP剤情報,
  薬品情報,
} from "@/lib/denshi-shohou/presc-info";
import { DateWrapper } from "myclinic-util";

interface DrugInfo {
  name: string;
  code: string;
  codeKind: 薬品コード種別;
  unit: string;
}

interface UsageInfo {
  name: string;
  code: string;
}

export async function shohowConv(data: PrescInfoData) {
  const at: string = DateWrapper.fromOnshiDate(
    data.処方箋交付年月日
  ).asSqlDate();
  const drugNameMap: Record<string, string> = await cache.getDrugNameConv();
  const drugUsageMap: Record<string, string> = await cache.getDrugUsageConv();
  for (let group of data.RP剤情報グループ) {
    for (let drug of group.薬品情報グループ) {
      if (drug.薬品レコード.薬品コード === "") {
        await drugConv(drug, at, drugNameMap);
      }
    }
    if (group.用法レコード.用法コード === "") {
      await usageConv(group, drugUsageMap);
    }
  }
}

async function usageConv(group: RP剤情報, drugUsageMap: Record<string, string>) {
  let info: UsageInfo | undefined = undefined;
  const names = composeUsageNames(group, drugUsageMap);
  for (let name of names) {
    const i = await resolveUsageInfoByName(name);
    if (i) {
      info = i;
      break;
    }
  }
  if (!info) {
    return;
  }
  console.log("info", info);
  group.用法レコード.用法名称 = info.name;
  group.用法レコード.用法コード = info.code;
}

async function resolveUsageInfoByName(name: string): Promise<UsageInfo | undefined> {
  const m = await api.findUsageMasterByUsageName(name);
  console.log("m", m);
  if (!m) {
    return undefined;
  }
  return {
    name: m.usage_name,
    code: m.usage_code,
  }
}

function composeUsageNames(group: RP剤情報, drugUsageMap: Record<string, string>): string[] {
  const name = group.用法レコード.用法名称;
  const names: string[] = [name];
  const convName = drugUsageMap[name];
  if (convName && convName !== "") {
    names.push(convName);
  }
  return names;
}

async function drugConv(drug: 薬品情報, at: string, drugNameMap: Record<string, string>) {
  let info: DrugInfo | undefined = undefined;
  const names = composeDrugNames(drug, drugNameMap);
  for (let name of names) {
    const i = await resolveDrugInfoByName(name, at);
    if (i) {
      info = i;
      break;
    }
  }
  if (info) {
    const origUnit = drug.薬品レコード.単位名;
    console.log("unit", origUnit, drug.薬品レコード.単位名);
    if (origUnit === info.unit) {
      drug.薬品レコード.薬品名称 = info.name;
      drug.薬品レコード.薬品コード = info.code;
      drug.薬品レコード.薬品コード種別 = info.codeKind;
    }
  }
}

function composeDrugNames(drug: 薬品情報, drugNameMap: Record<string, string>): string[] {
  const name = drug.薬品レコード.薬品名称;
  const names: string[] = [name];
  const convName = drugNameMap[name];
  if (convName && convName !== "") {
    names.push(convName);
  }
  return names;
}

async function resolveDrugInfoByName(name: string, at: string): Promise<DrugInfo | undefined> {
  if (name.startsWith("【般】")) {
    const ms = await api.listIyakuhinMasterByIppanmei(name, at);
    if (ms.length > 0) {
      const m = ms[0];
      return {
        name: m.ippanmei,
        code: m.ippanmeicode,
        codeKind: "一般名コード",
        unit: m.unit,
      }
    } else {
      return undefined;
    }
  } else {
    const m = await api.findIyakuhinMasterByName(name, at);
    if (m) {
      return {
        name: m.name,
        code: m.iyakuhincode.toString(),
        codeKind: "レセプト電算処理システム用コード",
        unit: m.unit,
      }
    } else {
      return undefined;
    }
  }
}

// export async function applyPrescExample(
//   list: DrugPrefab[],
//   data: PrescInfoData
// ) {
//   for (let group of data.RP剤情報グループ) {
//     for (let drug of group.薬品情報グループ) {
//       applyDrug(list, drug);
//     }
//     applyGroup(list, group);
//   }
// }

// function applyGroup(list: DrugPrefab[], group: RP剤情報) {
//   if (group.用法レコード.用法コード === "") {
//     let code = findUsageCodeByName(list, group.用法レコード.用法名称);
//     if (code !== undefined) {
//       group.用法レコード.用法コード = code;
//       return;
//     }
//   }
// }

// function findUsageCodeByName(
//   list: DrugPrefab[],
//   name: string
// ): string | undefined {
//   for (let pre of list) {
//     if (pre.presc.用法レコード.用法名称 === name) {
//       return pre.presc.用法レコード.用法コード;
//     }
//   }
//   return undefined;
// }

// function applyDrug(list: DrugPrefab[], drug: 薬品情報) {
//   if (drug.薬品レコード.薬品コード === "") {
//     let code = findIyakuhincodeByName(list, drug.薬品レコード.薬品名称);
//     if (code !== undefined) {
//       drug.薬品レコード.薬品コード = code;
//       return;
//     }
//   }
// }

// function findIyakuhincodeByName(
//   list: DrugPrefab[],
//   name: string
// ): string | undefined {
//   for (let pre of list) {
//     if (pre.presc.薬品情報グループ[0].薬品レコード.薬品名称 === name) {
//       return pre.presc.薬品情報グループ[0].薬品レコード.薬品コード;
//     }
//     for (let a of pre.alias) {
//       if (a === name) {
//         return pre.presc.薬品情報グループ[0].薬品レコード.薬品コード;
//       }
//     }
//   }
//   return undefined;
// }
