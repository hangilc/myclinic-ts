import api from "@/lib/api";
import { cache } from "@/lib/cache";
import { type 用法レコード, type 薬品情報 } from "@/lib/denshi-shohou/presc-info";
import type { DrugGroup, Drug, Usage } from "@/lib/parse-shohou";
import { convDrugToDenshi, convShohouDrugTo薬品レコードPartial1, convShohouDrugTo薬品情報Partial1, createPartial2FromIyakuhinMaster, type 薬品レコードPartial1, type 薬品情報Partial1 } from "./denshi-conv-helper";

let serialId = 1;

export interface ConvGroupRep {
  id: number;
  drugs: ConvDrugRep[];
  usage: ConvUsageRep,
}

export type ConvDrugRep = { kind: "converted", data: 薬品情報 }
  | { kind: "unconverted"; src: Drug; 薬品情報Partial1: 薬品情報Partial1, 薬品レコードpartial1: 薬品レコードPartial1 };

export type ConvUsageRep = {
  kind: "converted";
  data: 用法レコード;
} | {
  kind: "unconverted";
  src: Usage,
}

async function createConvDrugRep(drug: Drug, at: string): Promise<ConvDrugRep> {
  let info1 = convShohouDrugTo薬品情報Partial1(drug);
  let info2 = convShohouDrugTo薬品レコードPartial1(drug);
  let map = await cache.getDrugNameIyakuhincodeMap();
  let iyakuhincode = map[drug.name];
  if( iyakuhincode ){
    try {
      let master = await api.getIyakuhinMaster(iyakuhincode, at);
      let info3 = createPartial2FromIyakuhinMaster(master, false);
      let 薬品情報: 薬品情報 = convDrugToDenshi(info1, info2, info3);
      return { kind: "converted", data: 薬品情報 }
    } catch {
      console.log(`iyakuhincode ${iyakuhincode} not available at ${at}`)
    }
  }
  return {
    kind: "unconverted",
    src: drug,
    薬品情報Partial1: info1,
    薬品レコードpartial1: info2,
  }
}

export async function createConvGroupRep(src: DrugGroup, at: string): Promise<ConvGroupRep> {
  let drugs: ConvDrugRep[] = [];
  for (let d of src.drugs) {
    let c = await createConvDrugRep(d, at);
    drugs.push(c);
  }
  let usage: ConvUsageRep = await convertUsageToDenshi(src.usage)
  return {
    id: serialId++,
    drugs,
    usage,
  }
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
