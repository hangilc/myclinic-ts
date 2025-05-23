import { type Color } from "@/lib/drawer/compiler/compiler";
import type { Box } from "@/lib/drawer/compiler/box";
import * as b from "@/lib/drawer/compiler/box";
import * as c from "@/lib/drawer/compiler/compiler";
import { drawElement, rowElement, rowOfElements, type Element } from "./element";
import { type DrawerContext } from "@/lib/drawer/compiler/context";
import { DateWrapper, pad } from "myclinic-util";
import * as r from "./row-renderer";
import { breakSingleLine } from "@/lib/drawer/compiler/break-lines";
import type { HAlign } from "@/lib/drawer/compiler/align";

export const black: Color = {r: 0, g: 0, b: 0,};
export const green: Color = { r: 0, g: 255, b: 0 };
export const red: Color = { r: 255, g: 0, b: 0 };
export const lightRed: Color = { r: 255, g: 127, b: 127 };

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

export function nenMonthDayRenderer(
  ctx: DrawerContext, box: Box, date?: DateWrapper,
  opt?: {
    gengou?: string, nenWidth?: number; monthWidth?: number; dayWidth?: number; gap?: number
  }) {
    const nenWidth = opt?.nenWidth ?? 2.5;
    const monthWidth = opt?.monthWidth ?? 2.5;
    const dayWidth = opt?.dayWidth ?? 2.5;
    const gap = opt?.gap ?? 1;
    
    function content(width: number, value: string | number | undefined ): r.Item {
      return r.fixed(width, (ctx, box) => {
        if( value ){
          c.withFontAndColor(ctx, "d2.5", black, () => {
            c.drawText(ctx, value.toString(), box, "right", "center");
          })
        }
      })
    }
    
    r.renderRow(ctx, box,
      r.gap(),
      ...(opt?.gengou ? [r.t(opt.gengou), r.fixed(gap)] : []),
      content(nenWidth, date?.getNen()),
      r.fixed(gap),
      r.t("年"),
      r.fixed(gap),
      content(monthWidth, date?.getMonth()),
      r.fixed(gap),
      r.t("月"),
      content(dayWidth, date?.getDay()),
      r.fixed(gap),
      r.t("日"),
    )
  }

export function nenMonthDayElement(
  ctx: DrawerContext, date?: DateWrapper,
  opt?: {
    gengou?: string, nenWidth?: number; monthWidth?: number; dayWidth?: number; gap?: number
  }): Element {
    const nenWidth = opt?.nenWidth ?? 2.5;
    const monthWidth = opt?.monthWidth ?? 2.5;
    const dayWidth = opt?.dayWidth ?? 2.5;
    const gap = opt?.gap ?? 1;
    
    function content(width: number, value: string | number | undefined ): r.FixedWidthItem {
      return r.fixed(width, (ctx, box) => {
        if( value ){
          c.withFontAndColor(ctx, "d2.5", black, () => {
            c.drawText(ctx, value.toString(), box, "right", "center");
          })
        }
      })
    }
    
    return rowElement(ctx,
      ...(opt?.gengou ? [r.t(opt.gengou), r.fixed(gap)] : []),
      content(nenWidth, date?.getNen()),
      r.fixed(gap),
      r.t("年"),
      r.fixed(gap),
      content(monthWidth, date?.getMonth()),
      r.fixed(gap),
      r.t("月"),
      r.fixed(gap),
      content(dayWidth, date?.getDay()),
      r.fixed(gap),
      r.t("日"),
    )
  }

function leftBracket(width: number, height: number,
  pen: string | undefined = undefined, vertOffset: number = 0): Element {
    return {
      width: () => width,
      height: () => height,
      render: (ctx, box) => {
        c.withPen(ctx, pen, () => {
          c.moveTo(ctx, box.right, box.top + vertOffset);
          c.lineTo(ctx, box.left, box.top + vertOffset);
          c.lineTo(ctx, box.left, box.bottom - vertOffset);
          c.lineTo(ctx, box.right, box.bottom - vertOffset)
        })
      }
    }
  }

function rightBracket(width: number, height: number,
  pen: string | undefined = undefined, vertOffset: number = 0): Element {
    return {
      width: () => width,
      height: () => height,
      render: (ctx, box) => {
        c.withPen(ctx, pen, () => {
          c.moveTo(ctx, box.left, box.top + vertOffset);
          c.lineTo(ctx, box.right, box.top + vertOffset);
          c.lineTo(ctx, box.right, box.bottom - vertOffset);
          c.lineTo(ctx, box.left, box.bottom - vertOffset)
        })
      }
    }
  }

export function brackettedElement(inner: Element, opt?: {
  size?: number,
  pen?: string;
  vertOffset?: number,
}): Element {
  let size = opt?.size ?? 0.75;
  let vertOffset = opt?.vertOffset ?? 0;
  return {
    width: (ctx) => size * 2 + inner.width(ctx),
    height: (ctx) => inner.height(ctx),
    render: (ctx, box) => {
      let height = inner.height(ctx);
      let leftbra = leftBracket(size, height, opt?.pen, vertOffset);
      let rightbra = rightBracket(size, height, opt?.pen, vertOffset);
      let ele = rowOfElements([leftbra, inner, rightbra]);
      drawElement(ctx, box, ele, { halign: "left", valign: "top" });
    }
  }
}

export function flowTextIn(ctx: DrawerContext, box: Box, text: string, opt?: {
  font?: string;
  color?: Color;
  leading?: number;
  halign?: HAlign;
}): string {
  const font = opt?.font;
  const fontSize = c.getFontSizeOf(ctx, font);
  const lineWidth = b.width(box);
  const halign = opt?.halign ?? "left";
  let start = 0;
  let leading = opt?.leading ?? 0;
  let iter = 0;
  let top = box.top;
  while (start < text.length) {
    if( top + fontSize > box.bottom ){
      break;
    }
    const end = breakSingleLine(text, start, fontSize, lineWidth);
    const line = text.substring(start, end).trimEnd();
    let lineBox = Object.assign({}, box, { top });
    c.withFontAndColor(ctx, font, opt?.color, () => {
      c.drawText(ctx, line, lineBox, halign, "top");
    });
    start = end;
    top += fontSize + leading;
    if (++iter > 200) {
      throw new Error("too many iteration (flowTextIn)");
    }
  }
  return text.substring(start);
}

export function availableLines(
  height: number, lineHeight: number, leading: number
): number {
  if( height < lineHeight ){
    return 0;
  } else {
    let rest = height - lineHeight;
    return 1 + Math.floor(rest / (lineHeight + leading));
  }
}
