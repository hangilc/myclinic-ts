import type { HokenInfo, Kouhi, Koukikourei, Shahokokuho } from "myclinic-model";
import type { OnshiResult } from "onshi-result";
import type { LimitApplicationCertificateClassificationFlagLabel } from "onshi-result/codes";
import { KouhiOrderMap, RezeptShubetsuCodeBase, RezeptShubetuCodeOffset, レセプト特記事項コード, 都道府県コード, type レセプト特記事項コードCode } from "./codes";
import type { VisitItem } from "./visit-item";

export function formatYearMonth(year: number, month: number): string {
  let m = month.toString();
  if (m.length === 1) {
    m = "0" + m;
  }
  return `${year}${m}`;
}

export function extract都道府県コードfromAddress(addr: string): string {
  const m = /(...?)[都道府県]/.exec(addr);
  if (!m) {
    throw new Error("Cannot find 都道府県：" + addr);
  }
  const ken = m[1];
  const code = 都道府県コード[ken];
  if (!code) {
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
    if (order === undefined) {
      if (isマル都(futansha)) {
        order = 100
      } else {
        order = futansha;
      }
    }
    return order;

  }

  kouhiList.sort((a, b) => calcOrder(a.futansha) - calcOrder(b.futansha));
}

export function is国保(hokenshaBangou: number): boolean {
  return hokenshaBangou < 1000000;
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

function shahokokuhoRezeptShubetsOffset(shahokokuho: Shahokokuho): number {
  if (shahokokuho.koureiStore === 3) {
    return RezeptShubetuCodeOffset.高齢受給７割;
  } else if (shahokokuho.koureiStore > 0) {
    return RezeptShubetuCodeOffset.高齢受給一般;
  }
  if (shahokokuho.honninStore === 0) {
    return RezeptShubetuCodeOffset.家族;
  } else {
    return RezeptShubetuCodeOffset.本人;
  }
}

function koukikoureiRezeptShubetsuOffset(koukikourei: Koukikourei): number {
  if (koukikourei.futanWari === 3) {
    return RezeptShubetuCodeOffset.高齢受給７割;
  } else {
    return RezeptShubetuCodeOffset.高齢受給一般;
  }
}

export function resolve保険種別(hoken: HokenInfo): number {
  if (hoken.shahokokuho) {
    let base = RezeptShubetsuCodeBase.社保国保単独 + hoken.kouhiList.length * 10;
    let offset = shahokokuhoRezeptShubetsOffset(hoken.shahokokuho);
    return base + offset;
  } else if (hoken.koukikourei) {
    let base = RezeptShubetsuCodeBase.後期高齢単独 + hoken.kouhiList.length * 10;
    let offset = koukikoureiRezeptShubetsuOffset(hoken.koukikourei);
    return base + offset;
  } else {
    return RezeptShubetsuCodeBase.公費単独 + hoken.kouhiList.length * 10;
  }
}

export function findOnshiResultGendogaku(result: OnshiResult | undefined)
  : LimitApplicationCertificateClassificationFlagLabel | undefined {
  if (result === undefined) {
    return undefined;
  }
  if (result.isValid && result.resultList.length === 1) {
    const ri = result.resultList[0];
    const limit = ri.limitApplicationCertificateRelatedInfo;
    if (limit) {
      return limit.limitApplicationCertificateClassificationFlag;
    }
  }
  return undefined;
}

export function resolveGendogakuTokkiJikou(hoken: HokenInfo, gendo: LimitApplicationCertificateClassificationFlagLabel | undefined): レセプト特記事項コードCode | undefined {
  if (gendo) {
    switch (gendo) {
      case "ア":
      case "現役並みⅢ":
        return レセプト特記事項コード["区ア"];
      case "イ":
      case "現役並みⅡ":
        return レセプト特記事項コード["区イ"];
      case "ウ":
      case "現役並みⅠ":
        return レセプト特記事項コード["区ウ"];
      case "エ":
      case "一般":
        return レセプト特記事項コード["区エ"];
      case "オ":
      case "低所得Ⅱ":
      case "低所得Ⅰ":
        return レセプト特記事項コード["区オ"];
      case "低所得Ⅰ（老福）": {
        console.log("add '老福' to tekiyou", JSON.stringify(hoken));
        return レセプト特記事項コード["区オ"];
      }
      case "低所得Ⅰ（境）": {
        console.log("add '境界層該当' to tekiyou", JSON.stringify(hoken));
        return レセプト特記事項コード["区オ"];
      }
      case "オ（境）": {
        console.log("add '境界層該当' to tekiyou", JSON.stringify(hoken));
        return レセプト特記事項コード["区オ"];
      }
      case "一般Ⅱ": return レセプト特記事項コード["区カ"];
      case "一般Ⅰ": return レセプト特記事項コード["区キ"];
      default: {
        console.log("Unknown 限度額区分", gendo);
        return undefined;
      }
    }
  }
  if (hoken.koukikourei) {
    switch (hoken.koukikourei.futanWari) {
      case 3: return レセプト特記事項コード["区ア"];
      case 2: return レセプト特記事項コード["区カ"];
      case 1: return レセプト特記事項コード["区キ"];
    }
  } else if (hoken.shahokokuho) {
    switch (hoken.shahokokuho.koureiStore) {
      case 3: return レセプト特記事項コード["区ア"];
      case 2:
      case 1:
        return レセプト特記事項コード["区エ"];
      default: break;
    }
  }
  return undefined;
}

export function resolveGendo(items: VisitItem[]): LimitApplicationCertificateClassificationFlagLabel | undefined {
  let gendo: LimitApplicationCertificateClassificationFlagLabel | undefined = undefined;
  items.forEach(item => {
    const g = item.onshiResult?.resultList[0]?.limitApplicationCertificateRelatedInfo?.limitApplicationCertificateClassificationFlag;
    if( g ){
      gendo = g;
    }
  });
  return gendo;
}

export function hokenshaBangouOfHoken(hoken: HokenInfo): number {
  if( hoken.shahokokuho ){
    return hoken.shahokokuho.hokenshaBangou;
  } else if( hoken.koukikourei ){
    const n = parseInt(hoken.koukikourei.hokenshaBangou);
    if( n > 0 ){
      return n;
    }
  }
  throw new Error("Cannot resolve hokenshaBangou: " + JSON.stringify(hoken));
}
