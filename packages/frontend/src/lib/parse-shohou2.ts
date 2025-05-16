import { type Shohou } from "@/lib/parse-shohou";
import { toHankaku, toZenkaku } from "./zenkaku";

export function parseShohou(src: string): Shohou | string {
  let lr = newLineReader(src);
  let line = lr();
  if( line === undefined ){
    return "unexpected end of data while reading prolog1";
  } else {
    if( !matchProlog1(line) ){
      return `invalid prolog1: ${line}`;
    }
  }
  line = lr();
  if( line === undefined ){
    return "unexpected end of data while reading prolog2";
  } else {
    if( !matchProlog2(line) ){
      return `invalid prolog2: ${line}`
    }
  }
  line = lr();
  if( line === undefined ){
    return "unexpected end of data while reading drug group";
  }
  {
    let r = matchIndexDrugAmount(line);
    if( typeof r === "string" ){
      return r;
    }
    console.log("r", r);
  }
  return "develop";
}

type LineReader = () => string | undefined;

function newLineReader(src: string): () => string | undefined {
  let i = 0;
  return () => {
    for(let j=i;j<src.length;j++){
      if( src[j] === "\n" ){
        let line = src.substring(i, j);
        i = j+1;
        return line;
      }
    }
    return undefined;
  }
}

function matchProlog1(line: string): boolean {
  line = line.trim();
  return line === "院外処方"
}

function matchProlog2(line: string): boolean {
  line = line.trim();
  return toHankaku(line) === "Rp)"
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
    "([0-9０-９]+(?:[.．][0-9０-９]+)?)" +
    "(" + drugUnitStrings.join("|") + ")" +
    "$"
);

function findSpace(s: string): number {
  for(let i=0;i<s.length;i++){
    let ch = s[i];
    if( ch === " " || ch === "　" ){
      return i;
    }
  }
  return -1;
}

function skipSpaces(s: string, start: number): number {
  for(let i=start;i<s.length;i++){
    let ch = s[i];
    if( ch === " " || ch === "　" ){
      // nop
    } else {
      return i;
    }
  }
  return -1;
}

function matchIndexDrugAmount(line: string): DrugAndAmount | string {
  let origLine = line;
  line = line.trim();
  let reIndex = /^[0-9０-９]+[)）]\s*/;
  let m = reIndex.exec(line);
  if( !m ){
    return `missing index: ${line}`
  }
  line = line.substring(m[0].length);
  let i = findSpace(line);
  if( i < 0 ){
    return `failed to find drug name: ${origLine}`;
  }
  m = reAmount.exec(line);
  if( !m ){
    return `failed to parse drug and amount: ${origLine}`;
  }
  let name = line.substring(0, m.index-1).trim();
  let amount: Amount = {
    pre: m[1] ?? "",
    amount: m[2],
    unit: m[3],
  };
  return { drug: name, amount };
}

function matchSpaceDrugAmount(line: string): DrugAndAmount | string {
  let origLine = line;
  let i = skipSpaces(line, 0);
  if( i === 0 ){
    return "no leading space";
  }
  line = line.trim();
  let reIndex = /^[0-9０-９]+[)）]\s*/;
  let m = reIndex.exec(line);
  if( !m ){
    return `missing index: ${line}`
  }
  line = line.substring(m[0].length);
  let i = findSpace(line);
  if( i < 0 ){
    return `failed to find drug name: ${origLine}`;
  }
  m = reAmount.exec(line);
  if( !m ){
    return `failed to parse drug and amount: ${origLine}`;
  }
  let name = line.substring(0, m.index-1).trim();
  let amount: Amount = {
    pre: m[1] ?? "",
    amount: m[2],
    unit: m[3],
  };
  return { drug: name, amount };
}
