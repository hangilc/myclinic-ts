import { mkDrawerContext, type DrawerContext } from "../../compiler/context";
import type { Op } from "../../compiler/op";
import type { ShinryoumeisaishoData } from "./shinryoumeisaisho-data";
import * as c from "../../compiler/compiler";
import * as b from "../../compiler/box";
import * as p from "../../compiler/composite-item";
import { A4 } from "../../compiler/paper-size";

interface Line {
  kubun: string,
  koumoku: string,
  tensuu: string,
  count: string,
}

export function drawShinryoumeisaisho(data: ShinryoumeisaishoData): Op[][] {
  const pages: Op[][] = [];
  const ctx = mkDrawerContext();
  setupFonts(ctx);
  setupPens(ctx);
  return pages;
}

function setupFonts(ctx: DrawerContext) {
  c.createFont(ctx, "serif-6", "MS Mincho", 6);
  c.createFont(ctx, "serif-5", "MS Mincho", 5);
  c.createFont(ctx, "serif-5-bold", "MS Mincho", 5, "bold", false);
  c.createFont(ctx, "serif-4", "MS Mincho", 4);
  c.createFont(ctx, "serif-3", "MS Mincho", 3);
}

function setupPens(ctx: DrawerContext) {
  c.createPen(ctx, "default", 0, 0, 0, 0.1);
  c.setPen(ctx, "default");
}
