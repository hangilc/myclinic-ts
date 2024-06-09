import { mkDrawerContext, type DrawerContext } from "../../compiler/context";
import type { Op } from "../../compiler/op";
import type { ReferDrawerData } from "./refer-drawer-data";
import * as c from "../../compiler/compiler";
import * as b from "../../compiler/box";
import { A4 } from "../../compiler/paper-size";
import type { Box } from "../../compiler/box";

export function drawRefer(data: ReferDrawerData): Op[] {
  const ctx = mkDrawerContext();
  setupFonts(ctx);
  setupPens(ctx);
  const paper: Box = b.paperSizeToBox(A4);
  drawTitle(ctx, b.cx(paper), 41);
  
  c.rect(ctx, paper);
  return c.getOps(ctx);
}

function setupFonts(ctx: DrawerContext) {
  c.createFont(ctx, "serif-6", "MS Mincho", 6);
  c.createFont(ctx, "serif-5", "MS Mincho", 5);
  c.createFont(ctx, "serif-5-bold", "MS Mincho", 5, "bold", false);
  c.createFont(ctx, "serif-4", "MS Mincho", 4);
}

function setupPens(ctx: DrawerContext) {
  c.createPen(ctx, "default", 0, 0, 0, 0.05);
}

function drawTitle(ctx: DrawerContext, x: number, y: number) {
  const box = b.mkBox(x - 10, y - 5, x + 10, y + 5);
  c.mark(ctx, "title", box, {
    
  })
}