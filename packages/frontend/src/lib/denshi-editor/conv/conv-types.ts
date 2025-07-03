import api from "@/lib/api";
import { cache } from "@/lib/cache";
import {
  type RP剤情報,
  type 用法レコード,
  type 薬品レコード,
  type 薬品情報,
} from "@/lib/denshi-shohou/presc-info";
import type { DrugGroup, Drug } from "@/lib/parse-shohou";
import {
  createConvData4DepsFromIyakuhinMaster,
  createRP剤情報,
  create薬品レコード,
  create薬品情報,
  getConvData2,
  getConvData3,
  getConvData4,
  type ConvData2,
  type ConvData3,
  type ConvData4,
} from "./denshi-conv";

let serialId = 1;

export interface ConvGroupRep {
  id: number;
  data2: ConvData2;
  usage: ConvUsageRep;
  drugs: ConvDrugRep[];
}

export type ConvUsageRep =
  | {
    kind: "converted";
    data: 用法レコード;
  }
  | {
    kind: "unconverted";
    src: DrugGroup;
  };

export type ConvDrugRep =
  | { kind: "converted"; data: 薬品情報 }
  | {
    kind: "unconverted";
    src: Drug;
    data3: ConvData3;
    data4: ConvData4;
  };

export async function createConvGroupRep(
  src: DrugGroup,
  at: string
): Promise<ConvGroupRep> {
  let drugs: ConvDrugRep[] = [];
  for (let d of src.drugs) {
    let c = await createConvDrugRep(d, at);
    drugs.push(c);
  }
  let usage: ConvUsageRep = await createConvUsageRep(src);
  return {
    id: serialId++,
    data2: getConvData2(src),
    drugs,
    usage,
  };
}

export function getConvertedGroup(rep: ConvGroupRep): RP剤情報 {
  let 用法レコード: 用法レコード = getConvertedUsage(rep.usage);
  let 薬品情報グループ: 薬品情報[] = rep.drugs.map((drug) =>
    getConvertedDrug(drug)
  );
  return createRP剤情報(rep.data2, 用法レコード, 薬品情報グループ);
}

export function isAllConvered(groups: ConvGroupRep[]): boolean {
  for (let g of groups) {
    if (!isGroupConverted(g.drugs, g.usage)) {
      return false;
    }
  }
  return true;
}

export function isGroupConverted(
  drugs: ConvDrugRep[],
  usage: ConvUsageRep
): boolean {
  for (let d of drugs) {
    if (d.kind !== "converted") {
      return false;
    }
  }
  if (usage.kind !== "converted") {
    return false;
  }
  return true;
}

export function getConvertedUsage(usage: ConvUsageRep): 用法レコード {
  if (usage.kind === "converted") {
    return usage.data;
  } else {
    throw new Error("usage not converted");
  }
}

export function getConvertedDrug(drug: ConvDrugRep): 薬品情報 {
  if (drug.kind === "converted") {
    return drug.data;
  } else {
    throw new Error("drug not convertged");
  }
}

async function createConvDrugRep(drug: Drug, at: string): Promise<ConvDrugRep> {
  let data3: ConvData3 = getConvData3(drug);
  let data4: ConvData4 = getConvData4(drug);
  let map = await cache.getDrugNameIyakuhincodeMap();
  let bind = map[drug.name];
  if (typeof bind === "number") {
    let iyakuhincode = bind;
    try {
      let master = await api.getIyakuhinMaster(iyakuhincode, at);
      let aux = createConvData4DepsFromIyakuhinMaster(master);
      let 薬品レコード: 薬品レコード = create薬品レコード(data4, aux);
      let 薬品情報: 薬品情報 = create薬品情報(data3, 薬品レコード);
      return { kind: "converted", data: 薬品情報 };
    } catch {
      console.log(`iyakuhincode ${iyakuhincode} not available at ${at}`);
    }
  }
  return {
    kind: "unconverted",
    src: drug,
    data3,
    data4,
  };
}

export async function createConvUsageRep(
  src: DrugGroup
): Promise<ConvUsageRep> {
  const map = await cache.getUsageMasterMap();
  const usageText = src.usage.usage;

  let usageRecord = map[usageText];
  if (usageRecord) {
    return {
      kind: "converted",
      data: usageRecord,
    };
  }

  return {
    kind: "unconverted",
    src,
  };
}
