import type { 負担区分コードCode } from "../codes";
import { formatSanteibi } from "../helper";

export interface 医薬品レコードData {
  診療識別: string;
  負担区分: 負担区分コードCode;
  医薬品コード: number;
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
}

export function mk医薬品レコード({
  診療識別,
  負担区分,
  医薬品コード,
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
}: 医薬品レコードData): string {
  return [
    "IY", // 1 レコード識別情報
    診療識別, // 2
    負担区分, // 3
    医薬品コード.toString(), // 4
    使用量, // 5
    点数?.toString() ?? "", // 6
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

