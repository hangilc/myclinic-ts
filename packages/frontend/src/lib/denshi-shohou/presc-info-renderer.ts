import type { PrescInfoData } from "./presc-info";

export function renderPrescInfo(data: PrescInfoData): string {
  let buf = new Buffer();
  buf.push("院外処方");
  buf.push("Rp)");
  let index = 1;
  data.RP剤情報グループ.forEach(rp => {
    console.log("rp", rp);
    let group = rp.薬品情報グループ;
    group.forEach((grp, i) => {
      let pre: string = "";
      if (i === 0) {
        pre = `${index.toString()})`;
      } else {
        pre = "  ";
      }
      i += 1;
      let rec = grp.薬品レコード;
      buf.push(`${pre}${rec.薬品名称} ${rec.分量}${rec.単位名}`);
    });
    buf.push(`  ${rp.用法レコード.用法名称} ${rp.剤形レコード.調剤数量}日分`)
  })
  return buf.to_string();
}

class Buffer {
  lines: string[] = [];

  push(s: string) {
    this.lines.push(s);
  }

  to_string(): string {
    return this.lines.join("\n") + "\n";
  }
}