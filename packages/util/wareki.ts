export type GengouType = "明治" | "大正" | "昭和" | "平成" | "令和";
export interface Gengou {
  name: string;
  alpha: string;
  startYear: number;
  startMonth: number;
  startDay: number;
}

const GengouList: Gengou[] = [
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
