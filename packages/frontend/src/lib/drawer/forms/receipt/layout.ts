import type { Box } from "../../compiler/box";
import { A6 } from "../../compiler/paper-size";
import * as b from "../../compiler/box";

export interface ReceiptLayout {
  paperBox: Box;
  title: Box;
  name: Box;
  charge: Box;
  date: Box;
  issue: Box;
}

export function mkLayout(): ReceiptLayout {
  const frameBox: Box = b.paperSizeToBox(A6, { landscape: true });
  const name = b.modify(frameBox, b.innerBox(13, 14, 73, 23));
  const charge = b.modify(name, b.flipRight(), b.shift(8, 0), b.setWidth(52, "left"));
  const date = b.modify(name, b.flipDown(), b.shiftDown(3), b.setHeight(4, "top"), 
    b.setLeft(13), b.setWidth(50, "left"));
  const issue = b.modify(date, b.flipRight(), b.shift(6, 0));
  return {
    paperBox: frameBox,
    title: b.modify(frameBox, b.shift(0, 4), b.setWidth(28, "center"), b.setHeight(6, "top")),
    name,
    charge,
    date,
    issue,
  }
}