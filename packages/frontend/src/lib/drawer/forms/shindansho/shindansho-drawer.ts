import type { Op } from "../../compiler/op";
import * as c from "../../compiler/compiler";
import * as b from "../../compiler/box";
import * as p from "../../compiler/composite-item";
import { A4 } from "../../compiler/paper-size";
import { mkDrawerContext, type DrawerContext } from "../../compiler/context";

export interface ShindanshoDrawerData {
  "patient-name": string;
  "birth-date": string;
  "diagnosis": string;
  "text": string;
  "issue-date": string;
  "postal-code": string;
  "address": string;
  "phone": string;
  "fax": string;
  "clinic-name": string;
  "doctor-name": string;
}

export function mkShindanshoDrawerData(): ShindanshoDrawerData {
  return {
    "patient-name": "",
    "birth-date": "",
    "diagnosis": "",
    "text": "",
    "issue-date": "",
    "postal-code": "",
    "address": "",
    "phone": "",
    "fax": "",
    "clinic-name": "",
    "doctor-name": "",
  }
}

  // let testData: ShindanshoDrawerData = {
  //   "patient-name": "田中 一郎",
  //   "birth-date": "平成2年3月21日生",
  //   diagnosis: "高血圧症、高脂血症",
  //   text: "血圧は 130/80 にコントロールされている。ＬＤＬコレステロールは 128 にコントロールされている。",
  //   "issue-date": "令和2年8月7日",
  //   "postal-code": "〒123-4567",
  //   address: "東京都杉並区",
  //   phone: "Tel: 03-1234-5678",
  //   fax: "Fax: 03-4321-8765",
  //   "clinic-name": "内科診療所",
  //   "doctor-name": "診療太郎",
  // };

export function shindanshoDrawerContext(): DrawerContext {
  const ctx = mkDrawerContext(initContext);
  c.setPen(ctx, "regular");
  const paper = b.paperSizeToBox(A4);
  c.setFont(ctx, "title");
  c.drawTextAt(ctx, "診断書", 105, 42, { halign: "center", valign: "center", interCharsSpace: 10 });
  c.setFont(ctx, "regular");
  c.drawComposite(ctx, b.mkBox(0, 56, b.width(paper), 60), [
    p.gap(62),
    p.textByFont("氏名", "regular"),
    p.gapTo(76),
    p.gapTo(b.width(paper), { mark: "patient-name", ropt: { font: "large", halign: "left", valign: "center" } }),
  ], { valign: "center" });
  c.drawComposite(ctx, b.mkBox(0, 61.5, b.width(paper), 65.5), [
    p.gap(120),
    p.gapTo(b.width(paper), { mark: "birth-date", ropt: { halign: "left", valign: "center" } })
  ], { valign: "center" });
  c.setFont(ctx, "regular-bold");
  c.drawTextAt(ctx, "診断名", 30, 76, { halign: "left", valign: "center", interCharsSpace: 4 });
  c.setFont(ctx, "large");
  c.mark(ctx, "diagnosis", b.mkBox(60, 76 - 2.4, b.width(paper), 76 + 2.4), {
    halign: "left", valign: "center",
  });
  c.setFont(ctx, "regular");
  c.mark(ctx, "text", b.mkBox(30, 92, 176, 120), {
    paragraph: true, leading: 1,
  });
  c.drawTextAt(ctx, "上記の通り診断する。", 30, 133, { halign: "left", valign: "center" });
  c.mark(ctx, "issue-date", b.mkBox(112, 146 - 2, b.width(paper), 146 + 2), { halign: "left", valign: "center" });
  const addrBox = b.mkBox(120, 157, b.width(paper), 157 + 6 * 5);
  b.withSplitRows(addrBox, b.evenSplitter(5), rs => {
    const ropt = { halign: "left", valign: "top" } as const;
    c.mark(ctx, "postal-code", rs[0], ropt);
    c.mark(ctx, "address", rs[1], ropt);
    c.mark(ctx, "phone", rs[2], ropt);
    c.mark(ctx, "fax", rs[3], ropt);
    c.mark(ctx, "clinic-name", rs[4], ropt);
  });
  const doctorBox = b.modify(addrBox, b.flipDown(), b.setHeight(5, "top"));
  c.drawComposite(ctx, doctorBox, [
    p.text("医師"),
    p.gapTo(12),
    p.gapTo(50, { mark: "doctor-name", ropt: { font: "large", halign: "left", valign: "center" } }),
    p.text("㊞")
  ], { valign: "center" });
  console.log("doctor-name", c.getMark(ctx, "doctor-name"));
  return ctx;
}

export function drawShindansho(data: ShindanshoDrawerData): Op[] {
  const ctx = shindanshoDrawerContext();
  c.fillData(ctx, data);
  return c.getOps(ctx);
}

function initContext(ctx: DrawerContext) {
  c.createFont(ctx, "title", "MS Mincho", 5.2, "bold");
  c.createFont(ctx, "regular", "MS Mincho", 4);
  c.createFont(ctx, "regular-bold", "MS Mincho", 4, "bold");
  c.createFont(ctx, "large", "MS Mincho", 4.8);
  c.createPen(ctx, "regular", 0, 0, 0, 0.1);
}