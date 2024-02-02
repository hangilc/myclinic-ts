import type { Op } from "../../compiler/op";
import { mkDrawerContext, type DrawerContext } from "../../compiler/context";
import * as b from "../../compiler/box";
import type { Box } from "../../compiler/box";
import { A5 } from "../../compiler/paper-size";
import * as c from "../../compiler/compiler";

export function drawShohousen(): Op[] {
  const ctx = mkDrawerContext();
  initFont(ctx);
  const paperBox = b.paperSizeToBox(A5);
  const outerBox = b.modify(paperBox, b.inset(3));
  c.setTextColor(ctx, 0, 255, 0);
  c.createPen(ctx, "default-pen", 0, 255, 0, 0.16);
  c.setPen(ctx, "default-pen");
  drawTitle(ctx, outerBox);
  return c.getOps(ctx);
}

function initFont(ctx: DrawerContext) {
  c.createFont(ctx, "mincho-5", "MS Mincho", 5);
  c.createFont(ctx, "mincho-4.5", "MS Mincho", 4.5);
  c.createFont(ctx, "mincho-4", "MS Mincho", 4);
  c.createFont(ctx, "mincho-3.5", "MS Mincho", 3.5);
  c.createFont(ctx, "mincho-3", "MS Mincho", 3);
  c.createFont(ctx, "mincho-2.5", "MS Mincho", 2.5);
  c.createFont(ctx, "mincho-2", "MS Mincho", 2);
  c.createFont(ctx, "mincho-1.8", "MS Mincho", 1.8);
  c.createFont(ctx, "mincho-1.5", "MS Mincho", 1.5);
  c.createFont(ctx, "mincho-1.4", "MS Mincho", 1.4);
  c.createFont(ctx, "gothic-4.5", "MS Gothic", 4.5);
  c.createFont(ctx, "gothic-4", "MS Gothic", 4);
  c.createFont(ctx, "gothic-4", "MS Gothic", 4);
  c.createFont(ctx, "gothic-3.5", "MS Gothic", 3.5);
  c.createFont(ctx, "gothic-3", "MS Gothic", 3);
  c.createFont(ctx, "gothic-2.5", "MS Gothic", 2.5);

}

function drawTitle(ctx: DrawerContext, box: Box) {
  // Box box1 = wrap.shiftDown(1).setLeft(51).setRight(93);
  // compiler.setFont("mincho-5");
  // compiler.textAtJustified("処方せん", box1.getLeft(), box1.getRight(), box1.getTop(), VAlign.Top);
  // Box box2 = box1.shiftDown(6);
  // compiler.setFont("mincho-2.5");
  // compiler.textIn("(この処方せんは、どの保険薬局でも有効です。)", box2, HAlign.Center, VAlign.Top);
  box = b.modify(box, b.shiftDown(1), b.setLeft(51), b.setRight(93));
  c.setFont(ctx, "mincho-5");
  c.drawTextJustified(ctx, "処方せん", box, "top");
}