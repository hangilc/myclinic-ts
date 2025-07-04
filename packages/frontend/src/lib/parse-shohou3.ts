import {
  type Shohou,
  type Drug,
  type Usage,
  type DrugGroup,
} from "@/lib/parse-shohou";
import { toHankaku } from "./zenkaku";

export function parseShohou(src: string): Shohou | string {
  let lines: string[] = splitToLines(src);
  lines = skipBlankLines(lines);
  parseProlog1(lines);
  parseProlog2(lines);
  parseDrugGroup(lines);
  console.log("lines", lines);
  return "internal error";
}

function splitToLines(s: string): string[] {
  return s.split(/\r\n|\r|\n/g);
}

function skipBlankLines(lines: string[]): string[] {
  return lines.filter(s => s.trim() !== "");
}

function isProlog1(s: string): boolean {
  return s.trim() === "院外処方";
}

function parseProlog1(lines: string[]) {
  let line = lines.shift();
  if( line !== undefined && isProlog1(line) ){
    // nop
  } else if( line !== undefined ) {
    lines.unshift(line);
  }
}

function isProlog2(s: string): boolean {
  s = s.trim();
  return s === "Rp)" || s === "Ｒｐ）";
}

function parseProlog2(lines: string[]) {
  let line = lines.shift();
  if( line !== undefined && isProlog2(line) ){
    // nop
  } else if( line !== undefined ) {
    lines.unshift(line);
  }
}

function getGroupDrugLines(lines: string[]): string[] {
  let result: string[] = [];
  while(lines.length > 0){
    let line = lines.shift();
    if( line === undefined ){
      break;
    }
    let m = /^\s*[0-9０-９]+[)）](.*)/.exec(line);
    if( m ){
      if( result.length === 0 ){
        result.push(m[1]);
      } else {
        lines.unshift(line);
        break;
      }
    } else if( /[! 　\t]/.test(line) ){
      result.push(line);
    } else {
      lines.unshift(line);
      break;
    }
  }
  return result;
}

function parseDrugGroup(lines: string[]) {
  let glines = getGroupDrugLines(lines);
  console.log("glines", glines);
}