import { zenkakuSpace, zenkakuPeriod } from "../zenkaku"
const space = "[ 　]";
const digit = "[0-9０-９]";
const notSpace = "[^ 　\n]";
const digitOrPeriod = `[０-９${zenkakuPeriod}]`;
const reProlog = new RegExp(`^院外処方${space}*\nＲｐ）${space}*\n`);
const rePartStart = new RegExp(`(?<=^|\n)${space}?${digit}+）${space}*`);
const reLeadingSpaces = new RegExp(`^${space}+`)
const commandStart = "@";
const localCommandStart = "@_"
const localCommentCommand = "@_comment:"
const unit = "(?:錠|カプセル|ｇ|ｍｇ|包|ｍＬ|ブリスター|瓶|個|キット|枚|パック|袋|本)";
const chunk = `${notSpace}(?:.*${notSpace})?`;
const drugPattern = `(${chunk})${space}+((?:１回)?${digitOrPeriod}+${unit}(?:${chunk})?)`
const reDrugPattern = new RegExp(`^${drugPattern}${space}*(?:\n|$)`);
const daysPart = `${digit}+(?:日|回)分`;
const usagePattern = `(${chunk})${space}+(${daysPart}(?:${chunk})?)`;
const reUsagePattern = new RegExp(`^${usagePattern}${space}*(?:\n|$)`);

export const exportForTesting = {
  chunk, reDrugPattern, reUsagePattern
}

export function isShohousen(s: string): boolean {
  return reProlog.test(s);
}

export function stripShohousenProlog(s: string): string {
  return s.replace(reProlog, "");
}

export function isPartStart(s: string): boolean {
  return rePartStart.test(s);
}

export function cut(s: string, re: RegExp): [string, string[]] {
  let flags = re.flags.replace("g", "") + "g";
  re = new RegExp(re, flags)
  const ms = s.matchAll(re);
  let pre: string = "";
  let parts: string[] = [];
  let i = 0;
  for(const m of ms){
    const start = m.index
    if( i === 0 ){
      pre = s.substring(0, start);
    } else {
      parts.push(s.substring(i, start));
    }
    i = start;
  }
  parts.push(s.substring(i));
  return [pre, parts];
}

export function splitToParts(s: string): [string, string[]] {
  return cut(s, rePartStart);
}

export interface PartTemplate {
  lines: string,
  trails: string[],
  localCommands: string[],
  globalCommands: string[]
}

export function span<T>(list: T[], pred: (t: T) => boolean): [T[], T[]] {
  let i: number;
  for(i=0;i<list.length;i++){
    const a = list[i];
    if( !pred(a) ){
      break;
    }
  }
  return [list.slice(0, i), list.slice(i)];
}

export function partition<T>(list: T[], pred: (t: T) => boolean): [T[], T[]] {
  return list.reduce(([pos, neg], ele) => {
    if( pred(ele) ){
      pos.push(ele);
    } else {
      neg.push(ele);
    }
    return [pos, neg];
  }, [[], []]);
}

export function parsePartTemplate(s: string): PartTemplate {
  s = s.replace(rePartStart, zenkakuSpace);
  s = s.replace(/\n$/, "");
  const lines = s.split("\n");
  let [pre, post] = span(lines, a => a.startsWith(zenkakuSpace));
  pre = pre.map(a => a.replace(reLeadingSpaces, ""));
  const [commands, trails] = partition(post, a => a.startsWith(commandStart));
  let [localCommands, globalCommands] = 
    partition(commands, c => c.startsWith(localCommandStart));
  localCommands = localCommands.filter(a => !a.startsWith(localCommentCommand))
  return {
    lines: pre.join("\n"),
    trails,
    localCommands,
    globalCommands
  };
}

export interface DrugPart {
  name: string;
  amount: string;
}

export function parseDrugPart(s: string): [DrugPart | null, string] {
  let m = reDrugPattern.exec(s);
  if( m != null ){
    const drugPart: DrugPart = { name: m[1], amount: m[2] };
    const len = m[0].length;
    const rem = s.substring(len);
    return [drugPart, rem];
  } else {
    return [null, s];
  }
}

export interface UsagePart {
  usage: string;
  days: string;
}

export function parseUsagePart(s: string): [UsagePart | null, string] {
  let m = reUsagePattern.exec(s);
  if( m != null ){
    const usagePart: UsagePart = { usage: m[1], days: m[2] };
    const len = m[0].length;
    const rem = s.substring(len);
    return [usagePart, rem];
  } else {
    return [null, s];
  }
}

function repeat<T>(
  parser: (src: string) => [T | null, string],
  s: string
): [T[], string] {
  const ts: T[] = [];
  let rem: string = s;
  while( true ){
    let [t, r] = parser(rem);
    if( t == null ){
      break;
    } else {
      ts.push(t);
      rem = r;
    }
  }
  return [ts, rem];
}

export interface DrugLines {
  drugs: DrugPart[];
  usage: UsagePart | null;
  more: string;
}

export interface Part extends DrugLines {
  trails: string[],
  localCommands: string[]
}

export function parseDrugLines(s: string): DrugLines {
  let drugs: DrugPart[];
  [drugs, s] = repeat(parseDrugPart, s);
  let usage: UsagePart;
  [usage, s] = parseUsagePart(s);

  return {
    drugs: drugs || [],
    usage: usage || null,
    more: s
  };
}

export function parsePart(drugLines: string, trails: string[], localCommands: string[]): Part {
  return Object.assign(parseDrugLines(drugLines), { trails, localCommands});
}

export interface Shohousen {
  prolog: string,
  parts: Part[],
  globalCommands: string[]
}

export function parseShohousen(s: string): Shohousen {
  const [prolog, partSrc]: [string, string[]] = splitToParts(s);
  const globalCommands: string[] = [];
  const parts = partSrc.map(s => {
    const tmpl: PartTemplate = parsePartTemplate(s);
    const part = parsePart(tmpl.lines, tmpl.trails, tmpl.localCommands);
    globalCommands.push(...tmpl.globalCommands);
    return part;
  });
  return { prolog, parts, globalCommands };
}
