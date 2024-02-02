import type { Box } from "../../compiler/box";
import type { DrawerContext } from "../../compiler/context";
import * as c from "../../compiler/compiler";
import * as b from "../../compiler/box";

export function drawTopBox(ctx: DrawerContext, box: Box) {
  c.rect(ctx, box);
  const [col1, col2] = b.splitToColumns(box, 62);
  drawKouhi(ctx, b.modify(col1, b.shrinkHoriz(0, 2)));
  drawHoken(ctx, col2);
}

function drawKouhi(ctx: DrawerContext, box: Box) {
  const [row1, row2] = b.divideToRows(box, 2);
  c.rect(ctx, row1);
}

function drawHoken(ctx: DrawerContext, box: Box) {
  
}