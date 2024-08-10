import type { PrescInfoData, RP剤情報 } from "./presc-info";

export function renderPresc(presc: RP剤情報[]): string {
  let buf = new Buffer();
  buf.push("院外処方");
  buf.push("Ｒｐ）");
  let index = 1;
  presc.forEach(rp => {
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
    let times = "";
    switch(rp.剤形レコード.剤形区分) {
      case "内服": {
        times = ` ${rp.剤形レコード.調剤数量}日分`;
        break;
      }
      case "頓服": {
        times = ` ${rp.剤形レコード.調剤数量}回分`;
        break;
      }
    }
    buf.push(`  ${rp.用法レコード.用法名称}${times}`)
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