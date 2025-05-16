import {
  type Shohou,
  type Drug,
  type Usage,
  type DrugGroup,
} from "@/lib/parse-shohou";
import { toHankaku } from "./zenkaku";

export function parseShohou(src: string): Shohou | string {
  let pos = { src, i: 0 };
  let rProlog1 = parseProlog1(pos);
  if (!rProlog1.success) {
    return formatFailure(rProlog1);
  }
  pos = rProlog1.rest;
  let rProlog2 = parseProlog2(pos);
  if (!rProlog2.success) {
    return formatFailure(rProlog2);
  }
  pos = rProlog2.rest;
  let rGroups = repeat(parseDrugGroup, pos);
  if( !rGroups.success ){
    return formatFailure(rGroups);
  }
  let groups = rGroups.value;
  pos = rGroups.rest;
  pos = posSkipSpaceNLs(pos);
  if( !posIsAtEOL(pos) ){
    return formatFailure({ success: false, message: "extra content", pos })
  }
  return {
    groups,
    bikou: [],
    kigen: undefined,
  }
}

interface Pos {
  src: string;
  i: number;
}

function posStartsWithSpace(pos: Pos): boolean {
  let { src, i } = pos;
  if( i < src.length ){
    let ch = src[i];
    return ch === " " || ch === "　";
  } else {
    return false;
  }
}

function posSkipSpaces(pos: Pos): Pos {
  let { src, i } = pos;
  for(;i<src.length && src[i] !== "\n";i++) {
    let ch = src[i];
    if( ch === " " || ch === "　" ){
      //nop
    } else {
      break;
    }
  }
  return { src, i };
}

function posSkipSpaceNLs(pos: Pos): Pos {
  let { src, i } = pos;
  for(;i<src.length;i++) {
    let ch = src[i];
    if( ch === " " || ch === "　" ){
      //nop
    } else {
      break;
    }
  }
  return { src, i };
}

function posIsAtEOL(pos: Pos): boolean {
  return pos.i === pos.src.length;
}

type Result<T> = {
  success: true;
  value: T;
  rest: Pos;
} | {
  success: false;
  message: string;
  pos: Pos;
}

function formatFailure(failure: { success: false, message: string, pos: Pos }): string {
  let pos = failure.pos;
  let context = pos.src.substring(pos.i - 10, pos.i) + "|" +
    pos.src.substring(pos.i, pos.i+10);
  context = context.replaceAll("\n", "\\n");
  return `${failure.message}: ${context}`;
}

function getLine(pos: Pos): Result<string> {
  let j = pos.src.indexOf("\n", pos.i);
  if (j < 0) {
    return { success: false, message: "cannot get line", pos };
  } else {
    return {
      success: true,
      value: pos.src.substring(pos.i, j),
      rest: { src: pos.src, i: j + 1 }
    }
  }
}

function parseProlog1(pos: Pos): Result<void> {
  let rLine = getLine(pos);
  if (!rLine.success) {
    return rLine;
  }
  let rest = rLine.rest;
  let line = rLine.value.trim();
  if (line === "院外処方") {
    return { success: true, value: undefined, rest };
  } else {
    return { success: false, message: "「院外処方」expected", pos };
  }
}

function parseProlog2(pos: Pos): Result<void> {
  let rLine = getLine(pos);
  if (!rLine.success) {
    return rLine;
  }
  let rest = rLine.rest;
  let line = rLine.value.trim();
  if (toHankaku(line) === "Rp)") {
    return { success: true, value: undefined, rest };
  } else {
    return { success: false, message: "「Ｒｐ）」expected", pos };
  }
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

function parseDrugIndex(pos: Pos): Result<void> {
  let rLine = getLine(pos);
  if (!rLine.success) {
    return rLine;
  }
  let line = rLine.value;
  line = toHankaku(line);
  let m = /^\s*\d+\)/.exec(line);
  if (!m) {
    return { success: false, message: "drug index expected", pos };
  }
  return {
    success: true, value: undefined,
    rest: { src: pos.src, i: pos.i + m[0].length }
  }
}

function parseDrugAndAmount(pos: Pos): Result<Drug> {
  let rLine = getLine(pos);
  if( !rLine.success ){
    return rLine;
  }
  let rest = rLine.rest;
  let line = rLine.value;
  let m = reAmount.exec(line);
  if( !m ){
    return { success: false, message: "cannot find drug amount", pos };
  }
  let name = pos.src.substring(pos.i, pos.i + m.index).trim();
  let drug: Drug = {
    name,
    amount: (m[1] ?? "") + m[2],
    unit: m[3],
    drugComments: []
  };
  return { success: true, value: drug, rest };
}

function parseSpaces(pos: Pos): Result<void> {
  let { src, i } = pos;
  if( i < src.length ){
    let ch = src[i];
    if( ch === " " || ch === "　" ){
      i += 1;
    } else {
      return { success: false, message: "space expected", pos };
    }
  } else {
    return { success: false, message: "unexpected end of data", pos };
  }
  for(;i<src.length && src[i] !== "\n";i++){
    let ch = src[i];
    if( ch === " " || ch === "　" ){
      //nop
    } else {
      break;
    }
  }
  return { success: true, value: undefined, rest: { src: pos.src, i }};
}

function parseUsage(pos: Pos): Result<Usage> {
  if( !posStartsWithSpace(pos) ){
    return { success: false, message: "space expected", pos };
  }
  let rLine = getLine(pos);
  if( !rLine.success ){
    return rLine;
  }
  let line = rLine.value;
  let rest = rLine.rest;
  line = line.trim();
  let m = /([0-9０-９]+)日分$/.exec(line);
  if( m ){
    let usage = line.substring(0, m.index).trim();
    let value: Usage = { kind: "days", days: m[1], usage };
    return { success: true, value, rest };
  }
  m = /([0-9０-９]+)回分$/.exec(line);
  if( m ){
    let usage = line.substring(0, m.index).trim();
    let value: Usage = { kind: "times", times: m[1], usage };
    return { success: true, value, rest };
  }
  let value: Usage = { kind: "other", usage: line };
  return { success: true, value, rest };
}

function repeat<T>(f: (pos: Pos, nth: number) => Result<T>, pos: Pos): Result<T[]> {
  let result: T[] = [];
  while(true){
    let r = f(pos, result.length);
    if( !r.success ){
      break;
    }
    result.push(r.value);
    pos = r.rest;
  }
  return { success: true, value: result, rest: pos };
}

function parseDrug(pos: Pos, nth: number): Result<Drug> {
  if( nth === 0 ){
    let rIndex = parseDrugIndex(pos);
    if( !rIndex.success ){
      return { success: false, message: "drug index not found", pos };
    }
    pos = rIndex.rest;
  } else {
    if( !posStartsWithSpace(pos) ){
      return { success: false, message: "space expected", pos };
    }
    pos = posSkipSpaces(pos);
  }
  return parseDrugAndAmount(pos);
}

function parseDrugGroup(pos: Pos): Result<DrugGroup> {
  let rIndex = parseDrugIndex(pos);
  if( !rIndex.success ){
    return rIndex;
  }
  pos = rIndex.rest;
  let rDrugs = repeat(parseDrug, pos);
  if( !rDrugs.success ) {
    return rDrugs;
  }
  let drugs = rDrugs.value;
  pos = rDrugs.rest;
  let rUsage = parseUsage(pos);
  if( !rUsage.success ){
    return rUsage;
  }
  let usage = rUsage.value;
  pos = rUsage.rest;
  let comments: string[] = [];
  let group: DrugGroup = {
    drugs,
    usage,
    groupComments: comments,
  };
  return { success: true, value: group, rest: pos };
}


