import type { HokenInfo, Patient } from "myclinic-model";
import { 男女区分コード, type レセプト特記事項コードCode } from "../codes";
import { formatYearMonth, is国保, resolve保険種別 } from "../util";

function mkレセプト共通レコード({
  レセプト番号,
  レセプト種別,
  診療年月,
  氏名,
  男女区分,
  生年月日,
  給付割合,
  レセプト特記事項,
  カルテ番号等,
  検索番号,
  請求情報,
}: {
  レセプト番号: number;
  レセプト種別: number;
  診療年月: string;
  氏名: string;
  男女区分: number;
  生年月日: string;
  給付割合: string;
  レセプト特記事項: string;
  カルテ番号等?: string,
  検索番号?: string,
  請求情報?: string,
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
    "", // 13 病床数
    カルテ番号等 ?? "", // 14
    "", // 15 割引点数単価
    "", // 16 予備
    "", // 17 予備
    "", // 18 予備
    検索番号 ?? "", // 19
    "", // 20 予備
    請求情報 ?? "", // 21
    "", // 22 診療科名
    "", // 23 人体の部位等
    "", // 24 性別等
  ].join(",");
}

export function createレセプト共通レコード({
  rezeptSerialNumber,
  hoken,
  year,
  month,
  patient,
  tokkkijikouGendogaku,
}: {
  rezeptSerialNumber: number;
  hoken: HokenInfo;
  year: number;
  month: number;
  patient: Patient;
  tokkkijikouGendogaku: string | undefined,
}): string {
  return mkレセプト共通レコード({
    レセプト番号: rezeptSerialNumber,
    レセプト種別: resolve保険種別(hoken),
    診療年月: formatYearMonth(year, month),
    氏名: patient.fullName("　"),
    男女区分: patient.sex === "M" ? 男女区分コード.男 : 男女区分コード.女,
    生年月日: patient.birthday.replaceAll("-", ""),
    給付割合: (hoken.shahokokuho && is国保(hoken.shahokokuho.hokenshaBangou)) ? "70" : "",
    レセプト特記事項: (tokkkijikouGendogaku === undefined ? [] : [tokkkijikouGendogaku]).join(""),
  })
}