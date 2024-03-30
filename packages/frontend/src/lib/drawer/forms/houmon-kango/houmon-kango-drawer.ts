import { mkDrawerContext, type DrawerContext } from "../../compiler/context";
import type { Op } from "../../compiler/op";
import { HoumonKangoData, type HoumonKangoDataArg } from "./houmon-kango-data";
import * as c from "../../compiler/compiler";
import * as b from "../../compiler/box";
import type { Box } from "../../compiler/box";
import { A4 } from "../../compiler/paper-size";

export function drawHoumonKango(arg: HoumonKangoDataArg = {}): Op[] {
  const data = new HoumonKangoData(arg);
  const ctx = mkDrawerContext();
  const paper: Box = b.paperSizeToBox(A4);
  setupFonts(ctx);
  c.createPen(ctx, "regular", 0, 0, 0, 0.2);
  c.setPen(ctx, "regular");
  drawTitle(ctx, data.title, paper);
  c.setFont(ctx, "regular");
  drawSubtitle(ctx, data.subtitle, paper);
  const mainBox = b.modify(paper, b.inset(16, 33, 19, 56));
  c.rect(ctx, mainBox);
  const rows: Box[] = b.splitToRows(mainBox, b.splitAt(
    8.5, 17, 27.5, 117.5, -75, -52, -42, -32, -18.5
  ));
  rows.forEach(row => c.rect(ctx, row));
  renderRow0(ctx, rows[0]);
  renderRow1(ctx, rows[1]);
  renderRow2(ctx, rows[2]);
  renderRow3(ctx, rows[3]);
  renderRow4(ctx, rows[4]);
  renderRow5(ctx, rows[5]);
  renderRow6(ctx, rows[6]);
  renderRow7(ctx, rows[7]);
  renderRow8(ctx, rows[8]);
  renderRow9(ctx, rows[9]);
  return c.getOps(ctx);
}

function setupFonts(ctx: DrawerContext) {
  c.createFont(ctx, "title", "MS Mincho", 5, "bold");
  c.createFont(ctx, "regular", "MS Mincho", 3.5);
  c.createFont(ctx, "small", "MS Mincho", 3);
  c.createFont(ctx, "input-regular", "MS Gothic", 3.5);
}

function drawTitle(ctx: DrawerContext, title: string, paper: Box) {
  c.setFont(ctx, "title");
  c.drawTextAt(ctx, title, b.cx(paper), 13, { halign: "center", valign: "top" });
}

function drawSubtitle(ctx: DrawerContext, subtitle: string, paper: Box) {
  let box = b.modify(paper, b.setTop(24), b.setRight(113));
  c.drawText(ctx, subtitle, box, "right", "top");
  box = b.modify(box, b.flipRight(), b.setRight(paper.right));
  c.drawComposite(ctx, box, [
    { kind: "text", text: "（令和" },
    { kind: "gap", width: 7, mark: "訪問看護指示期間開始（年）" },
    { kind: "text", text: "年"},
    { kind: "gap", width: 4.5, mark: "訪問看護指示期間開始（月）" },
    { kind: "text", text: "月"},
    { kind: "gap", width: 4.5, mark: "訪問看護指示期間開始（日）" },
    { kind: "text", text: "日～令和" },
    { kind: "gap", width: 7, mark: "訪問看護指示期間期限（年）" },
    { kind: "text", text: "年"},
    { kind: "gap", width: 4.5, mark: "訪問看護指示期間期限（月）" },
    { kind: "text", text: "月"},
    { kind: "gap", width: 4.5, mark: "訪問看護指示期間期限（日）" },
    { kind: "text", text: "日）" },
  ], { halign: "left", valign: "top"})
}

function renderRow0(ctx: DrawerContext, box: Box) {
  const cols: Box[] = b.splitToColumns(box, b.splitAt(20, 83.5));
  cols.forEach(col => c.rect(ctx, col));
  {
    c.drawText(ctx, "患者氏名", cols[0], "left", "center", {
      modifiers: [b.shrinkHoriz(1.5, 0)]
    });
    const cc: Box[] = b.splitToColumns(cols[1], b.splitAt(55.5));
    c.mark(ctx, "患者氏名", cc[0]);
    c.drawText(ctx, "様", cc[1], "left", "center");
  }
  {
    const rr: Box[] = b.splitToRows(cols[2], b.evenSplitter(2));
    c.drawComposite(ctx, b.modify(rr[0], b.shrinkHoriz(1.5, 0)), [
      { kind: "text", text: "生年月日" },
      { kind: "gap", width: 3 },
      { kind: "text", text: "明", mark: "生年月日（元号：明治）"},
      { kind: "text", text: "・"},
      { kind: "text", text: "大", mark: "生年月日（元号：大正）"},
      { kind: "text", text: "・"},
      { kind: "text", text: "昭", mark: "生年月日（元号：昭和）"},
      { kind: "text", text: "・"},
      { kind: "text", text: "平", mark: "生年月日（元号：平成）"},
      { kind: "gap", width: 8, mark: "生年月日（年）"},
      { kind: "text", text: "年"},
      { kind: "gap", width: 8, mark: "生年月日（月）"},
      { kind: "text", text: "月"},
      { kind: "gap", width: 8, mark: "生年月日（日）"},
      { kind: "text", text: "日"},
    ], { valign: "center" });
    c.drawComposite(ctx, b.modify(rr[1], b.shrinkHoriz(63, 0)), [
      { kind: "text", text: "（" },
      { kind: "gap", width: 6, mark: "年齢" },
      { kind: "text", text: "歳）" },
    ], { valign: "center" })
  }
}
function renderRow1(ctx: DrawerContext, box: Box) {
  
}
function renderRow2(ctx: DrawerContext, box: Box) {
  
}
function renderRow3(ctx: DrawerContext, box: Box) {
  
}
function renderRow4(ctx: DrawerContext, box: Box) {
  
}
function renderRow5(ctx: DrawerContext, box: Box) {
  
}
function renderRow6(ctx: DrawerContext, box: Box) {
  
}
function renderRow7(ctx: DrawerContext, box: Box) {
  
}
function renderRow8(ctx: DrawerContext, box: Box) {
  
}
function renderRow9(ctx: DrawerContext, box: Box) {
  
}