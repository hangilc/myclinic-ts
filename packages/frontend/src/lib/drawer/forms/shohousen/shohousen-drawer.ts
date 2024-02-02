import type { Op } from "../../compiler/op";
import { mkDrawerContext, type DrawerContext } from "../../compiler/context";
import * as b from "../../compiler/box";
import type { Box } from "../../compiler/box";
import { A5 } from "../../compiler/paper-size";
import * as c from "../../compiler/compiler";

export function drawShohousen(): Op[] {
  const ctx = mkDrawerContext();
  let box = b.paperSizeToBox(A5);
  return [];
}

function drawTitle(ctx: DrawerContext, box: Box) {
  // Box box1 = wrap.shiftDown(1).setLeft(51).setRight(93);
  // compiler.setFont("mincho-5");
  // compiler.textAtJustified("処方せん", box1.getLeft(), box1.getRight(), box1.getTop(), VAlign.Top);
  // Box box2 = box1.shiftDown(6);
  // compiler.setFont("mincho-2.5");
  // compiler.textIn("(この処方せんは、どの保険薬局でも有効です。)", box2, HAlign.Center, VAlign.Top);
  box = b.modify(box, b.shiftDown(1), b.setLeft(51), b.setRight(93));
  

}