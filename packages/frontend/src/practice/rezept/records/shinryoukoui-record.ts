import type { 負担区分コードCode } from "../codes";
import { formatSanteibi } from "../util";

export interface 診療行為レコードData {
  診療識別: string;
  負担区分: 負担区分コードCode;
  診療行為コード: number;
  点数?: number;
  回数: number;
  コメントコード１?: number;
  コメント文字１?: string;
  コメントコード２?: number;
  コメント文字２?: string;
  コメントコード３?: number;
  コメント文字３?: string;
  算定日情報: Record<number, number>;
}

export function mk診療行為レコード({
  診療識別,
  負担区分,
  診療行為コード,
  点数,
  回数,
  コメントコード１,
  コメント文字１,
  コメントコード２,
  コメント文字２,
  コメントコード３,
  コメント文字３,
  算定日情報,
}: 診療行為レコードData): string {
  return [
    "SI", // 1 レコード識別情報
    診療識別, // 2
    負担区分, // 3
    診療行為コード.toString(), // 4
    "", // 5 数量データ
    点数 ?? "", // 6
    回数.toString(), // 7
    コメントコード１?.toString() ?? "", // 8
    コメント文字１ ?? "", // 9
    コメントコード２?.toString() ?? "", // 10
    コメント文字２ ?? "", // 11
    コメントコード３?.toString() ?? "", // 12
    コメント文字３ ?? "", // 13
    ...formatSanteibi(算定日情報), // 14 - 44
  ].join(",");
}

// export function create診療行為レコード({
//   item,
// }: {
//   item: ShinryoukouiItem,
// }): string {
//   return mk診療行為レコード({
//     診療識別: item.shikibetsucode,
//     負担区分: item.futanKubun,
//     診療行為コード: item.shinryoucode,
//     点数: item.tensuu,
//     回数: item.count,
//     算定日情報: item.santeibiInfo,
//   });
// }