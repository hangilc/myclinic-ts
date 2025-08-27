import type { Box } from "./box";
import type { DrawerContext } from "./context";
import * as c from "./compiler";

export function drawLeftSquareBracket(ctx: DrawerContext, box: Box, opt?: { pen?: string }) {
  c.withPen(ctx, opt?.pen, () => {
    c.frameTop(ctx, box);
    c.frameLeft(ctx, box);
    c.frameBottom(ctx, box);
  });
}

export function drawRightSquareBracket(ctx: DrawerContext, box: Box, opt?: { pen?: string }) {
  c.withPen(ctx, opt?.pen, () => {
    c.frameTop(ctx, box);
    c.frameRight(ctx, box);
    c.frameBottom(ctx, box);
  });
}
