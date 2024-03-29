import type { DrawerContext } from "../../compiler/context";
import type { Op } from "../../compiler/op";
import * as c from "../../compiler/compiler";
import * as b from "../../compiler/box";
import { A4 } from "../../compiler/paper-size";
import type { Box } from "../../compiler/box";

export interface DrawSeal8x3OptArg {
  startRow?: number;
  startCol?: number;
  cellModifier?: (cell: Box) => Box;
}

class DrawSeal8x3Opt {
  startRow: number;
  startCol: number;
  cellModifier: (cell: Box) => Box;

  constructor(arg: DrawSeal8x3OptArg) {
    this.startRow = arg.startRow ?? 1;
    this.startCol = arg.startCol ?? 1;
    this.cellModifier = arg.cellModifier ?? (c => b.modify(c, b.inset(5)))
  }
}

export function drawSeal8x3(ctx: DrawerContext, texts: string[], optArg: DrawSeal8x3OptArg = {}) {
  const opt = new DrawSeal8x3Opt(optArg);
  const drawBox = b.modify(b.paperSizeToBox(A4), b.inset(
    6, 12.9, 6, 12.9
  ));
  let i = 0;
  let row = opt.startRow;
  let col = opt.startCol;
  for (; row <= 8; row++) {
    for (; col <= 3; col++) {
      let cell = getCell(drawBox, row, col);
      cell = opt.cellModifier(cell);
      const lines = texts[i++].split("\n");
      c.drawTexts(ctx, lines, cell, { halign: "left" });
    }
    col = 1;
  }
}

function getCell(box: b.Box, row: number, col: number): b.Box {
  const width = b.width(box);
  const height = b.height(box);
  const left = box.left + width / 3.0 * (col - 1);
  const top = box.top + height / 8.0 * (row - 1);
  return b.mkBox(left, top, left + width / 3.0, top + height / 8.0);
}