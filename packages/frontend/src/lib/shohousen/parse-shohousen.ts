import { zenkakuSpace, zenkakuPeriod, toZenkaku } from "../zenkaku";
import { partition } from "@/lib/partition";
import { pad } from "../pad";
import { splitOneLine } from "../split-one-line";

const space = "[ 　]";
const digit = "[0-9０-９]";
const notSpace = "[^ 　\n]";
const digitOrPeriod = `[０-９${zenkakuPeriod}]`;
const reProlog = new RegExp(`^院外処方${space}*\nＲｐ）${space}*\n`);
const rePartStart = new RegExp(`(?<=^|\n)${space}?${digit}+[)）]${space}*`);
const reLeadingSpaces = new RegExp(`^${space}+`);
const commandStart = "@";
const localCommandStart = "@_";
const localCommentCommand = "@_comment:";
const unit =
  "(?:錠|カプセル|ｇ|ｍｇ|包|ｍＬ|ブリスター|瓶|個|キット|枚|パック|袋|本)";
const chunk = `${notSpace}(?:.*${notSpace})?`;
const drugPattern = `(${chunk})${space}+((?:１回)?${digitOrPeriod}+${unit}(?:${chunk})?)`;
const reDrugPattern = new RegExp(`^${drugPattern}${space}*(?:\n|$)`);
const daysPart = `${digit}+(?:日|回)分`;
const usagePattern = `(${chunk})${space}+(${daysPart}(?:${chunk})?)`;
const reUsagePattern = new RegExp(`^${usagePattern}${space}*(?:\n|$)`);
let debug: boolean = false;

export function setDebug(value: boolean): void {
  debug = value;
}

export const exportForTesting = {
  chunk,
  reDrugPattern,
  reUsagePattern,
};

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
  re = new RegExp(re, flags);
  const ms = s.matchAll(re);
  let pre: string = "";
  let parts: string[] = [];
  let i = 0;
  for (const m of ms) {
    const start = m.index;
    if( start === undefined ){
      continue;
    }
    if (i === 0) {
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
  lines: string;
  trails: string[];
  localCommands: string[];
  globalCommands: string[];
}

export function span<T>(list: T[], pred: (t: T) => boolean): [T[], T[]] {
  let i: number;
  for (i = 0; i < list.length; i++) {
    const a = list[i];
    if (!pred(a)) {
      break;
    }
  }
  return [list.slice(0, i), list.slice(i)];
}

export function parsePartTemplate(s: string): PartTemplate {
  if( debug ){
    console.log("[enter parsePartTemplate]");
    console.log("s --- ", s);
  }
  s = s.replace(rePartStart, zenkakuSpace);
  s = s.replace(/\n$/, "");
  let lines = s.split("\n");
  lines = lines.map(line => line.replace(reLeadingSpaces, zenkakuSpace));
  let [pre, post] = span(lines, (a) => a.startsWith(zenkakuSpace));
  pre = pre.map((a) => a.replace(reLeadingSpaces, ""))
    .map((a) => toZenkaku(a));
  const [commands, trails] = partition(post, (a) => a.startsWith(commandStart));
  let [localCommands, globalCommands] = partition(commands, (c) =>
    c.startsWith(localCommandStart)
  );
  localCommands = localCommands.filter(
    (a) => !a.startsWith(localCommentCommand)
  );
  const retValue = {
    lines: pre.join("\n"),
    trails,
    localCommands,
    globalCommands,
  };
  if( debug ){
    console.log("[returning from parsePartTemplate]");
    console.log("return --- ", retValue);
  }
  return retValue;
}

export class DrugPart {
  constructor(public name: string, public amount: string) { }

  formatForSave(index: number | null, nDigits: number): string {
    const ipart = pad(
      toZenkaku(`${index ? index.toString() + ")" : ""}`),
      nDigits + 1,
      "　"
    );
    return `${ipart}${this.name}　${this.amount}`;
  }
}

export function parseDrugPart(s: string): [DrugPart | null, string] {
  if( debug ){
    console.log("[enter parseDrugPart]");
    console.log("s --- ", s);
  }
  let m = reDrugPattern.exec(s);
  if( debug ){
    console.log("m --- ", m);
  }
  if (m != null) {
    const drugPart = new DrugPart(m[1], m[2]);
    const len = m[0].length;
    const rem = s.substring(len);
    const retValue: [DrugPart, string] = [drugPart, rem];
    if( debug ){
      console.log("retValue --- ", retValue);
    }
    return retValue;
  } else {
    const retValue: [null, string] = [null, s];
    if( debug ){
      console.log("retValue --- ", retValue);
    }
    return retValue;
  }
}

export class UsagePart {
  constructor(public usage: string, public days: string) { }

  formatForSave(indent: string): string {
    return `${indent}${this.usage}　${this.days}`
  }
}

export function parseUsagePart(s: string): [UsagePart | null, string] {
  let m = reUsagePattern.exec(s);
  if (m != null) {
    const usagePart: UsagePart = new UsagePart(m[1], m[2]);
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
  while (true) {
    let [t, r] = parser(rem);
    if (t == null) {
      break;
    } else {
      ts.push(t);
      rem = r;
      if( rem === "" ){
        break;
      }
    }
  }
  return [ts, rem];
}

export class DrugLines {
  constructor(
    public drugs: DrugPart[],
    public usage: UsagePart | null,
    public more: string
  ) { }
}

function flatten(...args: (string | string[] | null)[]): string[] {
  const result: string[] = [];
  args.forEach((arg) => {
    if (typeof arg === "string") {
      result.push(arg);
    } else if (arg != null) {
      result.push(...arg);
    }
  });
  return result;
}

export class Part extends DrugLines {
  constructor(
    drugs: DrugPart[],
    usage: UsagePart | null,
    more: string,
    public trails: string[],
    public localCommands: string[]
  ) {
    super(drugs, usage, more);
  }

  static create(
    drugLines: DrugLines,
    trails: string[],
    localCommands: string[]
  ): Part {
    return new Part(
      drugLines.drugs,
      drugLines.usage,
      drugLines.more,
      trails,
      localCommands
    );
  }

  get totalDrugs(): number {
    return this.drugs.length;
  }

  formatForSave(index: number, ndrugs: number): string {
    const indent = pad("", ndrugs + 1, "　");
    return flatten(
      this.drugs.map((d, i) => d.formatForSave(i == 0 ? index : null, ndrugs)),
      this.usage?.formatForSave(indent) ?? null,
      // this.more ? indent + this.more : null
      this.more ? this.more.split("\n").map(s => indent + s) : null
    ).join("\n");
  }
}

export function parseDrugLines(s: string): DrugLines {
  let drugs: DrugPart[];
  let firstDrug: DrugPart | null;
  [firstDrug, s] = parseDrugPart(s);
  if( firstDrug == null ){
    const [line, rest] = splitOneLine(s);
    drugs = [new DrugPart(line, "")];
    s = rest;
  } else {
    let ds: DrugPart[];
    [ds, s] = repeat(parseDrugPart, s);
    drugs = [firstDrug, ...ds];
  }
  let usage: UsagePart | null;
  [usage, s] = parseUsagePart(s);

  return {
    drugs: drugs || [],
    usage: usage,
    more: s,
  };
}

export function parsePart(
  drugLines: string,
  trails: string[],
  localCommands: string[]
): Part {
  if( debug ){
    console.log("[enter parsePart]");
    console.log("drugLines", drugLines);
    console.log("trails", trails);
    console.log("localCommands", localCommands);
  }

  const retValue = Part.create(parseDrugLines(drugLines), trails, localCommands);
  if( debug ){
    console.log("[return from parsePart]");
    console.log("retValue --- ", retValue);
  }
  return retValue;
}

export class Shohousen {
  constructor(
    public prolog: string,
    public parts: Part[],
    public globalCommands: string[]
  ) { }

  get totalDrugs(): number {
    return this.parts.reduce((acc, ele) => acc + ele.totalDrugs, 0);
  }

  get digitsWidth(): number {
    return this.totalDrugs.toString().length;
  }

  formatForSave(): string {
    return this.prolog + flatten(
      this.parts.map((p, i) => p.formatForSave(i + 1, this.digitsWidth)),
      this.globalCommands
    ).join("\n");
  }
}

export function parseShohousen(s: string): Shohousen {
  const [prolog, partSrc]: [string, string[]] = splitToParts(s);
  if( debug ){
    console.log("[splitToParts]");
    console.log("prolog --- ", prolog);
    console.log("partSrc --- ", partSrc);
  }
  const globalCommands: string[] = [];
  const parts = partSrc.map((s) => {
    const tmpl: PartTemplate = parsePartTemplate(s);
    const part = parsePart(tmpl.lines, tmpl.trails, tmpl.localCommands);
    globalCommands.push(...tmpl.globalCommands);
    return part;
  });
  return new Shohousen(prolog, parts, globalCommands);
}
