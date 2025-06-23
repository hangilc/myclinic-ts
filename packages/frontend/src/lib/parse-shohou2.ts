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
  let shohou: Shohou = {
    groups,
    bikou: [],
    kigen: undefined
  };
  let rShohouCommands = repeat(probeShohouCommand, pos);
  if( !rShohouCommands.success ){
    return formatFailure(rShohouCommands);
  }
  let handleError = handleShohouCommands(shohou, rShohouCommands.value);
  if( handleError ){
    return handleError;
  }
  pos = rShohouCommands.rest;
  pos = posSkipSpaceNLs(pos);
  if( !posIsAtEOL(pos) ){
    return formatFailure({ success: false, message: "extra content", pos })
  }
  return shohou;
}

export function parseShohouDrugs(src: string): string[] {
  const lines = src.split(/\r\n|\n/);
  const drugNames: string[] = [];
  
  for (const line of lines) {
    // Check if line is eligible
    const digitMatch = /^[ 　]*[0-9０-９]+[)）]/.exec(line);
    const startsWithSpace = /^[ 　]+/.exec(line);
    
    if (!digitMatch && !startsWithSpace) {
      continue;
    }
    
    // Remove the initial part (digit index or spaces)
    let cleanLine = line;
    if (digitMatch) {
      cleanLine = line.substring(digitMatch[0].length);
    } else if (startsWithSpace) {
      cleanLine = line.substring(startsWithSpace[0].length);
    }
    
    // Match against reAmount regex
    const match = reAmount.exec(cleanLine);
    if (match) {
      const drugName = cleanLine.substring(0, match.index).trim();
      if (drugName) {
        drugNames.push(drugName);
      }
    }
  }
  return drugNames;
}

function handleDrugCommands(drug: Drug, commands: Command[]): string | undefined {
  for(let c of commands) {
    switch(c.name) {
      case "変更不可": {
        drug.senpatsu = "henkoufuka";
        break;
      }
      case "患者希望": {
        drug.senpatsu = "kanjakibou";
        break;
      }
      case "comment": {
        drug.drugComments.push(c.value);
        break;
      }
      default: return `unknown drug command: ${c.name}`;
    }
  }
  return undefined;
}

function handleGroupCommands(group: DrugGroup, commands: Command[]): string | undefined {
  for(let c of commands) {
    switch(c.name) {
      case "comment": {
        group.groupComments.push(c.value);
        break;
      }
      default: return `unknown group command: ${c.name}`;
    }
  }
  return undefined;
}

function handleShohouCommands(shohou: Shohou, commands: Command[]): string | undefined {
  for(let c of commands) {
    switch(c.name){
      case "memo": {
        shohou.bikou.push(c.value);
        break;
      }
      case "有効期限":{
        shohou.kigen = c.value;
        break;
      }
      case "comment": {
        if( !shohou.comments ){
          shohou.comments = [];
        }
        shohou.comments.push(c.value);
        break;
      }
      default: {
        return `unknown shohou command: ${c.name}`;
      }
    }
  }
  return undefined;
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

function posFirstChar(pos: Pos): string | undefined {
  let { src, i } = pos;
  if( i < src.length ){
    return src[i];
  } else {
    return undefined;
  }
}

function posFirstCharSatisfies(pos: Pos, pred: (ch: string) => boolean ): boolean {
  let ch = posFirstChar(pos)
  if( ch !== undefined ){
    return pred(ch);
  } else {
    return false;
  }
}

function posIsCommandStart(pos: Pos): boolean {
  return posFirstCharSatisfies(pos, ch => ch === "@" || ch === "＠")
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
  let { src, i } = pos;
  let j = src.indexOf("\n", i);
  if (j < 0) {
    return { success: true, value: src.substring(i),
      rest: { src, i: src.length } };
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

let reUneven = "(?:[(（]\\s*" + 
  "([0-9０-９.．]+" + "(?:\\s*[-ー－]\\s*" + "[0-9０-９.．]+)+" +
  ")\\s*[)）])?";

let reAmount = new RegExp(
  "([一1１]回)?" +
    "([0-9０-９]+(?:[.．][0-9０-９]+)?)" +
    "(" + drugUnitStrings.join("|") + ")" +
    "[ 　]*" + reUneven + "[ 　]*" +
    "$"
);

export { reAmount as _reAmount, reUneven as _reUneven };

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

function parseDrug(pos: Pos): Result<Drug> {
  let rLine = getLine(pos);
  if( !rLine.success ){
    return rLine;
  }
  pos = rLine.rest;
  let line = rLine.value;
  let m = reAmount.exec(line);
  if( !m ){
    return { success: false, message: "cannot find drug amount", pos };
  }
  let name = line.substring(0, m.index).trim();
  let drug: Drug = {
    name,
    amount: (m[1] ?? "") + m[2],   // 一回, amount
    uneven: m[4] ? `(${m[4]})` : undefined,
    unit: m[3], // unit
    drugComments: []
  };
  let rCommands = repeat(probeDrugCommand, pos);
  if( !rCommands.success ){
    return rCommands;
  }
  pos = rCommands.rest;
  let err = handleDrugCommands(drug, rCommands.value);
  if( err ) {
    return { success: false, message: err, pos };
  }
  return { success: true, value: drug, rest: pos };
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

function repeat<T>(f: (pos: Pos, nth: number) => Result<T> | undefined, pos: Pos): Result<T[]> {
  let result: T[] = [];
  while(true){
    let r = f(pos, result.length);
    if( r === undefined ){
      break;
    }
    if( !r.success ){
      return r;
    }
    result.push(r.value);
    pos = r.rest;
  }
  return { success: true, value: result, rest: pos };
}

function probeAdditionalDrug(pos: Pos): Result<Drug> | undefined {
  if( posStartsWithSpace(pos) ){
    let r = parseDrug(posSkipSpaces(pos));
    if( r.success ){
      return r;
    } else {
      return undefined;
    }
  } else {
    return undefined;
  }
}

function parseDrugs(pos: Pos): Result<Drug[]> {
  let rIndex = parseDrugIndex(pos);
  if( !rIndex.success ){
    return { success: true, value: [], rest: pos };
  }
  pos = rIndex.rest;
  pos = posSkipSpaces(pos);
  let rDrug = parseDrug(pos);
  if( !rDrug.success ){
    return rDrug;
  }
  let drugs: Drug[] = [rDrug.value];
  pos = rDrug.rest;
  let rExtraDrugs = repeat(probeAdditionalDrug, pos);
  if( !rExtraDrugs.success ){
    return rExtraDrugs;
  }

  pos = rExtraDrugs.rest;
  drugs.push(...rExtraDrugs.value);
  return { success: true, value: drugs, rest: pos };
}

function parseDrugGroup(pos: Pos): Result<DrugGroup> | undefined {
  let rDrugs = parseDrugs(pos);
  if( !rDrugs.success ) {
    return rDrugs;
  }
  let drugs = rDrugs.value;
  if( drugs.length === 0){
    return undefined;
  }
  pos = rDrugs.rest;
  let rUsage = parseUsage(pos);
  if( !rUsage.success ){
    return rUsage;
  }
  let usage = rUsage.value;
  pos = rUsage.rest;
  let group: DrugGroup = {
    drugs,
    usage,
    groupComments: []
  };
  let rCommands = repeat(probeGroupCommand, pos);
  if( !rCommands.success ){
    return rCommands;
  }
  pos = rCommands.rest;
  let err = handleGroupCommands(group, rCommands.value);
  if( err ){
    throw new Error(err);
  }
  return { success: true, value: group, rest: pos };
}

interface Command {
  name: string;
  value: string;
}

function parseCommand(pos: Pos): Result<Command> {
  if( !posIsCommandStart(pos) ){
    return { success: false, message: "missing comment start char @", pos };
  }
  let rLine = getLine({ ...pos, i: pos.i + 1 });
  if( !rLine.success ){
    return rLine;
  }
  let line = rLine.value;
  pos = rLine.rest;
  let delim = -1;
  for(let i=0;i<line.length;i++){
    let ch = line[i];
    if( ch === ":" || ch === "：" ){
      delim = i;
      break;
    }
  }
  let name: string;
  let value: string;
  if( delim >= 0 ){
    name = line.substring(0, delim).trim();
    value = line.substring(delim+1);
  } else {
    name = line.trim();
    value = "";
  }
  return { success: true, value: { name, value }, rest: pos };
}

function probeDrugCommand(pos: Pos): Result<Command> | undefined {
  if( posStartsWithSpace(pos) ){
    if( posIsCommandStart(posSkipSpaces(pos)) ){
      return parseCommand(posSkipSpaces(pos));
    } else {
      return undefined;
    }
  } else {
    return undefined;
  }
}

function probeGroupCommand(pos: Pos): Result<Command> | undefined {
  if( posStartsWithSpace(pos) ){
    if( posIsCommandStart(posSkipSpaces(pos)) ){
      return parseCommand(posSkipSpaces(pos));
    } else {
      return undefined;
    }
  } else {
    return undefined;
  }
}

function probeShohouCommand(pos: Pos): Result<Command> | undefined {
  if( posIsCommandStart(pos) ){
    return parseCommand(pos);
  } else {
    return undefined;
  }
}
