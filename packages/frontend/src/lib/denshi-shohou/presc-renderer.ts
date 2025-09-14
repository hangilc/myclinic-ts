import type { RP剤情報, 不均等レコード } from "./presc-info";

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
      let tail = renderUneven(grp.不均等レコード);
      buf.push(`${pre}${rec.薬品名称} ${rec.分量}${rec.単位名}${tail}`);
    });
    let times = "";
    switch (rp.剤形レコード.剤形区分) {
      case "内服": {
        times = `  ${rp.剤形レコード.調剤数量}日分`;
        break;
      }
      case "頓服": {
        times = `  ${rp.剤形レコード.調剤数量}回分`;
        break;
      }
    }
    let usage = rp.用法レコード.用法名称;
    rp.用法補足レコード?.forEach(hosoku => {
      usage = `${usage}　${hosoku.用法補足情報}`;
    });
    buf.push(`  ${usage}${times}`)
  })
  return buf.to_string();
}

let renderedDrugId = 1;

export interface RenderedDrug {
  usage: string;
  times: string;
  drugs: string[];
  id: number;
}

export function renderDrug(drug: RP剤情報): RenderedDrug {
  let rd: RenderedDrug = {
    usage: "",
    times: "",
    drugs: [],
    id: renderedDrugId,
  };
  renderedDrugId += 1;
  let usage = drug.用法レコード.用法名称;
  drug.用法補足レコード?.forEach(hosoku => {
    usage = `${usage}　${hosoku.用法補足情報}`;
  });
  rd.usage = usage;
  let times = "";
  switch (drug.剤形レコード.剤形区分) {
    case "内服": {
      times = `  ${drug.剤形レコード.調剤数量}日分`;
      break;
    }
    case "頓服": {
      times = `  ${drug.剤形レコード.調剤数量}回分`;
      break;
    }
  }
  rd.times = times;
  drug.薬品情報グループ.forEach(grp => {
    let rec = grp.薬品レコード;
    let tail = renderUneven(grp.不均等レコード);
    rd.drugs.push(`${rec.薬品名称} ${rec.分量}${rec.単位名}${tail}`);
  });
  return rd;
}

function renderUneven(uneven: 不均等レコード | undefined): string {
  if (!uneven) {
    return "";
  }
  let parts: string[] = [
    uneven.不均等１回目服用量,
    uneven.不均等２回目服用量,
    uneven.不均等３回目服用量,
    uneven.不均等４回目服用量,
    uneven.不均等５回目服用量,
  ].reduce((acc: string[], ele: string | undefined) => {
    if (ele) {
      acc.push(ele)
    }
    return acc;
  }, []);
  return "(" + parts.join("-") + ")";
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