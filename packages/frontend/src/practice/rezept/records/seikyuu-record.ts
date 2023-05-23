function mk診療報酬請求書レコード({
  総件数,
  総合計点数,
}: {
  総件数: number;
  総合計点数: number;
}): string {
  return [
    "GO", // 1 レコード識別情報
    総件数, // 2
    総合計点数, // 3
    "99", // 4 マルチボリューム識別情報
  ].join(",");
}

export function create診療報酬請求書レコード({
  rezeptCount,
  totalTen,
}: {
  rezeptCount: number;
  totalTen: number;
}): string {
  return mk診療報酬請求書レコード({
    総件数: rezeptCount,
    総合計点数: totalTen,
  });
}