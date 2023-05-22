import type { 負担区分コードCode } from "../codes";
import { formatSanteibi } from "../util";
import type { TokuteikizaiItem } from "../visit-item";

function mk特定器材レコード({
  診療識別,
  負担区分,
  特定器材コード,
  使用量,
  点数,
  回数,
  コメントコード１,
  コメント文字１,
  コメントコード２,
  コメント文字２,
  コメントコード３,
  コメント文字３,
  算定日情報,
}: {
  診療識別: string;
  負担区分: 負担区分コードCode;
  特定器材コード: number;
  使用量: number;
  点数?: number;
  回数: number;
  コメントコード１?: number;
  コメント文字１?: string;
  コメントコード２?: number;
  コメント文字２?: string;
  コメントコード３?: number;
  コメント文字３?: string;
  算定日情報: Record<number, number>;
}): string {
  return [
    "TO", // 1 レコード識別情報
    診療識別, // 2
    負担区分, // 3
    特定器材コード.toString(), // 4
    使用量, // 5
    点数?.toString() ?? "", // 6
    回数.toString(), // 7
    "", // 8 単位
    "", // 9 単価
    "", // 10 予備
    "", // 11 商品名及び規格又はサイズ
    コメントコード１?.toString() ?? "", // 12
    コメント文字１ ?? "", // 13
    コメントコード２?.toString() ?? "", // 14
    コメント文字２ ?? "", // 15
    コメントコード３?.toString() ?? "", // 16
    コメント文字３ ?? "", // 17
    ...formatSanteibi(算定日情報), // 18 - 48
  ].join(",");
}

export function create特定器材レコード({
  item,
}: {
  item: TokuteikizaiItem;
}): string {
  return mk特定器材レコード({
    診療識別: item.shikibetsucode,
    負担区分: item.futanKubun,
    特定器材コード: item.kizaicode,
    使用量: item.amount,
    点数: item.tensuu,
    回数: item.count,
    算定日情報: item.santeibiInfo,
  });
}
