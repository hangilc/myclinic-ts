import type { Op } from "../../compiler/op";
import * as c from "../../compiler/compiler";
import * as b from "../../compiler/box";
import { mkDrawerContext } from "../../compiler/context";
import { type DrawerContext as DC } from "../../compiler/context";
import { type Box } from "../../compiler/box";
import { A4 } from "../../compiler/paper-size";

export interface RyouyouKeikakushoData {

}

export function drawRyouyouKeikakusho(data: RyouyouKeikakushoData): Op[] {
  const ctx = mkDrawerContext();
  setupFonts(ctx);
  const paper: Box = b.paperSizeToBox(A4);
  const areas: Box[] = b.splitToRows(b.modify(paper, b.shrinkHoriz(10, 10)), b.splitAt(38, 262));
  drawUpperArea(ctx, areas[0]);
  drawMiddleArea(ctx, areas[1]);
  drawLowerArea(ctx, areas[2]);

  return c.getOps(ctx);
}

function setupFonts(ctx: DC) {
  c.createFont(ctx, "f5", "MS Mincho", 5);
}

function drawUpperArea(ctx: DC, box: Box) {
  c.setFont(ctx, "f5");
  box = b.modify(box, b.shrinkVert(0, 1));
  c.drawText(ctx, "生活習慣病　療養計画書　初回用", box, "left", "bottom");
  const right: Box = b.modify(box, b.setWidth(80, "right"));
  c.drawComposite(ctx, right, [
    { kind: "text", text: "（記入日：" }, 
    { kind: "gap-to", at: 32, mark: "issue-year" },
    { kind: "text", text: "年" },
    { kind: "gap-to", at: 50, mark: "issue-month" },
    { kind: "text", text: "月" },
    { kind: "gap-to", at: 65, mark: "issue-day" },
    { kind: "text", text: "日）" },
  ], { valign: "bottom", halign: "left", })
}
function drawMiddleArea(ctx: DC, box: Box) {

}
function drawLowerArea(ctx: DC, box: Box) {

}