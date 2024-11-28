import { mkDrawerContext, type DrawerContext } from "../../compiler/context";
import type { Op } from "../../compiler/op";
import type { ShohousenData2024 } from "./shohousenData2024";
import * as c from "../../compiler/compiler";
import * as b from "../../compiler/box";
import * as r from "../../compiler/render";
import { A5 } from "../../compiler/paper-size";
import type { Box } from "../../compiler/box";
import { justifiedText } from "./widgets";

export function drawShohousen2024(data: ShohousenData2024): Op[] {
  const ctx = mkDrawerContext();
  initFont(ctx);
  initPen(ctx);
  c.setFont(ctx, "f2.5");
  c.setPen(ctx, "default");
  const paper = b.mkBox(0, 0, A5.width, A5.height);
  const bounds = b.modify(paper, b.inset(4));
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
}

function initPen(ctx: DrawerContext) {
  c.createPen(ctx, "default", 0, 0, 0, 0.25);
  c.createPen(ctx, "thin", 40, 40, 40, 0.1);
}

function drawTitle(ctx: DrawerContext, box: Box){
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
  c.frame(ctx, box);
}