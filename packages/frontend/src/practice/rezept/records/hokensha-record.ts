import { pad } from "@/lib/pad";
import type { HokenInfo } from "myclinic-model";
import { hokenshaBangouOfHoken } from "../util";
import type { VisitItem } from "../visit-item";

function mk保険者レコード({
  保険者番号,
  被保険者証記号,
  被保険者証番号,
  診療実日数,
  合計点数,
  医療保険負担金額,
}: {
  保険者番号: string;
  被保険者証記号?: string;
  被保険者証番号?: string;
  診療実日数: number;
  合計点数: number;
  医療保険負担金額?: number;
}): string {
  return [
    "HO", // 1 レコード識別情報
    保険者番号, // 2
    被保険者証記号 ?? "", // 3
    被保険者証番号 ?? "", // 4
    診療実日数.toString(), // 5
    合計点数.toString(), // 6
    "", // 7 予備
    "", // 8 食事療養・生活療養回数
    "", // 9 食事療養・生活療養合計金額
    "", // 10 職務上の事由
    "", // 11 証明書番号
    医療保険負担金額?.toString() ?? "", // 12
    "", // 13 減免区分
    "", // 14 減額割合
    "", // 15 減額金額
  ].join(",");
}

export function create保険者レコード({
  items
}: {
  items: VisitItem[];
}): string {
  const hoken = items[0].hoken;
  return mk保険者レコード({
    保険者番号: formatHokenshaBangou(hokenshaBangouOfHoken(hoken)),
    被保険者証記号: kigou(hoken),
    被保険者証番号: bangou(hoken),
    診療実日数: jitsuNissu(items),
    合計点数: souten(items),
  });
}

function formatHokenshaBangou(hokenshaBangou: number): string {
  if( hokenshaBangou < 1000000 ){
    return pad(hokenshaBangou, 8, " ");
  } else {
    return pad(hokenshaBangou, 8, "0");
  }
}

function kigou(hoken: HokenInfo): string | undefined {
  return hoken.shahokokuho?.hihokenshaKigou;
}

function bangou(hoken: HokenInfo): string | undefined {
  if( hoken.shahokokuho ){
    return hoken.shahokokuho.hihokenshaBangou;
  } else if( hoken.koukikourei ){
    return hoken.koukikourei.hihokenshaBangou;
  } else {
    return undefined;
  }
}

function jitsuNissu(items: VisitItem[]): number {
  const days: string[] = [];
  items
    .map(item => item.visit)
    .map(visit => visit.visitedAt.substring(0, 10))
    .forEach(d => {
      if( !days.includes(d) ){
        days.push(d);
      }
    })
  return days.length;
}

function souten(items: VisitItem[]): number {
  return items.reduce((acc, ele) => acc + ele.meisai.totalTen, 0);
}
