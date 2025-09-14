import * as c from "@/lib/drawer/compiler/compiler";
import * as b from "@/lib/drawer/compiler/box";
import type { Decorator } from "./row-renderer";

export function circleMark(
  pred: boolean,
  opt: {
    radius?: number,
    pen?: string,
  } = {}
): { decorator: Decorator } {
  let radius = opt.radius || 2.5;
  let pen = opt.pen || "data-thin";
  return {
    decorator: (ctx, box, orig) => {
      orig(ctx, box);
      if (pred) {
        c.withPen(ctx, pen, () => {
          c.circle(ctx, b.cx(box), b.cy(box), radius);
        })
      }
    }
  };
}
