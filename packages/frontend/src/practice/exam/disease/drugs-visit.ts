import { isShohousen, parseShohousen } from "@/lib/shohousen/parse-shohousen";
import { Text } from "myclinic-model";
import { TextMemoWrapper } from "@/lib/text-memo";

export function extractDrugNames(texts: Text[]): string[] {
  const names: string[] = [];
  texts.forEach(text => {
    probeDenshi(text, names) || probeContent(text, names);
  });
  return names;
}

function probeDenshi(text: Text, acc: string[]): boolean {
  const wrap = new TextMemoWrapper(text.memo);
  const data = wrap.probeShohouMemo();
  if (data) {
    data.shohou.RP剤情報グループ.forEach(g => {
      g.薬品情報グループ.forEach(drug => {
        acc.push(drug.薬品レコード.薬品名称);
      })
    });
    return true;
  } else {
    return false;
  }
}

function probeContent(text: Text, acc: string[]): boolean {
  if (isShohousen(text.content)) {
    const shohou = parseShohousen(text.content);
    shohou.parts.forEach(part => {
      part.drugs.forEach(drug => {
        acc.push(drug.name);
      });
    })
    return true;
  } else {
    return false;
  }
}
