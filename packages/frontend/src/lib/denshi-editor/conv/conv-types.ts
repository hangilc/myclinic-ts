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

export type ConvDrugRep = { kind: "converted", data: 薬品情報 }
  | { kind: "resolver"; src: Drug; partial:  };

export type ConvUsageRep = {
  kind: "converted";
  data: 用法レコード;
} | {
  kind: "unconverted";
  src: Usage,
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

  let usageRecord = map[usageText];
  if (usageRecord) {
    return {
      kind: "converted",
      data: usageRecord,
    };
  }

  return {
    kind: "unconverted",
    src: usage,
  };
}
