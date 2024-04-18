import type { ShotokuKubunCode } from "./codes";

export interface GendogakuOptions {
  hasKuniKouhi?: boolean;
  isTasuuGaitou?: boolean;
  isBirthdayMonth75?: boolean;
  isNyuuin?: boolean;
  isSeikatsuHogo?: boolean;
}

export function calcGendogaku(shotokuKubun: ShotokuKubunCode, iryouhi: number, opts: GendogakuOptions = {}): number {
  const isBirthdayMonth75: boolean = opts.isBirthdayMonth75 ?? false;
  const isNyuuin: boolean = opts.isNyuuin ?? false;
  if( opts.isSeikatsuHogo ){
    return gendogakuOfSeikatsuHogo(shotokuKubun, isBirthdayMonth75, isNyuuin);
  } else if (opts.hasKuniKouhi) {
    return gendogakuKuniKouhi(shotokuKubun, iryouhi, isBirthdayMonth75, isNyuuin);
  } else if (opts.isTasuuGaitou) {
    return gendogakuTasuuGaitou(shotokuKubun, isBirthdayMonth75, isNyuuin);
  }
  return gendogaku(shotokuKubun, iryouhi, isBirthdayMonth75, isNyuuin);
}

function gendogaku(
  shotokuKubun: ShotokuKubunCode,
  iryouhi: number,
  isBirthdayMonth75: boolean,
  isNyuuin: boolean
): number {
  return Math.round(gendogakuFrac(shotokuKubun, iryouhi, isBirthdayMonth75, isNyuuin));
}

function gendogakuFrac(
  shotokuKubun: ShotokuKubunCode,
  iryouhi: number,
  isBirthdayMonth75: boolean,
  isNyuuin: boolean
): number {
  switch (shotokuKubun) {
    case "ア": case "現役並みⅢ":
      return calc(252600, iryouhi, 842000, 0.01, isBirthdayMonth75);
    case "イ": case "現役並みⅡ":
      return calc(167400, iryouhi, 558000, 0.01, isBirthdayMonth75);
    case "ウ": case "現役並みⅠ":
      return calc(80100, iryouhi, 267000, 0.01, isBirthdayMonth75);
    case "エ":
      return fixed(57600, isBirthdayMonth75);
    case "オ": case "オ（境）":
      return fixed(35400, isBirthdayMonth75);
    case "一般Ⅱ":
      return Math.min(
        fixed(18000, isBirthdayMonth75),
        calc(6000, iryouhi, 30000, 0.10, false)
      ); // 配慮措置（令和７年９月30日まで）
    case "一般Ⅰ": case "一般":
      if (isNyuuin) {
        return fixed(57600, isBirthdayMonth75);
      } else {
        return fixed(18000, isBirthdayMonth75);
      }
    case "低所得Ⅱ":
      if (isNyuuin) {
        return fixed(24600, isBirthdayMonth75);
      } else {
        return fixed(8000, isBirthdayMonth75);
      }
    case "低所得Ⅰ": case "低所得Ⅰ（老福）": case "低所得Ⅰ（境）":
      if (isNyuuin) {
        return fixed(15000, isBirthdayMonth75);
      } else {
        return fixed(8000, isBirthdayMonth75);
      }
  }
}

function gendogakuKuniKouhi(
  shotokuKubun: ShotokuKubunCode,
  iryouhi: number,
  isBirthdayMonth75: boolean,
  isNyuuin: boolean,
): number {
  switch (shotokuKubun) {
    case "ア":
    case "イ":
    case "ウ":
    case "エ":
    case "オ":
      return calc(80100, iryouhi, 267000, 0.01, isBirthdayMonth75);
    case "現役並みⅢ":
    case "現役並みⅡ":
    case "現役並みⅠ":
    case "一般":
    case "一般Ⅱ":
    case "一般Ⅰ":
    case "低所得Ⅱ":
    case "低所得Ⅰ":
      if( isNyuuin ){
        return fixed(57600, isBirthdayMonth75);
      } else {
        return fixed(18000, isBirthdayMonth75);
      }
    default: throw new Error("Cannot handle: " + shotokuKubun);
  }
}

function gendogakuTasuuGaitou(
  kubun: ShotokuKubunCode,
  isBirthdayMonth75: boolean,
  isNyuuin: boolean,
): number {
  switch (kubun) {
    case "ア":
    case "現役並みⅢ":
      return fixed(140100, isBirthdayMonth75);
    case "イ":
    case "現役並みⅡ":
      return fixed(93000, isBirthdayMonth75);
    case "ウ":
    case "現役並みⅠ":
      return fixed(44400, isBirthdayMonth75);
    case "エ": return fixed(44400, isBirthdayMonth75);
    case "オ": return fixed(24600, isBirthdayMonth75);
    case "一般Ⅱ":
    case "一般":
    case "一般Ⅰ":
      if( isNyuuin ){
        return fixed(44400, isBirthdayMonth75);
      } else {
        return fixed(18000, isBirthdayMonth75);
      }
    default: throw new Error("Cannot handle: " + kubun);
  }
}

function gendogakuOfSeikatsuHogo(kubun: ShotokuKubunCode, isBirthdayMonth75: boolean, isNyuuin: boolean): number {
  switch (kubun) {
    case "ア":
    case "イ":
    case "ウ":
    case "エ":
    case "オ":
      return fixed(35400, isBirthdayMonth75);
    case "現役並みⅢ":
    case "現役並みⅡ":
    case "現役並みⅠ":
    case "一般":
    case "一般Ⅱ":
    case "一般Ⅰ":
    case "低所得Ⅱ":
    case "低所得Ⅰ":
      if( isNyuuin ){
        return fixed(15000, isBirthdayMonth75);
      } else {
        return fixed(8000, isBirthdayMonth75);
      }
    default: throw new Error("Cannot handle: " + kubun);
  }

}

function houbetsuBangouOf(futanshaBangou: number): number {
  return Math.floor(futanshaBangou / 1000000);
}

function jissiKikanBangouOf(futanshaBangou: number): number {
  return Math.floor((futanshaBangou % 1000000) / 10);
}

function is肝がん(futanshaBangou: number): boolean {
  return houbetsuBangouOf(futanshaBangou) === 38 &&
    jissiKikanBangouOf(futanshaBangou) === 602;
}

export const KuniKouhiHoubetsu = [
  13, 14, 18, 19, 28, 29, 10, 11, 20, 16, 15, 21, 22, 17, 52, 23, 54, 51, 53, 79, 12
]

export function is特定疾病2(houbetsuBangou: number, futanshaBangou: number | undefined): boolean {
  return [51, 52, 54].includes(houbetsuBangou) || (
    futanshaBangou !== undefined && is肝がん(futanshaBangou)
  );
}

export function is特定疾病(futanshaBangou: number): boolean {
  const houbetsu = houbetsuBangouOf(futanshaBangou);
  return is特定疾病2(houbetsu, futanshaBangou);
}

export function isKuniKouhi2(houbetsuBangou: number, futanshaBangou: number | undefined): boolean {
  return (!is特定疾病2(houbetsuBangou, futanshaBangou) && KuniKouhiHoubetsu.includes(houbetsuBangou));
}

export function isKuniKouhi(futanshaBangou: number): boolean {
  return (!is特定疾病(futanshaBangou)) && KuniKouhiHoubetsu.includes(houbetsuBangouOf(futanshaBangou));
}

function calc(threshold: number, iryouhi: number, offset: number, ratio: number, isBirthdayMonth75: boolean): number {
  if (isBirthdayMonth75) {
    threshold /= 2;
    offset /= 2;
  }
  if (iryouhi <= offset) {
    return threshold;
  } else {
    return threshold + (iryouhi - offset) * ratio;
  }
}

function fixed(gendogaku: number, isBirthdayMonth75: boolean): number {
  if (isBirthdayMonth75) {
    return gendogaku / 2;
  } else {
    return gendogaku;
  }
}
// export const KuniKouhiHoubetsu = [
//   13, 14, 18, 19, 28, 29, 10, 11, 20, 16, 15, 21, 22, 17, 52, 23, 54, 51, 53, 79, 12
// ]

// export function isKuniKouhi(houbetsu: number): boolean {
//   // exclude 51, 52, 54

//   if ([51, 52, 54].includes(houbetsu)) {
//     return false;
//   } else {
//     return KuniKouhiHoubetsu.includes(houbetsu);
//   }
// }

export function isKuniKouhiOfHeiyou(houbetsuList: number[]): boolean {
  // 公費併用の場合は、一つでも国公費ならば、国公費で限度額計算
  for (let h of houbetsuList) {
    if (isKuniKouhi(h)) {
      return true;
    }
  }
  return false;
}



