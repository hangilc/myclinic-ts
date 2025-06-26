import api from "@/lib/api";
import { cache } from "@/lib/cache";
import { type 剤形レコード, type 用法レコード, type 用法補足レコード, type 薬品情報 } from "@/lib/denshi-shohou/presc-info";
import type { DrugGroup, Drug, Usage } from "@/lib/parse-shohou";
import { toHankaku } from "@/lib/zenkaku";
import type { IyakuhinMaster } from "myclinic-model";

let serialId = 1;

export interface ConvGroupRep {
  id: number;
  drugs: ConvDrugRep[];
  usage: ConvUsageRep,
}

export type DrugResolver = (master: IyakuhinMaster) => 薬品情報;

export type ConvDrugRep = { kind: "converted", data: 薬品情報 } | { kind: "resolver"; src: Drug; resolver: DrugResolver };

export interface ConvertedUsage {
  剤形レコード: 剤形レコード,
  用法レコード: 用法レコード,
  用法補足レコード?: 用法補足レコード[];
}

export type UsageResolver = (usageCode: string, usageName: string) => ConvertedUsage;

export type ConvUsageRep = {
  kind: "converted";
  data: ConvertedUsage;
} | {
  kind: "resolver";
  src: Usage,
  resolver: UsageResolver;
}

function validateAmount(amount: string): number | undefined {
  let a = parseFloat(toHankaku(amount));
  if (isNaN(a)) {
    return undefined;
  } else {
    return a;
  }
}

export async function createConvGroupRep(src: DrugGroup, at: string): Promise<ConvGroupRep> {
  let map = await cache.getDrugNameIyakuhincodeMap();
  let drugs: ConvDrugRep[] = [];
  for (let d of src.drugs) {
    let c = await convertDrugToDenshi(d, at);
    if (typeof c === "function") {
      drugs.push({
        kind: "resolver",
        src: d,
        resolver: c,
      })
    } else {
      drugs.push({ kind: "converted", data: c });
    }
  }
  let usage: ConvUsageRep = await convertUsageToDenshi(src.usage)
  return {
    id: serialId++,
    drugs,
    usage,
  }
}

export async function convertDrugToDenshi(drug: Drug, at: string): Promise<
  薬品情報
  | ((master: IyakuhinMaster) => 薬品情報)> {
  let amount = validateAmount(drug.amount);
  if (!amount) {
    throw new Error(`分量が適切でありません。${drug.amount}`);
  }

  let map = await cache.getDrugNameIyakuhincodeMap();
  let iyakuhincode = map[drug.name];

  if (iyakuhincode) {
    try {
      let master = await api.getIyakuhinMaster(iyakuhincode, at);
      return {
        薬品レコード: {
          情報区分: "医療材料",
          薬品コード種別: "レセプト電算処理システム用コード",
          薬品コード: master.iyakuhincode.toString(),
          薬品名称: master.name,
          分量: amount.toString(),
          力価フラグ: "薬価単位",
          単位名: master.unit,
        }
      };
    } catch {
      console.error(`iyakuhincode ${iyakuhincode} is not available at ${at}`);
    }
  }

  return (master: IyakuhinMaster) => {
    return {
      薬品レコード: {
        情報区分: "医療材料",
        薬品コード種別: "レセプト電算処理システム用コード",
        薬品コード: master.iyakuhincode.toString(),
        薬品名称: master.name,
        分量: amount.toString(),
        力価フラグ: "薬価単位",
        単位名: master.unit,
      }
    };
  };
}

export async function convertUsageToDenshi(usage: Usage): Promise<ConvUsageRep> {
  const map = await cache.getUsageMasterMap();
  const usageText = usage.usage;

  if (map[usageText]) {
    const usageRecord = map[usageText];
    let 剤形区分: "内服" | "頓服" | "外用";
    let 調剤数量: number;

    if (usage.kind === "days") {
      剤形区分 = "内服";
      調剤数量 = parseInt(toHankaku(usage.days));
      if (isNaN(調剤数量)) {
        throw new Error(`日数が適切でありません。${usage.days}`);
      }
    } else if (usage.kind === "times") {
      剤形区分 = "頓服";
      調剤数量 = parseInt(toHankaku(usage.times));
      if (isNaN(調剤数量)) {
        throw new Error(`回数が適切でありません。${usage.times}`);
      }
    } else {
      剤形区分 = "外用";
      調剤数量 = 1;
    }

    return {
      kind: "converted",
      data: {
        剤形レコード: {
          剤形区分,
          調剤数量,
        },
        用法レコード: usageRecord,
      }
    };
  }

  return {
    kind: "resolver",
    src: usage,
    resolver:
      (usageCode: string, usageName: string) => {
        let 剤形区分: "内服" | "頓服" | "外用";
        let 調剤数量: number;

        if (usage.kind === "days") {
          剤形区分 = "内服";
          調剤数量 = parseInt(toHankaku(usage.days));
          if (isNaN(調剤数量)) {
            throw new Error(`日数が適切でありません。${usage.days}`);
          }
        } else if (usage.kind === "times") {
          剤形区分 = "頓服";
          調剤数量 = parseInt(toHankaku(usage.times));
          if (isNaN(調剤数量)) {
            throw new Error(`回数が適切でありません。${usage.times}`);
          }
        } else {
          剤形区分 = "外用";
          調剤数量 = 1;
        }

        return {
          剤形レコード: {
            剤形区分,
            調剤数量,
          },
          用法レコード: {
            用法コード: usageCode,
            用法名称: usageName,
          },
        };
      }
  };
}
