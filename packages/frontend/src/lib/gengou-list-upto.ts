import { GengouList } from "myclinic-util";

export function gengouListUpto(gUntil: string): string[] {
  const result: string[] = [];
  for(let g of GengouList) {
    result.push(g.name);
    if( g.name === gUntil ){
      return result;
    }
  }
  return result;
}