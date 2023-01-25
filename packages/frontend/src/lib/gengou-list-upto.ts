import { GengouList } from "kanjidate";

export function gengouListUpto(gUntil: string): string[] {
  const result: string[] = [];
  for(let g of GengouList) {
    result.push(g.kanji);
    if( g.kanji === gUntil ){
      return result;
    }
  }
  return result;
}