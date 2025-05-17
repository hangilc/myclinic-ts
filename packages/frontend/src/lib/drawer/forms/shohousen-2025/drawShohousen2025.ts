import { type Op } from "@/lib/drawer/compiler/op";
import { type ShohousenData2025} from "./data2025";
import { A5 } from "@/lib/drawer/compiler/paper-size";
import * as b from "@/lib/drawer/compiler/box";
import { mkDrawerContext, type DrawerContext } from "@/lib/drawer/compiler/context";
import * as c from "@/lib/drawer/compiler/compiler";
import { mkBox, type Box } from "@/lib/drawer/compiler/box";

export function drawShohousen2025(data: ShohousenData2025): Op[][] {
  const paper: Box = mkBox(0, 0, A5.width, A5.height);
  const ctx = mkDrawerContext();
  initFont(ctx);
  initPen(ctx);
  c.setFont(ctx, "f2.5");
  c.setTextColor(ctx, 0, 255, 0);
  c.setPen(ctx, "default");
  const outerBounds = b.modify(paper, b.inset(3));
  const innerBounds = b.modify(outerBounds, b.inset(1, 0, 1, 1));
  let [title1, title2, main] = b.splitToRows(innerBounds, b.splitWidths(6, 2));
  c.withFont(ctx, "f4", () => c.drawText(ctx, "処方箋", title1, "center", "center"));
  c.drawText(ctx, "(この処方箋は、どの保険薬局でも有効です。)", title2, "center", "center");
  c.frame(ctx, outerBounds);
  main = b.modify(main, b.inset(2, 3, 2, 0))
  c.frame(ctx, main);
  return [ctx.ops];
}

function initFont(ctx: DrawerContext) {
  c.createFont(ctx, "f4", "MS Mincho", 4);
  c.createFont(ctx, "f2.5", "MS Mincho", 2.5);
  c.createFont(ctx, "f2.3", "MS Mincho", 2.3);
  c.createFont(ctx, "f1.8", "MS Mincho", 1.8);
  c.createFont(ctx, "f1.5", "MS Mincho", 1.5);
  c.createFont(ctx, "d6", "MS Gothic", 6);
  c.createFont(ctx, "d5", "MS Gothic", 5);
  c.createFont(ctx, "d4", "MS Gothic", 4);
  c.createFont(ctx, "d3.5", "MS Gothic", 3.5);
  c.createFont(ctx, "d3", "MS Gothic", 3);
  c.createFont(ctx, "d2.5", "MS Gothic", 2.5);
}

function initPen(ctx: DrawerContext) {
  c.createPen(ctx, "default", 0, 255, 0, 0.25);
  c.createPen(ctx, "thin", 0, 255, 0, 0.1);
  c.createPen(ctx, "data-thin", 0, 0, 0, 0.1);
}
