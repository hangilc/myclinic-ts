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

// export function createコメントレコード({
//   shikibetsucode,
//   futanKubun,
//   commentcode,
//   text,
// }: {
//   shikibetsucode: string;
//   futanKubun: 負担区分コードCode;
//   commentcode: number;
//   text: string;
// }): string {
//   return mkコメントレコード({
//     診療識別: shikibetsucode,
//     負担区分: futanKubun,
//     コメントコード: commentcode,
//     文字データ: text,
//   });
// }
