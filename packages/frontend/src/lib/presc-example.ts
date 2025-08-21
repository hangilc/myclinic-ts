import type { RP剤情報 } from "./denshi-shohou/presc-info";

export type PrescExample = RP剤情報 & {
  id: string;
  comment?: string;
};

export function searchPrescExample(examples: PrescExample[], text: string): PrescExample[] {
  const result: PrescExample[] = [];
  for(let ex of examples){
    for(let drug of ex.薬品情報グループ) {
      if( drug.薬品レコード.薬品名称.includes(text) ){
        const r: PrescExample = Object.assign({}, ex, {
          薬品情報グループ: [drug],
        });
        result.push(r);
      }
    }
  }
  return result;
}