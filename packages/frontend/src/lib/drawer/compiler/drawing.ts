import type { Box } from "./box";
import type { DrawerContext } from "./context";
import * as c from "./compiler";
import * as b from "./box";

export function drawLeftSquareBracket(ctx: DrawerContext, box: Box, opt?: { pen?: string }) {
  box = b.modify(box, b.shrinkHoriz(b.width(box) * 0.5, 0));
  c.withPen(ctx, opt?.pen, () => {
    c.frameTop(ctx, box);
    c.frameLeft(ctx, box);
    c.frameBottom(ctx, box);
  });
}

export function drawRightSquareBracket(ctx: DrawerContext, box: Box, opt?: { pen?: string }) {
  box = b.modify(box, b.shrinkHoriz(0, b.width(box) * 0.5));
  c.withPen(ctx, opt?.pen, () => {
    c.frameTop(ctx, box);
    c.frameRight(ctx, box);
    c.frameBottom(ctx, box);
  });
}
