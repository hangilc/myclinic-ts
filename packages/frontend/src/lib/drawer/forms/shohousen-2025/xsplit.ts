import type { Splitter } from "@/lib/drawer/compiler/box";

type FixedItem = {
  kind: "fixed";
  width: number;
}

type GapItem = {
  kind: "gap";
}

type AtItem = {
  kind: "at";
  at: number;
}

type SimpleItem = FixedItem | GapItem;

type Item = SimpleItem | AtItem;

type FixedChunk = {
  kind: "fixed-chunk";
  items: FixedItem[];
}

export function fixed(width: number): FixedItem {
  return { kind: "fixed", width };
}

export function gap(): GapItem {
  return { kind: "gap" };
}

export function at(pos: number): AtItem {
  return { kind: "at", at: pos };
}

export function xsplit(...items: Item[]): Splitter {
  return (ext: number) => {
    let result: number[] = [];
    let pos = 0;
    let simples: SimpleItem[] = [];
    for(let i of items){
      if( i.kind === "at" ){
        let ns = splitSimpleWithOffset(pos, i.at - pos, simples);
        simples = [];
        result.push(...ns);
        pos = i.at;
      } else {
        simples.push(i);
      }
    }
    if( simples.length > 0 ){
      let ns = splitSimpleWithOffset(pos, ext - pos, simples);
      result.push(...ns);
    }
    return result;
  }
}

function splitSimpleWithOffset(offset: number, ext: number, items: SimpleItem[]): number[] {
  let result: number[] = splitSimple(ext, items);
  return result.map(r => r + offset);
}

function splitSimple(ext: number, items: SimpleItem[]): number[] {
  let is = splitByGap(items);
  let fs: FixedChunk[] = [];
  let gs: GapItem[] = [];
  for(let i of is){
    if( i.kind === "gap" ){
      gs.push(i);
    } else {
      fs.push(i);
    }
  }
  let fixedSum = 0;
  for(let f of fs){
    fixedSum += fixedChunkWidth(f);
  }
  let extra = 0;
  if( gs.length > 0 ){
    extra = (ext - extra) / gs.length;
  }
  let result: number[] = [];
  let pos = 0;
  for(let i of is){
    if( i.kind === "gap" ){
      let at = pos + extra;
      result.push(at);
      pos = at;
    } else {
      for(let f of i.items) {
        let at = pos + f.width;
        result.push(at);
        pos = at;
      }
    }
  }
  return result;
}

function fixedChunkWidth(fc: FixedChunk): number {
  let sum = 0;
  for(let f of fc.items){
    sum += f.width;
  }
  return sum;
}

function splitByGap(items: SimpleItem[]): (FixedChunk | GapItem)[] {
  let result: (FixedChunk | GapItem)[] = [];
  let fixedList: FixedItem[] = [];
  for(let item of items){
    if( item.kind === "gap" ){
      if( fixedList.length > 0 ){
        result.push({ kind: "fixed-chunk", items: fixedList });
        fixedList = [];
      }
      result.push(item);
    } else {
      fixedList.push(item);
    }
  }
  if( fixedList.length > 0 ){
    result.push({ kind: "fixed-chunk", items: fixedList });
  }
  return result;
}

