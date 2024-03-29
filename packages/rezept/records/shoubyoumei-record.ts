import { pad } from "../helper";
import { 転帰区分コード, type 転帰区分コードCode } from "../codes";

export function mk症病名レコード({
  傷病名コード,
  診療開始日,
  転帰区分,
  修飾語コード,
  主傷病,
}: {
  傷病名コード: number;
  診療開始日: string;
  転帰区分: 転帰区分コードCode;
  修飾語コード: string;
  主傷病: boolean;
}): string {
  return [
    "SY", // 1 レコード識別情報
    pad(傷病名コード.toString(), 7, "0"), // 2
    診療開始日, // 3
    転帰区分.toString(), // 4
    修飾語コード, // 5
    "", // 6 傷病名称（0000999 の場合使用）
    主傷病 ? "01" : "", // 7
    "", // 8 補足コメント
  ].join(",");
}

export function endReasonToKubun(endReason: string): 転帰区分コードCode {
  switch(endReason){
    case "C": return 転帰区分コード.治ゆ;
    case "S": return 転帰区分コード["中 止（転医）"];
    case "D": return 転帰区分コード.死亡;
    case "N": return 転帰区分コード["治ゆ、死亡、中止以外"];
    default: throw new Error("Unknown end reason: " + endReason);
  }
}