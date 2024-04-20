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
  if (opts.isUnder70) { // ７０歳未満
    if (opts.hasSeikatsuHogo) {
      return 35400;
    }
    if (opts.hasOtherKouhi) {
      return proportional(80100, opts.iryouhi, 267000);
    }
    if (opts.hasMarucho) {
      return opts.hasMarucho;
    }
    if (opts.hasTokuteiKyuufu) {
      if (opts.isNyuuin) {
        if (opts.isTasuuGaitou) {
          return under70TasuuGaitou(opts.shotokuKubun);
        } else {
          return under70(opts.shotokuKubun, opts.iryouhi);
        }
      } else { // 難病医療等、外来
        return under70(opts.shotokuKubun, opts.iryouhi);
      }
    } else {
      if (opts.isTasuuGaitou === true) {
        return under70TasuuGaitou(opts.shotokuKubun);
      } else {
        return under70(opts.shotokuKubun, opts.iryouhi);
      }
    }
  } else { // ７０歳以上
    if (opts.hasSeikatsuHogo) {
      return opts.isNyuuin ? 15000 : 8000;
    }
    if (opts.hasOtherKouhi) {
      return opts.isNyuuin ? 57600 : 18000;
    }
    if (opts.hasMarucho) {
      return opts.hasMarucho;
    }
    if (opts.hasTokuteiKyuufu) {
      if (opts.isNyuuin) {
        return kourei(opts.shotokuKubun, opts.iryouhi, opts.isNyuuin);
      }
    } else {
      if (opts.isTasuuGaitou) {
        return kourei(opts.shotokuKubun, opts.iryouhi, opts.isNyuuin);
      } else {
        return kourei(opts.shotokuKubun, opts.iryouhi, opts.isNyuuin);
      }
    }
  }
  throw new Error("Cannot calculate gendogaku.");
}

type GendoType = "hoken" | "nanbyou" | "seikatsuhogo" | "kouhi";

function under70(gendoType: GendoType, isNyuuin: boolean, shotokuKubun: ShotokuKubunEx,
  iryouhi: number, isTasuuGaitou: boolean): number {
  if (gendoType === "seikatsuhogo") {
    return 35400;
  }
  if (gendoType === "kouhi") {
    return proportional(80100, iryouhi, 267000);
  }
  if (isTasuuGaitou) {
    if (gendoType === "hoken" || gendoType === "nanbyou" && isNyuuin)
      switch (shotokuKubun) {
        case "ア": return 140100;
        case "イ": return 93000;
        case "ウ": return 44400;
        case "エ": return 44400;
        case "オ": return 24600;
      }
  }
  switch (shotokuKubun) {
    case "ア": return proportional(252600, iryouhi, 842000);
    case "イ": return proportional(167400, iryouhi, 558000);
    case "ウ": return proportional(80100, iryouhi, 267000);
    case "エ": return 57600;
    case "オ": return 35400;
  }
  throw new Error("Cannot calculate gendogaku.");
}

function kourei(gendoType: GendoType, isNyuuin: boolean, shotokuKubun: ShotokuKubunEx,
  iryouhi: number, isTasuuGaitou: boolean): number {
  if (gendoType === "seikatsuhogo") {
    return isNyuuin ? 15000 : 8000;
  }
  if (gendoType === "kouhi") {
    return isNyuuin ? 57600 : 18000;
  }
  if (isTasuuGaitou) {
    if (gendoType === "hoken" || gendoType === "nanbyou" && isNyuuin) {
      switch (shotokuKubun) {
        case "現役並みⅢ": return 140100;
        case "現役並みⅡ": return 93000;
        case "現役並みⅠ": return 44400;
      }
    }
    if ((gendoType === "hoken" || gendoType === "nanbyou" && isNyuuin) && shotokuKubun === "一般") {
      return 444000;
    }
  }
  switch (shotokuKubun) {
    case "現役並みⅢ": return proportional(252600, iryouhi, 842000);
    case "現役並みⅡ": return proportional(167400, iryouhi, 558000);
    case "現役並みⅠ": return proportional(80100, iryouhi, 267000);
  }
    case "一般": {
      if (isNyuuin) {
        return 57600;
      } else {
        return 18000;
      }
    }
    case "オ": case "低所得Ⅱ": case "低所得Ⅰ": {
      if (isNyuuin) {
        switch (shotokuKubun) {
          case "低所得Ⅱ": return 24600;
          case "低所得Ⅰ": return 15000;
          default: throw new Error("Missing shotoku kubun");
        }
      } else {
        return 8000;
      }
    }
    default: throw new Error("Cannot calculate gendogaku.");
  }
}

function koureiTasuuGaitou(shotokuKubun: ShotokuKubunCode): number {
  switch (shotokuKubun) {
    case "ア": case "現役並みⅢ": return 140100;
    case "イ": case "現役並みⅡ": return 93000;
    case "ウ": case "現役並みⅠ": return 44400;
    case "エ": case "一般": return 44400;
    case "低所得Ⅱ": return 24600;
    case "低所得Ⅰ": return 15000;
    default: throw new Error("Cannot calculate gendogaku.");
  }
}

function proportional(base: number, iryouhi: number, offset: number): number {
  return base + (iryouhi - offset) * 0.01;
}