import type { Box } from "./box";
import type { DrawerContext } from "./context";
import * as b from "./box";
import * as c from "./compiler";
import type { HAlign, VAlign } from "./align";

export type Block = {
  width: number | { rightAt: number };
  render: (ctx: DrawerContext, box: Box) => void;
}

export function seq(ctx: DrawerContext, box: Box, items: (Block | "expander")[], opt?: {
}) {
  const blockWidth: number = items.reduce((acc, ele) => {
    if( ele === "expander" ){
      return acc;
    } else {
      return acc + ele.width;
    }
  }, 0);
  const extraWidth: number = Math.max(0, b.width(box) - blockWidth);
  const expanderCount: number = items.reduce((acc, ele) => {
    if( ele === "expander" ){
      return acc + 1;
    } else {
      return acc;
    }
  }, 0);
  let x = 0;
  items.forEach(item => {
    if( item === "expander" ){
      x += extraWidth / expanderCount;
    } else {
      const renderBox: Box = b.modify(box, b.shrinkHoriz(x, 0), b.setWidth(item.width, "left"));
      item.render(ctx, renderBox);
    }
  })
}

export function textBlock(ctx: DrawerContext, text: string, opt?: {
  font?: string;
  halign?: HAlign;
  valign?: VAlign;
}): Block {
  const font = opt?.font;
  const width: number = font ? c.textWidthWithFont(ctx, text, font) : c.textWidth(ctx, text);
  const halign = opt?.halign ?? "left";
  const valign = opt?.valign ?? "top";
  return {
    width,
    render: (ctx: DrawerContext, box: Box) => {
      c.drawText(ctx, text, box, halign, valign);
    }
  }
}
