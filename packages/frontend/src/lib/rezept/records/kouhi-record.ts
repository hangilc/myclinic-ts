import type {  Visit } from "myclinic-model";
import { DateSet } from "../date-set";

export interface 公費レコードData {
  負担者番号: number;
  受給者番号: number;
  診療実日数: number;
  合計点数: number;
  負担金額?: number;
  公費給付対象外来一部負担金?: number;
}

export function mk公費レコード({
  負担者番号,
  受給者番号,
  診療実日数,
  合計点数,
  負担金額,
  公費給付対象外来一部負担金,
}: 公費レコードData): string {
  return [
    "KO", // 1 レコード識別情報
    負担者番号.toString(), // 2
    受給者番号.toString(), // 3
    "", // 4 任意給付区分
    診療実日数.toString(), // 5
    合計点数.toString(), // 6
    負担金額?.toString() ?? "", // 7
    公費給付対象外来一部負担金?.toString() ?? "", // 8
    "", // 9 公費給付対象入院一部負担金
    "", // 10 予備
    "", // 11 食事療養・生活療養回数
    "", // 12 食事療養・生活療養合計金額
  ].join(",");
}

// export function create公費レコード({
//   kouhi,
//   items,
//   futanKingaku,
//   souten,
// }: {
//   kouhi: Kouhi;
//   items: VisitItem[];
//   futanKingaku?: number;
//   souten: number;
// }): string {
//   return mk公費レコード({
//     負担者番号: kouhi.futansha,
//     受給者番号: kouhi.jukyuusha,
//     診療実日数: jitsuNissuu(kouhi.kouhiId, items),
//     合計点数: souten,
//     負担金額: futanKingaku,
//   })
// }

// function kouhiListIncludes(list: Kouhi[], kouhiId: number): boolean {
//   return list.findIndex(k => k.kouhiId === kouhiId) >= 0;
// }

export function kouhiRecordJitsuNissuu(kouhiId: number, visits: Visit[]): number {
  let ds = new DateSet();
  visits.forEach(visit => {
    const kouhiIdList = visit.kouhiIdList;
    if (visit.kouhiIdList.includes(kouhiId)) {
      ds.add(visit.visitedAt);
    }
  });
  return ds.length;
}

// export function kouhiRecordJitsuNissuu(kouhiId: number, items: VisitItem[]): number {
//   let ds = new DateSet();
//   items.forEach(item => {
//     const kouhiList = item.hoken.kouhiList;
//     if (kouhiListIncludes(kouhiList, kouhiId)) {
//       ds.add(item.visit.visitedAt);
//     }
//   });
//   return ds.length;
// }

