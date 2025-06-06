import { type ShotokuKubunCode } from "./codes";

export type ShotokuKubunEx = ShotokuKubunCode | "不明";

export type HeiyouKouhi = "none" | "nanbyou" | "seikatsuhogo" | "other"

const UNLIMITED = 10000000;

export interface GendogakuOptions {
  isUnder70: boolean;
  shotokuKubun: ShotokuKubunEx;
  iryouhi: number;
  isTasuuGaitou: boolean;
  isNyuuin: boolean;
  heiyouKouhi: HeiyouKouhi,
  isBirthdayMonth75: boolean;
  marucho: number | undefined;
  isKoukikourei: boolean;
}

// ７０歳になる月の翌月から限度額計算変更（１日生まれの場合はその月から）
export function isUnder70(rezeptYear: number, rezeptMonth: number,
  birthdateYear: number, birthdateMonth: number, birthdateDay: number): boolean {
  const a = rezeptYear - birthdateYear;
  if (a > 70) {
    return false;
  } else if (a === 70) {
    if (birthdateDay === 1) {
      return rezeptMonth < birthdateMonth;
    } else {
      return rezeptMonth <= birthdateMonth;
    }
  } else {
    return true;
  }
}

export function isBirthday75(rezeptYear: number, rezeptMonth: number,
  birthdateYear: number, birthdateMonth: number, birthdateDay: number): boolean {
  if (birthdateDay === 1) {
    return false;
  }
  if (rezeptMonth !== birthdateMonth) {
    return false;
  } else {
    const age = rezeptYear - birthdateYear;
    return age === 75;
  }
}

export function isSeikatsuHogo(houbetsuBangou: number): boolean {
  return houbetsuBangou === 12;
}

// const TokuteiKyuufuHoubetsuBangou = [
//   18, // 原子爆弾被爆者に対する援護に関する法律
//   52, // 児童福祉法による小児慢性特定疾病医療費
//   21, 15, 16, 24, // 障害者自立支援法
//   20, // 精神保健及び精神障害者福祉に関する法律による措置入院
//   22, // 麻薬及び向精神薬取締法による入院措置
//   23, // 母子保健法による養育医療
//   29, 10, 11, // 感染症の予防及び感染症の患者に対する医療に関する法律
//   66, // 石綿による健康被害の救済に関する法律
//   62, // 特定Ｂ型肝炎ウイルス感染者給付金等の支給に関する特別措置法
//   51, 54 // 難病
// ]

// export function isTokuteiKyuufu(houbetsuBangou: number): boolean {
//   return TokuteiKyuufuHoubetsuBangou.includes(houbetsuBangou);
// }

export function isNanbyou(houbetsuBangou: number): boolean {
  switch(houbetsuBangou) {
    case 51: case 54:
    case 52: { // 小児慢性 
      return true;
    }
    default: return false;
  }
}

export function classifyKouhi(houbetsuBangouList: number[]): HeiyouKouhi {
  for (const h of houbetsuBangouList) {
    if (isNanbyou(h)) {
      return "nanbyou";
    }
    if (isSeikatsuHogo(h)) {
      return "seikatsuhogo";
    }
    return "other";
  }
  return "none";
}


export function calcGendogaku(opts: GendogakuOptions): number {
  if (opts.isUnder70 && !opts.isKoukikourei) { // ７０歳未満
    return under70(opts);
  } else { // ７０歳以上
    return kourei(opts);
  }
}

export function hairyosochi(iryouhi: number, isBirthday75: boolean): { gendogaku: number, limitApplied: boolean } {
  const g = 6000 + Math.max(0, (iryouhi - 30000) * 0.1);
  const limit = isBirthday75 ? 9000 : 18000;
  if (g >= limit) {
    return { gendogaku: limit, limitApplied: true };
  } else {
    return { gendogaku: Math.round(g), limitApplied: false };
  }
}

function under70(opts: GendogakuOptions): number {
  function regular(): number {
    switch (opts.shotokuKubun) {
      case "ア": return opts.isTasuuGaitou ? 140100 : proportional(252600, opts.iryouhi, 842000);
      case "イ": return opts.isTasuuGaitou ? 93000 : proportional(167400, opts.iryouhi, 558000);
      case "ウ": return opts.isTasuuGaitou ? 44400 : proportional(80100, opts.iryouhi, 267000);
      case "エ": return opts.isTasuuGaitou ? 44400 : 57600;
      case "オ": return opts.isTasuuGaitou ? 24600 : 35400;
      case "不明": return UNLIMITED;
    }
    // throw new Error("Cannot determine gendogaku.");
    console.log("unhandled shotokuKubun", opts.shotokuKubun);
    return UNLIMITED;
  }
  if( opts.marucho ){
    return fixed(opts.marucho, opts.isBirthdayMonth75);
  }
  if (opts.heiyouKouhi === "seikatsuhogo") {
    return 35400;
  }
  if (opts.heiyouKouhi === "other") {
    return proportional(80100, opts.iryouhi, 267000, false);
  }
  if (opts.heiyouKouhi === "nanbyou") {
    if (opts.isNyuuin) {
      return regular();
    } else {
      switch (opts.shotokuKubun) {
        case "ア": return proportional(252600, opts.iryouhi, 842000);
        case "イ": return proportional(167400, opts.iryouhi, 558000);
        case "ウ": return proportional(80100, opts.iryouhi, 267000);
        case "エ": return 57600;
        case "オ": return 35400;
        case "不明": return UNLIMITED;
      }
    }
    throw new Error("Cannot determine gendogaku (nanbyou under70)");
  }
  return regular();
}

function kourei(opts: GendogakuOptions): number {
  function g3(isTasuuGaitou: boolean): number {
    return isTasuuGaitou ?
      fixed(140100, opts.isBirthdayMonth75) :
      proportional(252600, opts.iryouhi, 842000, opts.isBirthdayMonth75);
  }
  function g2(isTasuuGaitou: boolean): number {
    return isTasuuGaitou ?
      fixed(93000, opts.isBirthdayMonth75) :
      proportional(167400, opts.iryouhi, 558000, opts.isBirthdayMonth75);
  }
  function g1(isTasuuGaitou: boolean): number {
    return isTasuuGaitou ?
      fixed(44400, opts.isBirthdayMonth75) :
      proportional(80100, opts.iryouhi, 267000, opts.isBirthdayMonth75);
  }
  function nyuuinIppan(): number {
    return fixed(opts.isTasuuGaitou ? 44400 : 57600, opts.isBirthdayMonth75);
  }
  function gairaiIppan(): number {
    return fixed(18000, opts.isBirthdayMonth75);
  }
  function nyuuinTeishotoku2(): number {
    return fixed(24600, opts.isBirthdayMonth75);
  }

  function nyuuinTeishotoku1(): number {
    return fixed(15000, opts.isBirthdayMonth75);
  }
  function gairaiTeishotoku(): number {
    return fixed(8000, opts.isBirthdayMonth75);
  }

  if( opts.marucho ){
    return fixed(opts.marucho, opts.isBirthdayMonth75);
  }
  if (opts.heiyouKouhi === "seikatsuhogo") {
    return fixed(opts.isNyuuin ? 15000 : 8000, opts.isBirthdayMonth75);
  } 
  if (opts.heiyouKouhi === "other") {
    return fixed(opts.isNyuuin ? 57600 : 18000, opts.isBirthdayMonth75);
  } 
  if (opts.heiyouKouhi === "nanbyou") {
    if (opts.isNyuuin) {
      switch (opts.shotokuKubun) {
        case "現役並みⅢ": return g3(opts.isTasuuGaitou);
        case "現役並みⅡ": return g2(opts.isTasuuGaitou);
        case "現役並みⅠ": return g1(opts.isTasuuGaitou);
        case "一般": case "一般Ⅱ": case "一般Ⅰ": return nyuuinIppan();
        case "低所得Ⅱ": return nyuuinTeishotoku2();
        case "低所得Ⅰ": return nyuuinTeishotoku1();
        case "不明": return UNLIMITED;
      }
      throw new Error("Cannot determine gendogaku.");
    } else {
      switch (opts.shotokuKubun) {
        case "現役並みⅢ": return g3(false);
        case "現役並みⅡ": return g2(false);
        case "現役並みⅠ": return g1(false);
        case "一般": case "一般Ⅱ": case "一般Ⅰ": return gairaiIppan();
        case "低所得Ⅱ": case "低所得Ⅰ": return gairaiTeishotoku();
        case "不明": return UNLIMITED;
      }
      throw new Error("Cannot determine gendogaku.");
    }
  } 
  { // 医療保険
    if (opts.isNyuuin) {
      switch (opts.shotokuKubun) {
        case "現役並みⅢ": return g3(opts.isTasuuGaitou);
        case "現役並みⅡ": return g2(opts.isTasuuGaitou);
        case "現役並みⅠ": return g1(opts.isTasuuGaitou);
        case "一般": case "一般Ⅱ": case "一般Ⅰ": return nyuuinIppan();
        case "低所得Ⅱ": return nyuuinTeishotoku2();
        case "低所得Ⅰ": return nyuuinTeishotoku1();
        case "不明": return UNLIMITED;
      }
      throw new Error("Cannot determine gendogaku.");
    } else {
      switch (opts.shotokuKubun) {
        case "現役並みⅢ": return g3(opts.isTasuuGaitou);
        case "現役並みⅡ": return g2(opts.isTasuuGaitou);
        case "現役並みⅠ": return g1(opts.isTasuuGaitou);
        case "一般": case "一般Ⅱ": case "一般Ⅰ": return gairaiIppan();
        case "低所得Ⅱ": case "低所得Ⅰ": return gairaiTeishotoku();
        case "不明": return UNLIMITED;
      }
      throw new Error("Cannot determine gendogaku.");
    }
  }
}

function proportional(base: number, iryouhi: number, offset: number, isBirthday75: boolean = false): number {
  if (isBirthday75) {
    base /= 2.0;
    offset /= 2.0;
  }
  return Math.round(base + Math.max(0, (iryouhi - offset) * 0.01));
}

function fixed(value: number, isBirthday75: boolean): number {
  if (isBirthday75) {
    value /= 2.0;
  }
  return Math.round(value);
}
