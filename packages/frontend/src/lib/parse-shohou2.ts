import { type Shohou } from "@/lib/parse-shohou";
import { toHankaku, toZenkaku } from "./zenkaku";

export function parseShohou(src: string): Shohou | string {
  let i = 0;
  {
    let r = matchProlog1(src, i);
    if( !r.ok ){
      return "「院外処方」ではじまっていません。";
    }
    i = r.next;
  }
  {
    let r = matchProlog2(src, i);
    if( !r.ok ){
      return "「Ｒｐ）」がありません。";
    }
    i = r.next;
  }
  {
    let index = 1;
    let r = parseDrugAndAmount(src, i, index);
    console.log("r", r);
  }
  return "result";
}

type Result<T> = {
  ok: true;
  value: T;
  next: number;
} | {
  ok: false
  reason: string;
}

function failure(reason: string): Result<any>{
  return { ok: false, reason, };
}

function isSpace(ch: string): boolean {
  return ch === " " || ch === "　";
}

function matchString(src: string, i: number, str: string): Result<void> {
  if( src.startsWith(str, i) ){
    return { ok: true, value: undefined, next: i + str.length };
  } else {
    return failure(`failed to match: ${str}`);
  }
}

function matchStringToHankaku(src: string, start: number, str: string): Result<void> {
  for(let i=0;i<str.length;i++){
    let j = start + i;
    if( j >= src.length ){
      return failure(`failed to match: ${str}`)
    }
    let a = src[start+i];
    a = toHankaku(a);
    if( a !== str[i]) {
      return failure(`failed to match ${str}`);
    }
  }
  return { ok: true, value: undefined, next: start + str.length };
}

function eatToEol(src: string, start: number): Result<void> {
  for(let i=start;i<src.length;i++){
    let ch = src[i];
    if( ch == "\n"){
      return { ok: true, value: undefined, next: i+1};
    }
    if( !isSpace(src[i]) ){
      return failure(`unexpected non-space char: ${src[i]}`);
    }
  }
  return { ok: true, value: undefined, next: src.length };
}

function skipNonSpaces(src: string, i: number): number {
  for(;i<src.length;i++){
    let ch = src[i];
    if( isSpace(ch) ){
      return i;
    }
  }
  return i;
}

function parseNonSpaces(src: string, i: number): Result<string> {
  let start = i;
  if( i < src.length ){
    let ch = src[i];
    if( isSpace(ch) ){
      return failure("space expected");
    }
    let j = skipNonSpaces(src, i+1);
    return { ok: true, value: src.substring(start, j), next: j };
  } else {
    return failure("unexpected EOF");
  }
}

function skipSpaces(src: string, i: number): number {
  for(;i<src.length;i++){
    let ch = src[i];
    if( !isSpace(ch) ){
      return i;
    }
  }
  return i;
}

function matchProlog1(src: string, i: number): Result<void> {
  let r = matchString(src, i, "院外処方");
  if( !r.ok ){
    return r;
  }
  return eatToEol(src, r.next);
}

function matchProlog2(src: string, i: number): Result<void> {
  let r = matchStringToHankaku(src, i, "Rp)");
  if( !r.ok ){
    return r;
  }
  return eatToEol(src, r.next);
}

interface Amount {
  pre: string;
  amount: string;
  unit: string;
}

interface DrugAndAmount {
  drug: string;
  amount: Amount;
}

function parseDrugAndAmount(src: string, i: number, index: number):
Result<DrugAndAmount> {
  let drug: string = "";
  let amount: string = "";
  i = skipSpaces(src, i);
  {
    let r = matchStringToHankaku(src, i, `${index})`);
    if( !r.ok ){
      return failure(`failed to match index part: ${index})`);
    }
    i = r.next;
  }
  {
    let r = parseNonSpaces(src, i);
    if( !r.ok ){
      let s = src.substring(i, i+10);
      return failure(`failed to read drug name: ${s}`);
    }
    drug = r.value;
    i = r.next;
  }
  let iter = 0;
  while(true){
    i = skipSpaces(src, i);
    console.log("iter", src.substring(i, i+10));
    let r = parseNonSpaces(src, i);
    if( !r.ok ){
      let s = src.substring(i, i+10);
      return failure(`cannot find drug amount: ${s}`);
    }
    let amount = cvtToAmount(r.value);
    if( !amount ){
      drug += ` ${r.value}`;
      i = r.next;
    } else {
      let r2 = eatToEol(src, r.next);
      if( !r2.ok) {
        let s = src.substring(r.next, r.next+10);
        return failure(`extra content after drug amount: ${s}`);
      }
      return { ok: true, value: { drug, amount }, next: r2.next };
    }
    if( ++iter > 3 ){
      return failure("too many iteration while reading drug amount");
    }
  }
}

let drugUnitStrings = [
  "錠",
  "カプセル",
  "ｇ",
  "ｍｇ",
  "包",
  "ｍＬ",
  "ブリスター",
  "瓶",
  "個",
  "キット",
  "枚",
  "パック",
  "袋",
  "本",
  "Ｃ",
];

let reAmount = new RegExp(
  "(一回)?" + 
    "([0-9０－９]+(?:[.．][0-9０－９]+)?)" +
    "(" + drugUnitStrings.join("|") + ")"
);

function cvtToAmount(s: string): Amount | undefined {
  let m = reAmount.exec(s);
  if( !m ){
    return undefined;
  } else {
    let amount: Amount = {
      pre: m[1],
      amount: m[2],
      unit: m[3],
    };
    return amount;
  }
}








