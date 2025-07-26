import api from "@/lib/api";
import { cache } from "@/lib/cache";
import type { PrescInfoData, RP剤情報, 用法レコード } from "@/lib/denshi-shohou/presc-info";
import { DateWrapper } from "myclinic-util";

export function isKensa(patientId: number, content: string): boolean {
  const re = new RegExp(`^0*${patientId}\\s+\\d+/\\d+/\\d+.+\n検査結果：`)
  return re.test(content);
}

export async function resolveByMap(data: PrescInfoData): Promise<void> {
  await resolveDrugByMap(data);
  await resolveUsageByMap(data);
}

async function resolveDrugByMap(data: PrescInfoData): Promise<void> {
  let at = DateWrapper.fromOnshiDate(data.処方箋交付年月日).asSqlDate();
  for (let g of data.RP剤情報グループ) {
    await resolveDrugGroupByMap(g);
  }
}

async function resolveUsageByMap(data: PrescInfoData): Promise<void> {
  for (let g of data.RP剤情報グループ) {
    let usage = g.用法レコード;
    await resolveUsageRecordByMap(usage);
  }
}

export async function resolveDrugGroupByMap(g: RP剤情報): Promise<void> {
  let map = await cache.getDrugNameIyakuhincodeMap();
  for (let d of g.薬品情報グループ) {
    if (d.薬品レコード.薬品コード === "") {
      let record = d.薬品レコード;
      let bind = map[record.薬品名称];
      if (bind) {
        record.薬品名称 = bind.name;
        record.薬品コード = bind.code;
        if (bind.kind === "iyakuhin") {
          record.薬品コード種別 = "レセプト電算処理システム用コード";
          record.情報区分 = "医薬品";
          if (g.剤形レコード.剤形区分 === "医療材料") {
            g.剤形レコード.剤形区分 = "不明"
          }
        } else if (bind.kind === "ippanmei") {
          record.薬品コード種別 = "一般名コード";
          record.情報区分 = "医薬品";
          if (g.剤形レコード.剤形区分 === "医療材料") {
            g.剤形レコード.剤形区分 = "不明"
          }
        } else if (bind.kind === "kizai") {
          record.薬品コード種別 = "レセプト電算処理システム用コード";
          record.情報区分 = "医療材料";
          g.剤形レコード.剤形区分 = "医療材料";
        }
      }
    }
  }
}

export async function resolveUsageRecordByMap(usage: 用法レコード): Promise<void> {
  let map = await cache.getUsageMasterMap();
  if (usage.用法コード === "") {
    let bind = map[usage.用法名称];
    if (bind) {
      Object.assign(usage, bind);
    }
  }
}

