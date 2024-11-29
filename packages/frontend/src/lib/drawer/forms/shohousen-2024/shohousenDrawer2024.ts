import { mkDrawerContext, type DrawerContext } from "../../compiler/context";
import type { Op } from "../../compiler/op";
import type { ShohousenData2024 } from "./shohousenData2024";
import * as c from "../../compiler/compiler";
import * as b from "../../compiler/box";
import * as r from "../../compiler/render";
import * as w from "./widgets";
import { A5 } from "../../compiler/paper-size";
import type { Box } from "../../compiler/box";
import { justifiedText } from "./widgets";
import { drawReceipt } from "../receipt/receipt-drawer";

export function drawShohousen2024(data: ShohousenData2024): Op[] {
  const ctx = mkDrawerContext();
  initFont(ctx);
  initPen(ctx);
  c.setFont(ctx, "f2.5");
  c.setPen(ctx, "default");
  const paper = b.mkBox(0, 0, A5.width, A5.height);
  const bounds = b.modify(paper, b.inset(3));
  console.log("bounds", bounds, paper);
  c.frame(ctx, bounds);
  let box = b.withSlice(bounds, 6, box => drawTitle(ctx, b.modify(box, b.setWidth(30, "center"))));
  box = b.withSlice(box, 2.5, (box) => {
    c.drawText(ctx, "(この処方箋は、どの保険薬局でも有効です。)", box, "center", "center");
  });
  box = b.modify(bounds, b.inset(2, 13, 2, 13));
  const [upperBox, _, lowerBox] = b.splitToRows(box, b.splitAt(20, 22));
  drawUpperBox(ctx, upperBox);
  drawLowerBox(ctx, lowerBox);
  return c.getOps(ctx);
}

function initFont(ctx: DrawerContext) {
  c.createFont(ctx, "f4", "MS Mincho", 4);
  c.createFont(ctx, "f2.5", "MS Mincho", 2.5);
  c.createFont(ctx, "f1.5", "MS Mincho", 1.5);
}

function initPen(ctx: DrawerContext) {
  c.createPen(ctx, "default", 0, 0, 0, 0.25);
  c.createPen(ctx, "thin", 40, 40, 40, 0.1);
}

function drawTitle(ctx: DrawerContext, box: Box) {
  const block = justifiedText(ctx, "処方箋", box, { font: "f4" });
  r.putIn(ctx, block, box, { halign: "center", valign: "center" });
}

function drawUpperBox(ctx: DrawerContext, box: Box) {
  c.frame(ctx, box);
  let [row1, row2] = b.splitToRows(box, b.evenSplitter(2));
  c.frameBottom(ctx, row1);
  const cellSize = 5;
  { // upper row
    const [cell1, cell2] = b.splitToColumns(row1, b.evenSplitter(2));
    c.frameRight(ctx, cell1);
    { // cell1
      const [c1, c2] = b.splitToColumns(cell1, r.splitByExtent(["*", cellSize * 8]));
      c.frameRight(ctx, c1);
      c.drawText(ctx, "公費負担者番号", c1, "center", "center");
      let rows = b.splitToColumns(c2, b.evenSplitter(8));
      [1, 3, 6].forEach(i => c.frameRight(ctx, rows[i]));
      c.withPen(ctx, "thin", () => {
        [0, 2, 4, 5].forEach(i => c.frameRight(ctx, rows[i]));
      })
    }
    { // cell2
      const [c1, c2] = b.splitToColumns(cell2, r.splitByExtent(["*", cellSize * 8]));
      c.frameRight(ctx, c1);
      c.drawText(ctx, "保険者番号", c1, "center", "center");
      let rows = b.splitToColumns(c2, b.evenSplitter(8));
      [1, 3, 6].forEach(i => c.frameRight(ctx, rows[i]));
      c.withPen(ctx, "thin", () => {
        [0, 2, 4, 5].forEach(i => c.frameRight(ctx, rows[i]));
      })
    }
  }
  { // lower row
    const [cell3, cell4] = b.splitToColumns(row2, b.evenSplitter(2));
    c.frameRight(ctx, cell3);
    { // cell3
      const [c1, c2] = b.splitToColumns(cell3, r.splitByExtent(["*", cellSize * 7]));
      c.frameRight(ctx, c1);
      const block = r.paragraph(ctx, [
        r.mkTextBlock(ctx, "公費負担医療",),
        r.mkTextBlock(ctx, "の受給者番号",),
      ]);
      r.putIn(ctx, block, c1, { halign: "center", valign: "center" });
      let rows = b.splitToColumns(c2, b.evenSplitter(7));
      [2, 5].forEach(i => c.frameRight(ctx, rows[i]));
      c.withPen(ctx, "thin", () => {
        [0, 1, 3, 4].forEach(i => c.frameRight(ctx, rows[i]));
      })
    }
    { // cell4
      const [c1, c2] = b.splitToColumns(cell4, r.splitByExtent(["*", cellSize * 8]));
      c.frameRight(ctx, c1);
      const block = r.paragraph(ctx, [
        r.mkTextBlock(ctx, "被保険者証・被保険",),
        r.mkTextBlock(ctx, "者手帳の記号・番号",),
      ]);
      r.putIn(ctx, block, c1, { halign: "center", valign: "center" });
      let rows = b.splitToColumns(c2, b.evenSplitter(8));
      [1, 3, 6].forEach(i => c.frameRight(ctx, rows[i]));
      c.withPen(ctx, "thin", () => {
        [0, 2, 4, 5].forEach(i => c.frameRight(ctx, rows[i]));
      })
    }
  }
}

function drawLowerBox(ctx: DrawerContext, box: Box) {
  const [block1, block2, drugs, bikou, kaisuu, issueDate, pharma] = b.splitToRows(box, r.splitByExtent([33, 10, "*", 29, 13, 10, 10]));
  { // block1
    const [col1, col2] = b.splitToColumns(block1, b.evenSplitter(2));
    c.frame(ctx, col1);
    [col1, block2, drugs, bikou, kaisuu, issueDate, pharma].forEach(box => c.frame(ctx, box));
    drawPatientBox(ctx, col1);
    drawClinicBox(ctx, col2);
  }
}

function drawPatientBox(ctx: DrawerContext, box: Box) {
  const [mark, body] = b.splitToColumns(box, b.splitAt(5));
  c.frameRight(ctx, mark);
  c.drawTextVertically(ctx, "患　者", mark, "center", "center");
  const rows = b.splitToRows(body, b.splitAt(10, 23));
  [rows[0], rows[1]].forEach(box => c.frameBottom(ctx, box));
  {
    const [c1, c2] = b.splitToColumns(rows[0], b.splitAt(20));
    c.frameRight(ctx, c1);
    c.drawText(ctx, "氏　名", c1, "center", "center");
  }
  { // rows[1]
    const [c1, c2] = b.splitToColumns(rows[1], b.splitAt(20));
    c.frameRight(ctx, c1);
    c.drawText(ctx, "生年月日", c1, "center", "center");
    const [col1, col2, col3] = b.splitToColumns(c2, b.splitAt(4, 30));
    c.frameRight(ctx, col2);
    {
      { // cpl1
        const box = b.modify(col1, b.shrinkVert(1, 1), b.setWidth(2.5, "center"));
        const [meiji, taisho, shouwa, heisei, reiwa] = b.splitToRows(box, b.evenSplitter(5));
        c.withFont(ctx, "f1.5", () => {
          c.drawText(ctx, "明", meiji, "center", "center");
          c.drawText(ctx, "大", taisho, "center", "center");
          c.drawText(ctx, "昭", shouwa, "center", "center");
          c.drawText(ctx, "平", heisei, "center", "center");
          c.drawText(ctx, "令", reiwa, "center", "center");
        })
      }
      { // col2
        const box = b.modify(col2, b.setHeight(2.5, "center"), b.shrinkHoriz(0, 2.5));
        const line = r.line(ctx, [
          w.gap(2.5),
          w.gap(1),
          w.text("年"),
          w.gap(1), w.gap(2.5), w.gap(1), w.text("月"),
          w.gap(1), w.gap(2.5), w.gap(1), w.text("日"),
        ]);
        r.putIn(ctx, line, box, { halign: "right" });
      }
      { // col3
        const box = b.modify(col3, b.setHeight(2.5, "center"));
        const line = r.line(ctx, [
          w.text("男"),
          w.text("・"),
          w.text("女"),
        ]);
        r.putIn(ctx, line, box, { halign: "center" });
      }
    }
  }
  { // rows[2]
    const [c1, c2] = b.splitToColumns(rows[2], b.splitAt(20));
    c.frameRight(ctx, c1);
    c.drawText(ctx, "区　分", c1, "center", "center");
    const [left, right] = b.splitToColumns(c2, b.evenSplitter(2));
    c.frameRight(ctx, left);
    c.drawText(ctx, "被保険者", left, "center", "center");
    c.drawText(ctx, "被扶養者", right, "center", "center");
  }
}

function drawClinicBox(ctx: DrawerContext, box: Box) {
  box = b.modify(box, b.shrinkHoriz(2, 0));
  const [address, name, kikancode] = b.splitToRows(box, b.splitAt(10, 23));
  { // address
    let [left, right] = b.splitToColumns(address, b.splitAt(22));
    const para = r.paragraph(ctx, [
      r.mkTextBlock(ctx, "保険医療機関の"),
      r.mkTextBlock(ctx, "所在地及び名称"),
    ]);
    r.putIn(ctx, para, left, { halign: "center", valign: "center" });
    const width = para.width;
    b.withSplitRows(name, b.evenSplitter(2), ([upper, lower]) => {
      {
        [left, right] = b.splitToColumns(upper, b.splitAt(22));
        const labelBox = b.modify(left, b.setHeight(2.5, "center"), b.setWidth(para.width, "center"));
        let label = w.justifiedText(ctx, "電話番号", labelBox);
        r.putIn(ctx, label, left, { halign: "center", valign: "center" });
      }
      {
        [left, right] = b.splitToColumns(lower, b.splitAt(22));
        const labelBox = b.modify(left, b.setHeight(2.5, "center"), b.setWidth(para.width, "center"));
        let label = w.justifiedText(ctx, "保険医氏名", labelBox);
        r.putIn(ctx, label, left, { halign: "center", valign: "center" });
        const stampBox = b.modify(right, b.setHeight(2.5, "bottom"), b.setWidth(2.5, "right"), b.shift(-3.5, -2.5));
        c.withFont(ctx, "f1.5", () => {
          c.drawText(ctx, "印", stampBox, "center", "center");
        });
        c.withPen(ctx, "thin", () => {
          c.circle(ctx, b.cx(stampBox), b.cy(stampBox), 2.5 * 0.5);
        })
      }
    });
  }
  drawKikanBox(ctx, kikancode);
}

function drawKikanBox(ctx: DrawerContext, box: Box) {
  box = b.modify(box, b.setHeight(6, "top"))
  c.frame(ctx, box);
  const [fukenLabel, fuken, tensuuLabel, tensuu, kikanLabel, kikancode] = b.splitToColumns(box, b.splitAt(23, 28, 38.5, 44, 51));
  [fukenLabel, fuken, tensuuLabel, tensuu, kikanLabel].forEach(box => c.frameRight(ctx, box));
  c.drawText(ctx, "都道府県番号", fukenLabel, "center", "center");
  {
    const para = r.paragraph(ctx, [
      r.mkTextBlock(ctx, "点数表"),
      r.mkTextBlock(ctx, "番号"),
    ], { halign: "center" });
    r.putIn(ctx, para, tensuuLabel, { halign: "center", valign: "center"});
  }
  {
    const para = r.paragraph(ctx, [
      r.mkTextBlock(ctx, "医療機関", "f1.5"),
      r.mkTextBlock(ctx, "コード", "f1.5"),
    ], { halign: "center" });
    r.putIn(ctx, para, kikanLabel, { halign: "center", valign: "center"});
  }
  {
    const cols = b.splitToColumns(kikancode, b.evenSplitter(7));
    [1, 5].forEach(i => c.frameRight(ctx, cols[i]));
    c.withPen(ctx, "thin", () => {
      [0, 2, 3, 4].forEach(i => c.frameRight(ctx, cols[i]));
    })
  }
}