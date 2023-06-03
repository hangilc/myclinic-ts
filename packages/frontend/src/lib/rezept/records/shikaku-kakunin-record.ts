export function mk資格確認レコード({
  確認区分コード,
  枝番,
}: {
  確認区分コード?: string;
  枝番?: string;
}): string {
  return [
    "SN", // 1 レコード識別情報
    "1", // 2 負担者種別コード（保険）
    確認区分コード?.toString() ?? "01", // 3 default:（医療機関窓口）
    "", // 4 保険者番号等（資格確認）
    "", // 5 被保険者証（手帳）等の記号（資格確認）
    "", // 6 被保険者証（手帳）等の番号（資格確認）
    枝番?.toString() ?? "", // 7 枝番
    "", // 8 受給者番号
    "", // 9 予備
  ].join(",");
}

// export function create資格確認レコード({
//   edaban,
// }: {
//   edaban?: string;
// }): string {
//   return mk資格確認レコード({
//     枝番: edaban
//   });
// }