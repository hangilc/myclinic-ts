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

function matchStringToZenkaku(src: string, start: number, str: string): Result<void> {
  for(let i=0;i<str.length;i++){
    let j = start + i;
    if( j >= src.length ){
      return failure(`failed to match: ${str}`)
    }
    let a = src[start+i];
    a = toZenkaku(a);
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
  i = skipSpaces(src, i);
  while(true){
    let r = parseNonSpaces(src, i);
    if( !r.ok ){
      return failure();
    }
  }
  return { ok: true, value: {drug, amount}, next: i };
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

function parseAmount(src: string, i: number): Result<Amount> {
  let r = parseNonSpaces(src, i);
  if( !r.ok ){
    return failure("failed to parse amount");
  }
  i = r.next;
  let m = reAmount.exec(r.value);
  if( !m ){
    return failure("failed to parse amount");
  }
  let amount: Amount = {
    pre: m[1],
    amount: m[2],
    unit: m[3],
  }
  return { ok: true, value: amount, next: i};
}








