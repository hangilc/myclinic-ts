import type { LimitApplicationCertificateClassificationFlagLabel } from "onshi-result/codes";

type ShotokuKubun = LimitApplicationCertificateClassificationFlagLabel;

export interface GendogakuOptions {
  hasKuniKouhi?: boolean;
  isTasuuGaitou?: boolean;
  isBirthdayMonth75?: boolean;
}

export function calcGendogaku(shotokuKubun: ShotokuKubun, iryouhi: number, opts: GendogakuOptions = {}): number {
  const isBirthdayMonth75: boolean = opts.isBirthdayMonth75 ?? false;
  if( opts.hasKuniKouhi ){
    return gendogakuKuniKouhi(shotokuKubun, iryouhi, isBirthdayMonth75);
  } else if( opts.isTasuuGaitou ){
    return gendogakuTasuuGaitou(shotokuKubun, isBirthdayMonth75);
  }
  return gendogaku(shotokuKubun, iryouhi, isBirthdayMonth75);
}

function gendogaku(shotokuKubun: ShotokuKubun, iryouhi: number, isBirthdayMonth75: boolean): number {
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
        calc(6000, iryouhi, 30000, 0.10, isBirthdayMonth75)
      ); // 配慮措置（令和７年９月30日まで）
    case "一般Ⅰ": case "一般":
      return fixed(18000, isBirthdayMonth75);
    case "低所得Ⅱ": case "低所得Ⅰ": case "低所得Ⅰ（老福）": case "低所得Ⅰ（境）":
      return fixed(8000, isBirthdayMonth75);
  }
}

function gendogakuKuniKouhi(
  shotokuKubun: ShotokuKubun,
  iryouhi: number,
  isBirthdayMonth75: boolean,
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
      return fixed(12000, isBirthdayMonth75);
    case "低所得Ⅱ":
    case "低所得Ⅰ":
      return fixed(8000, isBirthdayMonth75);
    default: throw new Error("Cannot handle: " + shotokuKubun);
  }
}

function gendogakuTasuuGaitou(
  kubun: ShotokuKubun,
  isBirthdayMonth75: boolean,
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
    case "一般":
    case "一般Ⅱ":
    case "一般Ⅰ":
      return fixed(18000, isBirthdayMonth75);
    case "低所得Ⅱ":
    case "低所得Ⅰ":
      return fixed(8000, isBirthdayMonth75);
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

const KuniKouhiHoubetsu = [
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
  if( isBirthdayMonth75 ){
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
  if( isBirthdayMonth75 ){
    return gendogaku / 2;
  } else {
    return gendogaku;
  }
}

