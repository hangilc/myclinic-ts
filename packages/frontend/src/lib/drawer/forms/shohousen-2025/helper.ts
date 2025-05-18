import { type Color } from "@/lib/drawer/compiler/compiler";
import type { Box } from "@/lib/drawer/compiler/box";
import * as b from "@/lib/drawer/compiler/box";
import * as c from "@/lib/drawer/compiler/compiler";
import { type DrawerContext } from "@/lib/drawer/compiler/context";
import { pad } from "myclinic-util";

export const black: Color = {
  r: 0,
  g: 0,
  b: 0,
};

export function eightDigits(ctx: DrawerContext, frame: Box, digits?: string) {
  const cols = b.splitToColumns(frame, b.evenSplitter(8));
  [1, 3, 6].forEach(i => {
    c.frameRight(ctx, cols[i]);
  });
  c.withPen(ctx, "thin", () => {
    [0, 2, 4, 5].forEach(i => {
      c.frameRight(ctx, cols[i]);
    })
  });
  if (digits !== undefined ) {
    const str = pad(digits, 8, " ");
    c.withFontAndColor(ctx, "d6", black, () => {
      Array.from(str).forEach(((ch, i) => {
        c.drawText(ctx, ch, cols[i], "center", "center");
      }));
    })
  }
}

export function sevenDigits(ctx: DrawerContext, frame: Box, digits?: string) {
  const cols = b.splitToColumns(frame, b.evenSplitter(7)); 
  [2, 5].forEach(i => {
    c.frameRight(ctx, cols[i]);
  });
  [0, 1, 3, 4].forEach(i => {
    c.withPen(ctx, "thin", () => {
      c.frameRight(ctx, cols[i]);
    })
  });
  if (digits !== undefined ) {
    const str = pad(digits, 7, " ");
    c.withFontAndColor(ctx, "d6", black, () => {
      Array.from(str).forEach(((ch, i) => {
        c.drawText(ctx, ch, cols[i], "center", "center");
      }));
    })
  }
}

