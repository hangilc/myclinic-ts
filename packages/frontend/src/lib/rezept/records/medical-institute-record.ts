import { formatYearMonth } from "../util";

export function mk医療機関情報レコード({
  診査支払い機関,
  都道府県,
  医療機関コード,
  医療機関名称,
  year,
  month,
  マルチボリューム識別情報,
  電話番号,
}: {
  診査支払い機関: number,
  都道府県: string,
  医療機関コード: string,
  医療機関名称: string,
  year: number,
  month: number,
  マルチボリューム識別情報?: string,
  電話番号?: string,
}): string {
  return [
    "IR", // 1 レコード識別情報
    診査支払い機関.toString(), // 2
    都道府県, // 3
    "1", // 4 点数表（医科）
    医療機関コード, // 5 
    "", // 6 予備
    医療機関名称, // 7
    formatYearMonth(year, month), // 8 請求年月,
    マルチボリューム識別情報 ?? "00", // 9
    電話番号, // 10
  ].join(",");;
}
