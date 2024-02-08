import { toZenkaku } from "@/lib/zenkaku";
import type { ParsedLine } from "./parsed-line";

let reStart = /^([ ＿]*[0-9０-９]+[)）])|@/mg;

type Drug = ParsedLine[];

export function formatShohousen(content: string) {
  const lines: string[] = [];
  const parsed = extractChunks(content);
  if( parsed.prolog !== "" ){
    const s = parsed.prolog.replace(/\n$/, "");
    lines.push(...s.split("\n"));
  }
  let index: number = 1;
  parsed.chunks.forEach(chunk => {
    if( chunk.startsWith("@") ){

    } else {
      const drug = toZenkaku(chunk.replace(reStart, "").trim());
      console.log("drug", drug);
    }
  })
  return lines.join("\n");
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
  if( starts.length === 0 ){
    return { prolog: "", chunks: [] };
  }
  const prolog = text.substring(0, starts[0]);
  const result: string[] = [];
  starts.push(text.length);
  let start = starts[0];
  for(let j=1;j<starts.length;j++){
    const end = starts[j];
    result.push(text.substring(start, end));
    start = end;
  }
  return { prolog, chunks: result };
}