import { 診査支払い機関コード, 診査支払い機関コードCode } from "codes";
import { calcSeikyuuMonth } from "helper";

export interface CreateRezeptArg {
  seikyuuSaki: "kokuho" | "shaho";
  year: number;
  month: number;
}

export function createRezept(arg: CreateRezeptArg): string {
  const { seikyuuSaki, year, month } = arg;
  let serial = 1;
  const rows: string[] = [];
  rows.push(create医療機関情報レコード(
    seikyuuSaki === "shaho" ? 診査支払い機関コード.社保基金 : 診査支払い機関コード.国健連合,]
    year, month));
  return rows.join("\r\n") + "\r\n\x1A";
}

function create医療機関情報レコード(seikyuu: 診査支払い機関コードCode, year: number, month: number): string {
  const [seikyuuYear, seikyuuMonth] = calcSeikyuuMonth(year, month);

  return mk医療機関情報レコード({
    診査支払い機関: seikyuu,
    都道府県: extract都道府県コードfromAddress(this.clinicInfo.address),
    医療機関コード: this.clinicInfo.kikancode,
    医療機関名称: this.clinicInfo.name,
    year: seikyuuYear,
    month: seikyuuMonth,
    電話番号: this.clinicInfo.tel,
  });
}
