import api from "@/lib/api";
import type { ClinicInfo } from "myclinic-model";
import { KouhiOrderMap, 診査支払い機関コード } from "./codes";
import { create医療機関情報レコード } from "./records/medical-institute-record";
import { extract都道府県コードfromAddress } from "./util";

export async function createShaho(year: number, month: number): Promise<string> {
  return create(year, month, 診査支払い機関コード.社会保険診療報酬支払基金);
}

async function create(year: number, month: number, 診査機関: number): Promise<string> {
  const rows: string[] = [];
  rows.push(await 医療機関情報レコード(year, month, 診査機関));
  const visits = await api.listVisitByMonth(year, month);
  return rows.join("\r\n") + "\r\n\x1A";
}

async function 医療機関情報レコード(year: number, month: number, 診査機関: number): Promise<string> {
  const clinicInfo: ClinicInfo = await api.getClinicInfo();
  return create医療機関情報レコード({
    診査支払い機関: 診査機関,
    都道府県: extract都道府県コードfromAddress(clinicInfo.address),
    医療機関コード: clinicInfo.kikancode,
    医療機関名称: clinicInfo.name,
    year,
    month,
    電話番号: clinicInfo.tel,
  });
}