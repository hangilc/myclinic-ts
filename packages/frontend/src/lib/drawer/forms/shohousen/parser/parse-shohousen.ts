import { toZenkaku } from "@/lib/zenkaku";
import { parseFirstLine, type ParsedLine, parseNonFirstLine } from "./parsed-line";
import { parseCommand, type ShohousenCommand } from "./command";

let reStart = /^([ 　]*[0-9０-９]+[)）])|[@＠]/mg;

export type Drug = ParsedLine[];

export interface ParsedShohousen {
  prolog: string[];
  drugs: Drug[];
  commands: ShohousenCommand[];
}

export function parseShohousen(content: string): ParsedShohousen {
  const parsed = extractChunks(content);
  let prolog: string[] = [];
  const drugs: Drug[] = [];
  const commands: ShohousenCommand[] = [];
  if (parsed.prolog !== "") {
    const s = parsed.prolog.replace(/\n$/, "");
    prolog = s.split("\n");
  }
  parsed.chunks.forEach(chunk => {
    if (chunk.startsWith("@") || chunk.startsWith("＠") ) {
      const parsed = parseCommand(chunk.substring(1));
      if( parsed ){
        commands.push();
      }
    } else {
      drugs.push(parseChunk(chunk.replace(reStart, "")));
    }
  })
  return { prolog, drugs, commands };
}

function parseChunk(chunk: string): Drug {
  chunk = toZenkaku(chunk);
  chunk = chunk.trim();
  const lines: ParsedLine[] = [];
  let state: "first" | "append" | "rest" = "first";
  chunk.split("\n").forEach((line, i) => {
    if( i === 0 ){
      state = "first";
    }
    if( state === "first" ){
      lines.push(parseFirstLine(line));
      state = "append";
    } else if( state === "append" ){
      const fp = parseFirstLine(line);
      if( fp.kind === "drug-amount" ){
        lines.push(fp);
      } else {
        lines.push(parseNonFirstLine(line));
        state = "rest";
      }
    } else {
      lines.push(parseNonFirstLine(line));
    }
  });
  return lines;
}

export function extractChunks(content: string): { prolog: string, chunks: string[] } {
  return extractByStarter(reStart, content);
}


function extractByStarter(re: RegExp, text: string): { prolog: string, chunks: string[] } {
  text = text.trim();
  const ms = text.matchAll(re);
  const starts: number[] = [];
  for (let m of ms) {
    if (m.index !== undefined) {
      starts.push(m.index);
    }
  }
  if (starts.length === 0) {
    return { prolog: "", chunks: [] };
  }
  const prolog = text.substring(0, starts[0]);
  const result: string[] = [];
  starts.push(text.length);
  let start = starts[0];
  for (let j = 1; j < starts.length; j++) {
    const end = starts[j];
    result.push(text.substring(start, end));
    start = end;
  }
  return { prolog, chunks: result };
}