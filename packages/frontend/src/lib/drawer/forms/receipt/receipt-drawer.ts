import { mkDrawerContext, type DrawerContext } from "../../compiler/context";
import type { Op } from "../../compiler/op";
import type { ReceiptDrawerData } from "../../receipt-drawer-data";
import * as c from "../../compiler/compiler";
import * as b from "../../compiler/box";
import type { Box } from "../../compiler/box";
import { A6 } from "../../compiler/paper-size";
import { mkLayout } from "./layout";

export function drawReceipt(data: ReceiptDrawerData): Op[] {
  const ctx = mkDrawerContext();
  setupFonts(ctx);
  c.createPen(ctx, "regular", 0, 0, 0, 0.1);
  c.setPen(ctx, "regular");
  const layout = mkLayout();
  drawTitle(ctx, layout.title);
  drawName(ctx, layout.name);
  drawCharge(ctx, layout.charge);
  drawDate(ctx, layout.date);
  drawIssue(ctx, layout.issue);
  return c.getOps(ctx, { scale: 1, offsetX: 0, offsetY: 0 });
}

function setupFonts(ctx: DrawerContext) {
  c.createFont(ctx, "mincho-6", "MS Mincho", 6);
  c.createFont(ctx, "mincho-4", "MS Mincho", 4);
  c.createFont(ctx, "gothic-5", "MS Gothic", 5);
  c.createFont(ctx, "gothic-4", "MS Gothic", 4);
  c.createFont(ctx, "gothic-2.6", "MS Gothic", 2.6);
  c.createFont(ctx, "name-smaller-font", "MS Mincho", 4.2);
  c.createFont(ctx, "name-multiline-font", "MS Mincho", 3);
}

function drawTitle(ctx: DrawerContext, box: Box) {
  c.setFont(ctx, "mincho-6");
  c.drawTextJustified(ctx, "領収証", box, "top");
}

function drawName(ctx: DrawerContext, box: Box) {
  c.setFont(ctx, "mincho-6");
  c.frameBottom(ctx, box);
  c.drawText(ctx, "様", box, "right", "bottom");
  c.mark(ctx, "nameBox", b.modify(box, b.shrinkHoriz(0, 8)));
}

function drawCharge(ctx: DrawerContext, box: Box) {
  c.drawText(ctx, "領収金額", box, "left", "bottom");
  c.drawText(ctx, "円", box, "right", "bottom");
  c.frameBottom(ctx, box);
  c.mark(ctx, "kingakuBox", b.modify(box, b.shrinkHoriz(24, 6.9)));
}

function drawDate(ctx: DrawerContext, box: Box) {
  c.setFont(ctx, "mincho-4");
  c.drawText(ctx, "診察日", box, "left", "center");
  c.mark(ctx, "dateBox", b.modify(box, b.shrinkHoriz(16, 0)));
}

function drawIssue(ctx: DrawerContext, box: Box) {
  c.setFont(ctx, "mincho-4");
  c.drawText(ctx, "発効日", box, "left", "center");
  c.mark(ctx, "issueBox", b.modify(box, b.shrinkHoriz(16, 0)));
}