import type { RP剤情報, 薬品情報 } from "@/lib/denshi-shohou/presc-info";
import type { DrugGroup, Drug } from "@/lib/parse-shohou";

let serialId = 1;

export interface ConvGroupRep {
  id: number;
  drugs: ConvDrugRep[];
}

export interface ConvDrugRep {
  src: Drug;
  converted: 薬品情報 | undefined;
}

export function createConvGroupRep(src: DrugGroup): ConvGroupRep {
  let drugs: ConvDrugRep[] = src.drugs.map(d => {
    return { src: d, converted: undefined };
  })
  return {
    id: serialId++,
    drugs,
  }
}