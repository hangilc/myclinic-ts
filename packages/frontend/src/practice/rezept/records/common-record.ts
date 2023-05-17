import type { HokenInfo, Patient } from "myclinic-model";
import { 男女区分コード } from "../codes";
import { formatYearMonth, is国保, resolve保険種別 } from "../util";

function mkレセプト胸痛レコード({
  レセプト番号,
  レセプト種別,
  診療年月,
  氏名,
  男女区分,
  生年月日,
  給付割合,
  レセプト特記事項,
}: {
  レセプト番号: number;
  レセプト種別: number;
  診療年月: string;
  氏名: string;
  男女区分: number;
  生年月日: string;
  給付割合: string;
  レセプト特記事項: string;
}): string {
  return [
    "RE", // 1 レコード識別情報
    レセプト番号, // 2
    レセプト種別, // 3
    診療年月, // 4
    氏名, // 5
    男女区分, // 6
    生年月日, // 7
    給付割合, // 8
    "", // 9 入院年月日
    "", // 10 病棟区分
    "", // 11 一分負担金等区分
    レセプト特記事項, // 12
  ].join(",");
}

export function createレセプト胸痛レコード({
  rezeptSerialNumber,
  hoken,
  year,
  month,
  patient,
}: {
  rezeptSerialNumber: number;
  hoken: HokenInfo;
  year: number;
  month: number;
  patient: Patient;
}): string {
  return mkレセプト胸痛レコード({
    レセプト番号: rezeptSerialNumber,
    レセプト種別: resolve保険種別(hoken),
    診療年月: formatYearMonth(year, month),
    氏名: patient.fullName("　"),
    男女区分: patient.sex === "M" ? 男女区分コード.男 : 男女区分コード.女,
    生年月日: patient.birthday.replaceAll("-", ""),
    給付割合: (hoken.shahokokuho && is国保(hoken.shahokokuho.hokenshaBangou)) ? "70" : "",
  })
}