import { ShotokuKubunCode } from "./codes";

export interface GendogakuOptions {
  isUnder70?: boolean;
  shotokuKubun?: ShotokuKubunCode;
  iryouhi?: number;
  isTasuuGaitou?: boolean;
  isNyuuin?: boolean;
}

// ７０歳になる月の翌月から限度額計算変更（１日生まれの場合はその月から）
export function isUnder70(rezeptYear: number, rezeptMonth: number,
  birthdateYear: number, birthdateMonth: number, birthdateDay: number): boolean {
    const a = rezeptYear - birthdateYear;
    if( a > 70 ){
      return false;
    } else if( a === 70 ){
      if( birthdateDay === 1 ){
        return rezeptMonth < birthdateMonth;
      } else {
        return rezeptMonth <= birthdateMonth;
      }
    } else {
      return true;
    }
}

export function calcGendogaku(opts: GendogakuOptions): number {
  if (opts.isUnder70 !== undefined) {
    if (opts.isUnder70) { // ７０歳未満
      if( opts.shotokuKubun ){
        if( opts.isTasuuGaitou !== undefined && opts.isTasuuGaitou === true ){
          return under70TasuuGaitou(opts.shotokuKubun);
        } else {
          return under70(opts.shotokuKubun, opts.iryouhi);
        }
      }
    } else { // ７０歳以上
      if( opts.shotokuKubun ){
        return kourei(opts.shotokuKubun, opts.iryouhi, opts.isNyuuin);
      }
    }
  }
  throw new Error("Cannot calculate gendogaku.");
}

function under70(shotokuKubun: ShotokuKubunCode, iryouhi?: number): number {
  switch(shotokuKubun){
    case "ア": {
      if( iryouhi === undefined ){
        throw new Error("Unknown iryouhi");
      }
      return proportional(252600, iryouhi, 842000);
    }
    case "イ": {
      if( iryouhi === undefined ){
        throw new Error("Unknown iryouhi");
      }
      return proportional(167400, iryouhi, 558000);
    }
    case "ウ": {
      if( iryouhi === undefined ){
        throw new Error("Unknown iryouhi");
      }
      return proportional(80100, iryouhi, 267000);
    }
    case "エ": return 57600;
    case "オ": return 35400;
    default: throw new Error("Cannot calculate gendogaku.");
  }
}

function under70TasuuGaitou(shotokuKubun: ShotokuKubunCode): number {
  switch(shotokuKubun){
    case "ア": return 140100;
    case "イ": return 93000;
    case "ウ": return 44400;
    case "エ": return 44400;
    case "オ": return 24600;
    default: throw new Error("Cannot calculate gendogaku.");
  }
}

function kourei(shotokuKubun: ShotokuKubunCode, iryouhi?: number, isNyuuin?: boolean): number {
  switch(shotokuKubun){
    case "ア": case "現役並みⅢ": {
      if( iryouhi === undefined ){
        throw new Error("Unknown iryouhi");
      }
      return proportional(252600, iryouhi, 842000);
    }
    case "イ": case "現役並みⅡ": {
      if( iryouhi === undefined ){
        throw new Error("Unknown iryouhi");
      }
      return proportional(167400, iryouhi, 558000);
    }
    case "ウ": case "現役並みⅠ": {
      if( iryouhi === undefined ){
        throw new Error("Unknown iryouhi");
      }
      return proportional(80100, iryouhi, 267000);
    }
    case "エ": case "一般": {
      if( isNyuuin !== undefined ){
        if( isNyuuin ){
          return 57600;
        } else {
          return 18000;
        }
      } else {
        throw new Error("Missing information: isNyuuin");
      }
    }
    case "オ": case "低所得Ⅱ": case "低所得Ⅰ": {
      if( isNyuuin !== undefined ){
        if( isNyuuin ){
          switch(shotokuKubun){
            case "低所得Ⅱ": return 24600;
            case "低所得Ⅰ": return 15000;
            default: throw new Error("Missing shotoku kubun");
          }
        } else {
          return 8000;
        }
      }
    }
    default: throw new Error("Cannot calculate gendogaku.");
  }
}

function proportional(base: number, iryouhi: number, offset: number): number {
  return base + (iryouhi - offset) * 0.01;
}