import { ShotokuKubunCode } from "./codes";

export type ShotokuKubunEx = ShotokuKubunCode | "不明";

export interface GendogakuOptions {
  isUnder70: boolean;
  shotokuKubun: ShotokuKubunEx;
  iryouhi: number;
  isTasuuGaitou: boolean;
  isNyuuin: boolean;
  hasTokuteiKyuufu: boolean;
  hasSeikatsuHogo: boolean;
  hasOtherKouhi: boolean;
  isBirthday75: boolean;
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

const TokuteiKyuufuHoubetsuBangou = [
  18, // 原子爆弾被爆者に対する援護に関する法律
  52, // 児童福祉法による小児慢性特定疾病医療費
  21, 15, 16, 24, // 障害者自立支援法
  20, // 精神保健及び精神障害者福祉に関する法律による措置入院
  22, // 麻薬及び向精神薬取締法による入院措置
  23, // 母子保健法による養育医療
  29, 10, 11, // 感染症の予防及び感染症の患者に対する医療に関する法律
  66, // 石綿による健康被害の救済に関する法律
  62, // 特定Ｂ型肝炎ウイルス感染者給付金等の支給に関する特別措置法
  51, 54 // 難病
]

export function isTokuteiKyuufu(houbetsuBangou: number): boolean {
  return TokuteiKyuufuHoubetsuBangou.includes(houbetsuBangou);
}

export function calcGendogaku(opts: GendogakuOptions): number {
  let gendogaku: number;
  if (opts.isUnder70) { // ７０歳未満
    gendogaku = under70(opts);
  } else { // ７０歳以上
    gendogaku = kourei(opts);
  }
  return Math.round(gendogaku);
}

export function hairyosochi(iryouhi: number, isBirthday75: boolean): { gendogaku: number, limitApplied: boolean } {
  const g = 6000 + (iryouhi - 30000) * 0.1;
  const limit = isBirthday75 ? 9000 : 18000;
  if (g >= limit) {
    return { gendogaku: limit, limitApplied: true };
  } else {
    return { gendogaku: Math.round(g), limitApplied: false };
  }
}

function under70(opts: GendogakuOptions): number {
  if (opts.hasSeikatsuHogo) {
    return 35400;
  }
  if (opts.hasOtherKouhi) {
    return proportional(80100, opts.iryouhi, 267000);
  }
  if (opts.hasTokuteiKyuufu) {
    if (opts.isNyuuin) {
      switch (opts.shotokuKubun) {
        case "ア": return opts.isTasuuGaitou ? 140100 : proportional(252600, opts.iryouhi, 842000);
        case "イ": return opts.isTasuuGaitou ? 93000 : proportional(167400, opts.iryouhi, 558000);
        case "ウ": return opts.isTasuuGaitou ? 44400 : proportional(80100, opts.iryouhi, 267000);
        case "エ": return opts.isTasuuGaitou ? 44400 : 57600;
        case "オ": return opts.isTasuuGaitou ? 24600 : 35400;
      }
    } else {
      switch (opts.shotokuKubun) {
        case "ア": return proportional(252600, opts.iryouhi, 842000);
        case "イ": return proportional(167400, opts.iryouhi, 558000);
        case "ウ": return proportional(80100, opts.iryouhi, 267000);
        case "エ": return 57600;
        case "オ": return 35400;
      }
    }
    throw new Error("Cannot determine gendogaku (nanbyou under70)");
  }
  switch (opts.shotokuKubun) {
    case "ア": return opts.isTasuuGaitou ? 140100 : proportional(252600, opts.iryouhi, 842000);
    case "イ": return opts.isTasuuGaitou ? 93000 : proportional(167400, opts.iryouhi, 558000);
    case "ウ": return opts.isTasuuGaitou ? 44400 : proportional(80100, opts.iryouhi, 267000);
    case "エ": return opts.isTasuuGaitou ? 44400 : 57600;
    case "オ": return opts.isTasuuGaitou ? 24600 : 35400;
  }
  throw new Error("Cannot calculate gendogaku.");
}

function kourei(opts: GendogakuOptions): number {
  if (opts.hasSeikatsuHogo) {
    return opts.isNyuuin ? 15000 : 8000;
  }
  if (opts.hasOtherKouhi) {
    return opts.isNyuuin ? 57600 : 18000;
  }
  if (opts.hasTokuteiKyuufu) {
    if (opts.isNyuuin) {
      switch (opts.shotokuKubun) {
        case "現役並みⅢ": return opts.isTasuuGaitou ? 140100 : proportional(252600, opts.iryouhi, 842000);
        case "現役並みⅡ": return opts.isTasuuGaitou ? 93000 : proportional(167400, opts.iryouhi, 558000);
        case "現役並みⅠ": return opts.isTasuuGaitou ? 44400 : proportional(80100, opts.iryouhi, 267000);
        case "一般": case "一般Ⅱ": case "一般Ⅰ": return opts.isTasuuGaitou ? 44400 : 57600;
        case "低所得Ⅱ": return 24600;
        case "低所得Ⅰ": return 15000;
      }
    } else {
      switch (opts.shotokuKubun) {
        case "現役並みⅢ": proportional(252600, opts.iryouhi, 842000);
        case "現役並みⅡ": proportional(167400, opts.iryouhi, 558000);
        case "現役並みⅠ": proportional(80100, opts.iryouhi, 267000);
        case "一般": case "一般Ⅱ": case "一般Ⅰ": return 18000;
        case "低所得Ⅱ": // fall through
        case "低所得Ⅰ": return 8000;
      }
    }
    throw new Error("Cannot determine gendogaku (nanbyou kourei)");
  }
  if (opts.isNyuuin) {
    switch (opts.shotokuKubun) {
      case "現役並みⅢ": return opts.isTasuuGaitou ? 140100 : proportional(252600, opts.iryouhi, 842000);
      case "現役並みⅡ": return opts.isTasuuGaitou ? 93000 : proportional(167400, opts.iryouhi, 558000);
      case "現役並みⅠ": return opts.isTasuuGaitou ? 44400 : proportional(80100, opts.iryouhi, 267000);
      case "一般": case "一般Ⅱ": case "一般Ⅰ": return opts.isTasuuGaitou ? 44400 : 57600;
      case "低所得Ⅱ": return 24600;
      case "低所得Ⅰ": return 15000;
    }
  } else {
    switch (opts.shotokuKubun) {
      case "現役並みⅢ": return opts.isTasuuGaitou ? 140100 : proportional(252600, opts.iryouhi, 842000);
      case "現役並みⅡ": return opts.isTasuuGaitou ? 93000 : proportional(167400, opts.iryouhi, 558000);
      case "現役並みⅠ": return opts.isTasuuGaitou ? 44400 : proportional(80100, opts.iryouhi, 267000);
      case "一般": case "一般Ⅱ": case "一般Ⅰ": return 18000;
      case "低所得Ⅱ": // fall through
      case "低所得Ⅰ": return 8000;
    }
  }
  throw new Error("Cannot calculate gendogaku.");
}

function proportional(base: number, iryouhi: number, offset: number): number {
  return base + (iryouhi - offset) * 0.01;
}