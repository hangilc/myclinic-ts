import { pad } from "@/lib/pad";
import type { Koukikourei, Shahokokuho, Visit } from "myclinic-model";

export interface 保険者レコードData {
  保険者番号: string;
  被保険者証記号?: string;
  被保険者証番号?: string;
  診療実日数: number;
  合計点数: number;
  医療保険負担金額?: number;
}

export function mk保険者レコード({
  保険者番号,
  被保険者証記号,
  被保険者証番号,
  診療実日数,
  合計点数,
  医療保険負担金額,
}: 保険者レコードData): string {
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

// function create保険者レコード({
//   items,
//   souten,
//   futanKingaku,
// }: {
//   items: VisitItem[];
//   souten: number;
//   futanKingaku?: number;
// }): string {
//   const hoken = items[0].hoken;
//   return mk保険者レコード({
//     保険者番号: formatHokenshaBangou(hokenshaBangouOfHoken(hoken)),
//     被保険者証記号: adjustOptString(kigou(hoken)),
//     被保険者証番号: bangou(hoken),
//     診療実日数: jitsuNissu(items),
//     合計点数: souten,
//     医療保険負担金額: futanKingaku,
//   });
// }

export function formatHokenshaBangou(hokenshaBangou: number): string {
  if (hokenshaBangou < 1000000) {
    return pad(hokenshaBangou, 8, " ");
  } else {
    return pad(hokenshaBangou, 8, "0");
  }
}

export function hokenshaRecordKigou(shahokokuho: Shahokokuho | undefined): string | undefined {
  return shahokokuho?.hihokenshaKigou;
}

export function hokenshaRecordBangou(shahokokuho: Shahokokuho | undefined, koukikourei: Koukikourei | undefined): string | undefined {
  if (shahokokuho) {
    return shahokokuho.hihokenshaBangou;
  } else if (koukikourei) {
    return koukikourei.hihokenshaBangou;
  } else {
    return undefined;
  }
}

export function hokenRecordJitsuNissu(visits: Visit[]): number {
  const days: string[] = [];
  visits
    .map(visit => visit.visitedAt.substring(0, 10))
    .forEach(d => {
      if (!days.includes(d)) {
        days.push(d);
      }
    })
  return days.length;
}

