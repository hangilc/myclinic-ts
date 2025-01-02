import { DateWrapper } from "./date-util";

export type GengouType = "明治" | "大正" | "昭和" | "平成" | "令和";
export interface Gengou {
  name: string;
  alpha: string;
  startYear: number;
  startMonth: number;
  startDay: number;
}

export function isGengou(arg: any): arg is Gengou {
  return typeof arg === "object" && typeof arg.name === "string" &&
    typeof arg.alpha === "string" && typeof arg.startYear === "number" &&
    typeof arg.startMonth === "number" && typeof arg.startDay === "number";
}

export const GengouList: Gengou[] = [
  { name: "令和", alpha: "Reiwa", startYear: 2019, startMonth: 5, startDay: 1},
  { name: "平成", alpha: "Heisei", startYear: 1989, startMonth: 1, startDay: 8},
  { name: "昭和", alpha: "Shouwa", startYear: 1926, startMonth: 12, startDay: 25},
  { name: "大正", alpha: "Taishou", startYear: 1912, startMonth: 7, startDay: 30},
  { name: "明治", alpha: "Meiji", startYear: 1868, startMonth: 1, startDay: 1},
];

export function warekiOf(year: number, month: number, day: number): { gengou: Gengou, nen: number } {
  function cmp(a1: number, a2: number, a3: number, b1: number, b2: number, b3: number): number {
    let diff = a1 - b1;
    if( diff === 0 ){
      diff = a2 - b2;
    }
    if( diff === 0 ){
      diff = a3 - b3;
    }
    return diff;
  }
  for(const g of GengouList) {
    if( cmp(year, month, day, g.startYear, g.startMonth, g.startDay) >= 0 ){
      return { gengou: g, nen: year - g.startYear + 1 }
    }
  }
  throw new Error(`Too old date (${year}, ${month}, ${day})`)
}

export function nameToGengou(name: string): Gengou | undefined {
  for(let g of GengouList) {
    if( g.name === name ){
      return g;
    }
  }
  return undefined;
}

export function nameToGengouForce(name: string): Gengou {
  const g = nameToGengou(name);
  if( g == undefined ){
    throw new Error(`unknown gengou: ${name}`);
  }
  return g;
}

export function warekiToYear(gengou: Gengou, nen: number): number {
  return gengou.startYear + nen - 1;
}

export function nenOfYear(gengou: Gengou, year: number): number {
  return year - gengou.startYear + 1;
}

export function nenRangeOfGengou(g: Gengou): [number, number] {
  const i = GengouList.findIndex(e => e == g);
  if( i == 0 ){
    // const kd = new KanjiDate(new Date());
    const kd = DateWrapper.from(new Date());
    return [1, kd.getNen()];
  } else if( i > 0 ) {
    // const pre: Gengou = GengouList[i-1];
    // return [1, g.getNenOf(pre.start.year)];
     const pre: Gengou = GengouList[i-1];
    return [1, nenOfYear(g, pre.startYear)];
  } else {
    throw new Error("Invalid gengou: " + g);
  }
}
