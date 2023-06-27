import type { 診療識別コードCode, 負担区分コードCode } from "../codes";

export function mkコメントレコード({
  診療識別,
  負担区分,
  コメントコード,
  文字データ,
}: {
  診療識別: 診療識別コードCode;
  負担区分: 負担区分コードCode;
  コメントコード: number;
  文字データ: string;
}): string {
  return [
    "CO", // 1 レコード識別情報
    診療識別, // 2
    負担区分, // 3
    コメントコード.toString(), // 4
    文字データ, // 5
  ].join(",");
}

