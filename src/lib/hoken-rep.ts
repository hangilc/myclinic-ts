import type { VisitEx, Shahokokuho } from "@/lib/model"
import { idiv } from "@/lib/idiv"

export function hokenRep(visit: VisitEx): string {
  let terms: string[] = [];
  const hoken = visit.hoken;

  if( hoken.shahokokuho != null ){
    terms.push(shahokokuhoRep(hoken.shahokokuho));
  }
  if( hoken.koukikourei != null ){
    terms.push(koukikoureiRep(hoken.koukikourei.futanWari));
  }
  if( hoken.roujin != null ){
    terms.push(roujinRep(hoken.roujin.futanWari));
  }
  for( let kouhi of hoken.kouhiList ){
    terms.push(kouhiRep(kouhi.futansha));
  }
  if( terms.length === 0 ){
    return "自費";
  } else {
    return terms.join("・");
  }
}

export function shahokokuhoName(hokenshaBangou: number): string {
  if (hokenshaBangou <= 9999) {
    return "政管健保";
  } else if (hokenshaBangou <= 999999) {
    return "国保";
  } else {
    switch (idiv(hokenshaBangou, 1000000)) {
      case 1: return "協会けんぽ";
      case 2: return "船員";
      case 3: return "日雇一般";
      case 4: return "日雇特別";
      case 6: return "組合健保";
      case 7: return "自衛官";
      case 31: return "国家公務員共済";
      case 32: return "地方公務員共済";
      case 33: return "警察公務員共済";
      case 34: return "学校共済";
      case 63: return "特定健保退職";
      case 67: return "国保退職";
      case 72: return "国家公務員共済退職";
      case 73: return "地方公務員共済退職";
      case 74: return "警察公務員共済退職";
      case 75: return "学校共済退職";
      default: return "不明";
    }
  }
}

export function shahokokuhoRep(shahokokuho: Shahokokuho): string {
  return shahokokuhoRep2(shahokokuho.hokenshaBangou, shahokokuho.koureiStore);
}

export function shahokokuhoRep2(
  shahokokuhoHokenshaBangou: number,
  shahokokuhoKoureiFutanWari: number
): string {
  const name: string = shahokokuhoName(shahokokuhoHokenshaBangou)
  if( shahokokuhoKoureiFutanWari === 0 ){
    return name;
  } else {
    return `高齢${shahokokuhoKoureiFutanWari}割`;
  }
}

export function koukikoureiRep(futanWari: number): string {
  return `後期高齢${futanWari}割`;
}

export function roujinRep(futanWari: number): string {
  return `老人${futanWari}割`;
}

export function kouhiRep(futanshaBangou: number): string {
  if ((idiv(futanshaBangou, 1000000)) == 41){ return  "マル福"; }
  else if (idiv(futanshaBangou, 1000) == 80136) { return "マル障（１割負担）"; }
  else if (idiv(futanshaBangou, 1000) == 80137) { return "マル障（負担なし）"; }
  else if (idiv(futanshaBangou, 1000) == 81136) { return "マル親（１割負担）"; }
  else if (idiv(futanshaBangou, 1000) == 81137) { return "マル親（負担なし）"; }
  else if (idiv(futanshaBangou, 1000000) == 88) { return "マル乳"; }
  else { return `公費負担（${futanshaBangou}）`; }
}