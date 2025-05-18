import type { Box } from "@/lib/drawer/compiler/box";
import * as b from "@/lib/drawer/compiler/box";
import * as c from "@/lib/drawer/compiler/compiler";
import * as r from "../row-renderer";
import { type DrawerContext } from "@/lib/drawer/compiler/context";
import type { ShohousenData2025 } from "../data2025";

export function drawKubun(
  ctx: DrawerContext,  frame: Box, leftWidth: number, data: ShohousenData2025
) {
  let [label, body] = b.splitToColumns(frame, b.splitAt(leftWidth));
  c.frameRight(ctx, label);
  c.drawText(ctx, "区　分", label, "center", "center");
  drawBody(ctx, body, data);
}

function drawBody(ctx: DrawerContext, frame: Box, data: ShohousenData2025) {
  let kubun = data.hokenKubun;
  r.renderRow(ctx, frame,
    r.gap((ctx, box) => {
      c.frameRight(ctx, box);
      c.drawText(ctx, "被保険者", box, "center", "center");
      if( kubun === "hihokensha" ){
        c.withPen(ctx, "data-thin", () => {
          c.circle(ctx, b.cx(box), b.cy(box), 1.5);
        })
      }
    }),
    r.gap((ctx, box) => {
      c.drawText(ctx, "被扶養者", box, "center", "center");
      if( kubun === "hifuyousha" ){
        c.withPen(ctx, "data-thin", () => {
          c.circle(ctx, b.cx(box), b.cy(box), 1.5);
        })
      }
    }),
  );
}






