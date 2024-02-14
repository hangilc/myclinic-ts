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
  row3: Box;
  row4: Box;
  row5: Box;
  hokengai: Box;
  institute: Box;
  ryoushuu: Box;
}

function nextRow(upper: Box, space: number, height: number, width: number): Box {
  return b.modify(upper, b.flipDown(), b.shiftDown(space), b.setHeight(height, "top"),
    b.setLeft(13), b.setWidth(width, "left"));
}

export function mkLayout(): ReceiptLayout {
  const frameBox: Box = b.paperSizeToBox(A6, { landscape: true });
  const name = b.modify(frameBox, b.innerBox(13, 14, 73, 23));
  const charge = b.modify(name, b.flipRight(), b.shift(8, 0), b.setWidth(52, "left"));
  const date = b.modify(name, b.flipDown(), b.shiftDown(3), b.setHeight(4, "top"), 
    b.setLeft(13), b.setWidth(60, "left"));
  const issue = b.modify(date, b.flipRight(), b.shift(6, 0));
  const row3 = nextRow(date, 3, 10, 120);
  const row4 = nextRow(row3, 3, 10, 120);
  const row5 = nextRow(row4, 1, 10, 120);
  const hokengai = nextRow(row5, 3, 25, 48);
  const institute = b.modify(hokengai, b.flipRight(), b.shift(11, 0), b.setHeight(25, "top"), b.setWidth(30, "left"),
    b.shrinkHoriz(-4, 0));
  const ryoushuu = b.modify(institute, b.flipRight(), b.shift(7, 0), b.setHeight(29, "top"), b.setWidth(24, "left"));
  return {
    paperBox: frameBox,
    title: b.modify(frameBox, b.shift(0, 4), b.setWidth(28, "center"), b.setHeight(6, "top")),
    name,
    charge,
    date,
    issue,
    row3,
    row4,
    row5,
    hokengai,
    institute,
    ryoushuu,
  }
}