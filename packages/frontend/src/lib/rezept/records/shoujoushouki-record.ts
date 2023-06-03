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

// export function create症状詳記レコード({
//   shoujoushoukiKubun,
//   text,
// }: {
//   shoujoushoukiKubun: 症状詳記区分コードCode;
//   text: string;
// }): string {
//   return mk症状詳記レコード({
//     症状詳記区分: shoujoushoukiKubun,
//     症状詳記データ: text,
//   });
// }
