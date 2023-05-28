import type { VisitEx, Shahokokuho } from "myclinic-model"
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
    terms.push(kouhiRep(kouhi.futansha, kouhi.memoAsJson));
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

export function hokenshaBangouRep(hokenshaBangou: number | string): string {
  const n = typeof hokenshaBangou === "string" ? parseInt(hokenshaBangou): hokenshaBangou;
  if (n <= 9999) {
    return "政管健保";
  } else if (n <= 999999) {
    return "国保";
  } else {
    switch (idiv(n, 1000000)) {
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
      case 39: return "後期高齢";
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

export function kouhiRep(futanshaBangou: number, memo?: any): string {
  if( memo && memo.name ){
    return memo.name;
  }
  const s = futanshaBangou.toString();
  if( s.length === 8 ){
    if( s === "52138013" ){
      return "難病";
    } else if( s === "52137015" ){
      return "小児慢性";
    } else if( s === "38136016") {
      return "肝炎";
    } else if( s === "38136024" ){
      return "肝疾患";
    } else if( s === "51136018" ){
      return "難病";
    } else if( s === "51137016" ){
      return "特殊医療";
    } else if( s === "82138009" ){
      return "透析";
    } else if( s === "82134008" ){
      return "被爆者又は小児精神病";
    } else if( s === "82137001" ){
      return "大気汚染";
    } else if( s === "82137555" ){
      return "大気汚染";
    } else if( s === "87136008" ){
      return "妊娠高血圧";
    }
    switch(s.substring(0, 2)){
      case "54": return "難病";
      case "83": return "難病";
      case "80": return "心身障害";
      case "81": return "ひとり親";
      case "89": return "高校生";
    }
    switch(s.substring(0, 5)){
      case "88132": 
      case "88138": return "乳幼児";
      case "88134":
      case "88135":
      case "88137":
        return "義務教育";
    }
  }
  return `公費負担（${futanshaBangou}）`;
}

export function isKoukikourei(hokenshaBangou: number): boolean {
  return Math.floor(hokenshaBangou / 1000000) === 39;
}
