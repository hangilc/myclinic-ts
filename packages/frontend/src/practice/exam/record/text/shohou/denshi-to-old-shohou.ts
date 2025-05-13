import type { PrescInfoData, 薬品情報 } from "@/lib/denshi-shohou/presc-info";
import { toZenkaku } from "@/lib/zenkaku";

export function denshiToOldShohou(data: PrescInfoData): string {
  let lines: string[] = [];
  let index = 0;
  prolog(lines);
  for(let g of data.RP剤情報グループ){
    index += 1;
    let i = 0;
    for(let d of g.薬品情報グループ){
      lines.push(drugNameAndAmount(index, i, d));
      i += 1;
    }
  }
  return lines.join("\n") + "\n";
}

function drugNameAndAmount(index: number, i: number, d: 薬品情報): string {
  let pre = i === 0
    ? toZenkaku(`${index})`)
    : toZenkaku(" ".repeat(i.toString().length+1));
  let name = d.薬品レコード.薬品名称;
  return `${pre}${name}`;
  
}

function prolog(lines: string[]) {
  lines.push("院外処方");
  lines.push("Ｒｐ）");
  
}
