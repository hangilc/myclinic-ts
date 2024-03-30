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
  drawTitle(ctx, data.title, paper);
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