import type { Kouhi } from "myclinic-model";
import { KouhiOrderMap, 都道府県コード } from "./codes";

export function formatYearMonth(year: number, month: number): string {
  let m = month.toString();
  if( m.length === 1 ){
    m = "0" + m;
  }
  return `${year}${m}`;
}

export function extract都道府県コードfromAddress(addr: string): string {
  const m = /(...?)[都道府県]/.exec(addr);
  if( !m ){
    throw new Error("Cannot find 都道府県：" + addr);
  }
  const ken = m[1];
  const code = 都道府県コード[ken];
  if( !code ){
    throw new Error("Cannot find 都道府県コード：" + ken);
  }
  return code;
}

export function sortKouhiList(kouhiList: Kouhi[]): void {
  function houbetsu(futansha: number): number {
    return Math.floor(futansha / 1000000);
  }

  function calcOrder(futansha: number): number {
    const hb = houbetsu(futansha);
    let order = KouhiOrderMap[hb];
    if( order === undefined ){
      if( isマル都(futansha) ){
        order = 100
      } else {
        order = futansha;
      }
    }
    return order;

  }

  kouhiList.sort((a, b) => calcOrder(a.futansha) - calcOrder(b.futansha));
}

export function isマル都(負担者番号: number): boolean {
  return [
    51136018, // 難病医療（特定疾患）
    83136010, // 難病医療
    51137016, // 特殊医療
    82138009, // 特殊医療
    82134008, // 小児精神病、被爆者の子に対する医療
    82137001, // 大気汚染関連疾病
    82137555, // 大気汚染関連疾病
    82137670, // 大気汚染関連疾病
    82137530, // 大気汚染関連疾病
    38136016, // Ｂ型・Ｃ型ウイルス肝炎治療
    38136024, // 肝がん・重度肝硬変医療
    87136008, // 妊娠高血圧症候群等
    93137008, // 結核一般医療
    83133007, // 精神通院医療
  ].includes(負担者番号);
}
