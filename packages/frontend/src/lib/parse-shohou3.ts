import {
  type Shohou,
  type Drug,
  type Usage,
  type DrugGroup,
  type Senpatsu,
} from "@/lib/parse-shohou";
import { toHankaku } from "./zenkaku";
import { DateWrapper } from "myclinic-util";

class ParseError extends Error {
  message: string;
  rest: string[];

  constructor(message: string, rest: string[]) {
    super();
    this.message = message;
    this.rest = rest;
  }
}

export function parseShohou(src: string): Shohou | string {
  let lines: string[] = splitToLines(src);
  lines = skipBlankLines(lines);
  try {
    parseProlog1(lines);
    parseProlog2(lines);
    let groupSrcList: string[][] = [];
    while (lines.length > 0) {
      let glines = getGroupDrugLines(lines);
      if (glines.length === 0) {
        break;
      } else {
        groupSrcList.push(glines);
      }
    }
    let groups: DrugGroup[] = [];
    for (let glines of groupSrcList) {
      let group = parseDrugGroup(glines);
      groups.push(group);
    }
    let shohou: Shohou = {
      groups,
      bikou: [],
    }
    handleShohouCommands(shohou, lines);
    return shohou;
  } catch (e: any) {
    if (e instanceof ParseError) {
      let msg = e.message;
      if (e.rest.length > 0) {
        msg += `\n${e.rest[0]}`;
      }
      return msg;
    } else {
      return e.toString();
    }
  }
}

function splitToLines(s: string): string[] {
  return s.split(/\r\n|\r|\n/g);
}

function skipBlankLines(lines: string[]): string[] {
  return lines.filter((s) => s.trim() !== "");
}

function isProlog1(s: string): boolean {
  return s.trim() === "院外処方";
}

function parseProlog1(lines: string[]) {
  let line = lines.shift();
  if (line !== undefined && isProlog1(line)) {
    // nop
  } else if (line !== undefined) {
    lines.unshift(line);
  }
}

function isProlog2(s: string): boolean {
  s = s.trim();
  return s === "Rp)" || s === "Ｒｐ）";
}

function parseProlog2(lines: string[]) {
  let line = lines.shift();
  if (line !== undefined && isProlog2(line)) {
    // nop
  } else if (line !== undefined) {
    lines.unshift(line);
  }
}

function getGroupDrugLines(lines: string[]): string[] {
  let result: string[] = [];
  while (lines.length > 0) {
    let line = lines.shift();
    if (line === undefined) {
      break;
    }
    let m = /^\s*[0-9０-９]+[)）](.*)/.exec(line);
    if (m) {
      if (result.length === 0) {
        result.push(m[1]);
      } else {
        lines.unshift(line);
        break;
      }
    } else if (/[! 　\t]/.test(line)) {
      result.push(line);
    } else {
      lines.unshift(line);
      break;
    }
  }
  return result;
}

function isCommand(s: string): boolean {
  return /^\s*[@＠]/.test(s);
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

let reUneven =
  "(?:[(（]\\s*" +
  "([0-9０-９.．]+" +
  "(?:\\s*[-ー－]\\s*" +
  "[0-9０-９.．]+)+" +
  ")\\s*[)）])?";

let reAmount = new RegExp(
  "([一1１]回)?" +
  "([0-9０-９]+(?:[.．][0-9０-９]+)?)" +
  "(" +
  drugUnitStrings.join("|") +
  ")" +
  "[ 　]*" +
  reUneven +
  "[ 　]*" +
  "$"
);

interface ParsedDrug {
  name: string; amount: string; uneven: string | undefined; unit: string
}

function parseDrugLine(
  s: string
): ParsedDrug | undefined {
  let m = reAmount.exec(s);
  if (!m) {
    return undefined;
  }
  let name = s.substring(0, m.index).trim();
  return {
    name,
    amount: (m[1] ?? "") + m[2], // 一回, amount
    uneven: m[4] ? `(${m[4]})` : undefined,
    unit: m[3], // unit
  };
}

function parseCommand(line: string): { name: string; value: string } {
  line = line.trim();
  if (!(line[0] === "@" || line[0] === "＠")) {
    throw new ParseError(`invalid command: ${line}`, []);
  }
  line = line.substring(1);
  let delim = -1;
  for (let i = 0; i < line.length; i++) {
    let ch = line[i];
    if (ch === ":" || ch === "：") {
      delim = i;
      break;
    }
  }
  let name: string;
  let value: string;
  if (delim >= 0) {
    name = line.substring(0, delim).trim();
    value = line.substring(delim + 1);
  } else {
    name = line.trim();
    value = "";
  }
  name = toHankaku(name);
  return { name, value };
}

function parseDrug(lines: string[]): Drug {
  let line = lines.shift();
  if (line === undefined) {
    throw new ParseError("薬品が読み込めません。(parseDrug)", []);
  }
  let parsed: ParsedDrug | undefined = parseDrugLine(line);
  if (parsed === undefined) {
    lines.unshift(line);
    throw new ParseError("薬品が読み込めません。(parseDrugLine)", lines);
  }
  let drugComments: string[] = [];
  let senpatsu: Senpatsu | undefined = undefined;
  while (lines.length > 0) {
    let line = lines.shift()!;
    if (isCommand(line)) {
      let { name, value } = parseCommand(line);
      if (name === "変更不可") {
        senpatsu = "henkoufuka";
      } else if (name === "患者希望") {
        senpatsu = "kanjakibou";
      } else if (name === "comment") {
        drugComments.push(value);
      } else {
        throw new ParseError(`unknown drug command: ${name}`, []);
      }
    } else {
      lines.unshift(line);
      break;
    }
  }
  return Object.assign({}, parsed, { senpatsu, drugComments })
}

function parseUsageLine(line: string): Usage {
  line = line.trim();
  let m = /([0-9０-９]+)日分$/.exec(line);
  if (m) {
    let usage = line.substring(0, m.index).trim();
    return { kind: "days", days: m[1], usage };
  }
  m = /([0-9０-９]+)回分$/.exec(line);
  if (m) {
    let usage = line.substring(0, m.index).trim();
    return { kind: "times", times: m[1], usage };
  }
  return { kind: "other", usage: line };
}

function getGroupCommentsFromTail(lines: string[]): string[] {
  let comments: string[] = [];
  while (lines.length > 0) {
    let line = lines.pop()!;
    if (isCommand(line)) {
      let { name, value } = parseCommand(line);
      name = toHankaku(name);
      if (name === "comment") {
        comments.push(value);
      }
    } else {
      lines.unshift(line);
      break;
    }
  }
  return comments;
}

function parseDrugGroup(glines: string[]): DrugGroup {
  if (glines.length === 0) {
    throw new ParseError("no lines (parseDrugGroup)", [])
  }
  let src = [...glines];
  if (glines.length < 2) {
    throw new ParseError("薬品あるいは用法が設定されていません。", src);
  }
  let drugs: Drug[] = [];
  let drug = parseDrug(glines);
  drugs.push(drug);
  let groupComments: string[] = getGroupCommentsFromTail(glines);
  let usage: Usage | undefined = undefined;
  {
    let line = glines.pop();
    if (line === undefined) {
      throw new ParseError("用法を読み取れません。", src);
    }
    usage = parseUsageLine(line);
  }
  while(glines.length > 0){
    let drug = parseDrug(glines);
    drugs.push(drug);
  }
  if( glines.length > 0 ){
    throw new ParseError("薬品・用法をよみとれません。", src);
  }
  return { drugs, usage, groupComments };
}

function handleShohouCommands(shohou: Shohou, lines: string[]) {
  for(let line of lines){
    line = line.trim();
    if( line === "一包化" ){
      shohou.bikou.push("一包化");
    } else {
      if( isCommand(line) ){
        let { name, value } = parseCommand(line);
        if( name === "memo" ){
          shohou.bikou.push(value);
        } else if( name === "comment" ){
          if( shohou.comments === undefined ){
            shohou.comments = [];
          }
          shohou.comments.push(value);
        } else if( name === "有効期限" ){
          if( DateWrapper.isSqlDate(value) ){
            shohou.kigen = value;
          } else {
            throw new ParseError(`有効期限の値が不適切です: ${value}`, []);
          }
        }
      }
    }
  }
}