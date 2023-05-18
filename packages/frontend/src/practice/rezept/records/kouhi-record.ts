import type { Kouhi } from "myclinic-model";
import type { VisitItem } from "../visit-item";

function mk公費レコード({
  負担者番号,
  受給者番号,
  診療実日数,
}: {
  負担者番号: number,
  受給者番号: number,
  診療実日数: number,
}): string {
  return [
    "KO", // 1 レコード識別情報
    負担者番号.toString(), // 2
    受給者番号.toString(), // 3
    "", // 4 任意給付区分
    診療実日数.toString(), // 5
  ].join(",");
}

export function create公費レコード({
  kouhi,
  items,
}: {
  kouhi: Kouhi,
  items: VisitItem[],
}): string {
  return mk公費レコード({
    負担者番号: kouhi.futansha,
    受給者番号: kouhi.jukyuusha,
    診療実日数: jitsuNissuu(kouhi.kouhiId, items),
  })
}

function jitsuNissuu(kouhiId: number, items: VisitItem[]): number {
  let d = 0;
  items.forEach(item => {
    const kouhiList = item.hoken.kouhiList;
    const index = kouhiList.findIndex(k => k.kouhiId === kouhiId);
    if( index >= 0 ){
      d += 1;
    }
  })
  return d;
}