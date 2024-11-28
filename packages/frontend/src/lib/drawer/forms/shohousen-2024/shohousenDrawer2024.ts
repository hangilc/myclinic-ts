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
  let box = b.modify(paper, b.shrinkVert(1, 0));
  box = b.withSlice(box, 4, box => drawTitle(ctx, b.modify(box, b.setWidth(30, "center"))));
  box = b.withSlice(box, 2.5, (box) => {
    box = b.modify(box, b.shiftDown(2));
    c.drawText(ctx, "(この処方箋は、どの保険薬局でも有効です。)", box, "center", "center");
  });
  const innerBox = b.modify(paper, b.shrinkHoriz(4, 4), b.shrinkVert(12, 5));
  const upperBox = b.modify(innerBox, b.setHeight(20, "top"));
  const lowerBox = b.modify(innerBox, b.shrinkVert(23, 0));
  c.frame(ctx, upperBox);
  c.frame(ctx, lowerBox);
  return c.getOps(ctx);
}

function initFont(ctx: DrawerContext) {
  c.createFont(ctx, "f4", "MS Mincho", 4);
  c.createFont(ctx, "f2.5", "MS Mincho", 2.5);
}

function initPen(ctx: DrawerContext) {
  c.createPen(ctx, "default", 0, 0, 0, 0.2);
}

function drawTitle(ctx: DrawerContext, box: Box){
  const block = justifiedText(ctx, "処方箋", box, { font: "f4" });
  r.putIn(ctx, block, box, { halign: "center", valign: "center" });
}