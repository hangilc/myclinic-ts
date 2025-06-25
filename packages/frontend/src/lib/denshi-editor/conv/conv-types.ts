import api from "@/lib/api";
import { cache } from "@/lib/cache";
import type { RP剤情報, 薬品情報 } from "@/lib/denshi-shohou/presc-info";
import type { DrugGroup, Drug } from "@/lib/parse-shohou";
import { toHankaku } from "@/lib/zenkaku";

let serialId = 1;

export interface ConvGroupRep {
  id: number;
  drugs: ConvDrugRep[];
}

export interface ConvDrugRep {
  src: Drug;
  converted: 薬品情報 | undefined;
}

function validateAmount(amount: string): number | undefined {
  let a = parseFloat(toHankaku(amount));
  if( isNaN(a) ){
    return undefined;
  } else {
    return a;
  }
}

export async function createConvGroupRep(src: DrugGroup, at: string): Promise<ConvGroupRep> {
  let map = await cache.getDrugNameIyakuhincodeMap();
  let drugs: ConvDrugRep[] = [];
  for (let d of src.drugs) {
    let amount = validateAmount(d.amount);
    if( !amount ){
      alert(`分量が適切でありません。${d.amount}`);
      throw new Error("failed to parse amount");
    }
    let converted: 薬品情報 | undefined = undefined;
    let name = d.name;
    let iyakuhincode = map[name];
    if (iyakuhincode) {
      try {
        let master = await api.getIyakuhinMaster(iyakuhincode, at);
        converted = {
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
        // nop
      }
      drugs.push({
        src: d,
        converted,
      })
    }
    drugs.push({
      src: d,
      converted
    })
  }
  return {
    id: serialId++,
    drugs,
  }
}