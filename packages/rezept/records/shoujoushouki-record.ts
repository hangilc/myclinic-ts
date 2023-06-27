import type { 症状詳記区分コードCode } from "../codes";

export function mk症状詳記レコード({
  症状詳記区分,
  症状詳記データ,
}: {
  症状詳記区分: 症状詳記区分コードCode;
  症状詳記データ: string;
}): string {
  return [
    "SJ", // 1 レコード識別情報
    症状詳記区分, // 2
    症状詳記データ, // 3
  ].join(",");
}


