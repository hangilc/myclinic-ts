import type { PrescInfoData } from "@/lib/denshi-shohou/presc-info";
import { isShohousen, parseShohousen } from "@/lib/shohousen/parse-shohousen";
import { Text } from "myclinic-model";

export function extractDrugNames(texts: Text[]): string[] {
  const names: string[] = [];
  texts.forEach(text => {
    if( text.memo ){
      const data: PrescInfoData = JSON.parse(text.memo).shohou;
      data.RP剤情報グループ.forEach(g  => {
        g.薬品情報グループ.forEach(drug => {
          names.push(drug.薬品レコード.薬品名称);
        })
      })
    } else if( isShohousen(text.content)) {
      const shohou = parseShohousen(text.content);
      shohou.parts.forEach(part => {
        part.drugs.forEach(drug => {
          names.push(drug.name);
        });
      })
    }
  });
  return names;
}