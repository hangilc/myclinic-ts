import { mkDrawerContext, type DrawerContext } from "../../compiler/context";
import type { Op } from "../../compiler/op";
import type { ShinryoumeisaishoData } from "./shinryoumeisaisho-data";
import * as c from "../../compiler/compiler";
import * as b from "../../compiler/box";
import { A4 } from "../../compiler/paper-size";
import type { Box } from "../../compiler/box";
import { DateWrapper, zip } from "myclinic-util";
import { LineCompiler } from "./shinryoumeisaisho-line";

export function drawShinryoumeisaisho(data: ShinryoumeisaishoData): Op[][] {
  const pages: Op[][] = [];
  const ctx = mkDrawerContext();
  setupFonts(ctx);
  setupPens(ctx);
  const paper: Box = b.paperSizeToBox(A4);
  drawTitle(ctx, paper);
  const outline: Box = b.modify(paper, b.inset(21, 39, 0, 74), b.setWidth(161, "left"));
  const [upper, _, lower] = b.splitToRows(outline, b.splitAt(9, 13));
  const addr = b.modify(lower, b.flipDown(), b.setHeight(30, "top"), b.shiftDown(2));
  drawUpper(ctx, upper, data);
  drawLower(ctx, lower, data);
  drawAddr(ctx, addr, data);
  pages.push(c.getOps(ctx));
  return pages;
}

function setupFonts(ctx: DrawerContext) {
  c.createFont(ctx, "f7", "MS Gothic", 7);
  c.createFont(ctx, "f3", "MS Gothic", 3);
  c.setFont(ctx, "f3");
}

function setupPens(ctx: DrawerContext) {
  c.createPen(ctx, "default", 0, 0, 0, 0.2);
  c.setPen(ctx, "default");
}

function drawTitle(ctx: DrawerContext, box: Box) {
  c.withFont(ctx, "f7", () => {
    c.drawTextAt(ctx, "診療明細書", b.cx(box), 28, { halign: "center", valign: "center" });
  })
}

function drawUpper(ctx: DrawerContext, box: Box, data: ShinryoumeisaishoData) {
  c.frame(ctx, box);
  const [row1, row2] = b.splitToRows(box, b.evenSplitter(2));
  c.frame(ctx, row1);
  c.frame(ctx, row2);
  {
    const cols = b.splitToColumns(row1, b.splitAt(23, 54, 63, 106, 129));
    cols.forEach(col => c.frame(ctx, col));
    c.drawText(ctx, "患者番号", cols[0], "center", "center");
    c.drawText(ctx, data.patientId, cols[1], "center", "center");
    c.drawText(ctx, "氏名", cols[2], "center", "center");
    c.drawText(ctx, data.patientName, cols[3], "center", "center");
    c.drawText(ctx, "受診日", cols[4], "center", "center");
    c.drawText(ctx, DateWrapper.from(data.visitedAt).render(d => {
      return `${d.getYear()}年${d.getMonth()}月${d.getDay()}日`;
    }), cols[5], "center", "center");
  }
  {
    const cols = b.splitToColumns(row2, b.splitAt(23));
    cols.forEach(col => c.frame(ctx, col));
    c.drawText(ctx, "受診科", cols[0], "center", "center");
  }
}

function drawLower(ctx: DrawerContext, box: Box, data: ShinryoumeisaishoData) {
  c.frame(ctx, box);
  let [title, main] = b.splitToRows(box, b.splitAt(4));
  [title, main].forEach(col => c.frame(ctx, col));
  const splits = [23, 106, 143];
  {
    const cols = b.splitToColumns(title, b.splitAt(...splits));
    cols.forEach(col => c.frame(ctx, col));
    const labels = ["区分", "項目名", "点数", "回数"];
    zip(cols, labels).forEach(([col, label]) => {
      c.drawText(ctx, label, col, "center", "center");
    })
  }
  {
    b.splitToColumns(main, b.splitAt(...splits)).forEach(col => c.frame(ctx, col));
    main = b.modify(main, b.inset(0, 0.5));
    let fontSize = c.currentFontSize(ctx);
    let [kubunCol, nameCol, tensuuCol, kaisuuCol] = b.splitToColumns(main, b.splitAt(...splits))
      .map(col => b.modify(col, b.inset(0.5, 0)));
    nameCol = b.modify(nameCol, b.shrinkHoriz(fontSize, 0));
    const lineComp = new LineCompiler(fontSize, b.width(kubunCol), b.width(nameCol),
      b.width(tensuuCol), b.width(kaisuuCol));
    data.kubunList.forEach(kubun => {
      const lines = lineComp.breakToLines(kubun.kubunName, kubun.name, kubun.tensuu.toString(), kubun.count.toString());
      lines.forEach((line, i) => {
        c.drawText(ctx, line.kubun, kubunCol, "left", "top");
        if (i === 0) {
          const box = b.modify(nameCol, b.flipLeft(), b.setWidth(fontSize, "right"));
          c.drawText(ctx, "*", box, "center", "top");
        }
        c.drawText(ctx, line.name, nameCol, "left", "top");
        c.drawText(ctx, line.tensuu, tensuuCol, "right", "top");
        c.drawText(ctx, line.kaisuu, kaisuuCol, "right", "top");
        kubunCol = b.modify(kubunCol, b.shrinkVert(fontSize, 0));
        nameCol = b.modify(nameCol, b.shrinkVert(fontSize, 0));
        tensuuCol = b.modify(tensuuCol, b.shrinkVert(fontSize, 0));
        kaisuuCol = b.modify(kaisuuCol, b.shrinkVert(fontSize, 0));
      })
    })
  }
}

function drawAddr(ctx: DrawerContext, box: Box, data: ShinryoumeisaishoData) {
  const fontSize = c.currentFontSize(ctx);
  c.drawText(ctx, data.clinicAddress, box, "right", "top");
  box = b.modify(box, b.shrinkVert(fontSize, 0));
  c.drawText(ctx, data.clinicName, box, "right", "top");
}
