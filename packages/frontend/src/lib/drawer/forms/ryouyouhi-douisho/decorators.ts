import type { DrawerContext } from "@/lib/drawer/compiler/context";
import type { Box } from "@/lib/drawer/compiler/box";
import * as c from "@/lib/drawer/compiler/compiler";
import * as b from "@/lib/drawer/compiler/box";

export function circleDecorator(
  radius: number
): (ctx: DrawerContext, box: Box, orig: (ctx: DrawerContext, box: Box) => void) => void  {
  return (ctx, box, orig) => {
    orig(ctx, box);
    c.withPen(ctx, "data-thin", () => {
      c.circle(ctx, b.cx(box), b.cy(box), radius);
    })
  }
}
