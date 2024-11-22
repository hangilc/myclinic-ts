import type { Box } from "./box";
import type { DrawerContext } from "./context";
import * as b from "./box";
import * as c from "./compiler";
import type { HAlign, VAlign } from "./align";

export type Block = {
  width: number | { kind: "rightAt", rightAt: number };
  render: (ctx: DrawerContext, box: Box) => void;
}

export function seq(ctx: DrawerContext, box: Box, items: (Block | "expander")[], opt?: {
}) {
  let x = 0;
  let expanderCount = 0;
  items.forEach(item => {
    if (item === "expander") {
      expanderCount += 1;
    } else {
      if (typeof item.width === "number") {
        x += item.width;
      } else {
        switch (item.width.kind) {
          case "rightAt": {
            if (expanderCount > 0) {
              throw new Error("Expander cannot precede rightAt");
            }
            x = item.width.rightAt;
            break;
          }
          default: {
            console.error(`Unknown width type: ${item.width}`);
            break;
          }
        }
      }
    }
  });
  const extra = Math.max(0, b.width(box) - x);
  const expanderWidth = expanderCount > 0 ? extra / expanderCount : 0;
  x = 0;
  items.forEach(item => {
    if (item === "expander") {
      x += expanderWidth;
    } else {
      let renderWidth: number;
      if (typeof item.width === "number") {
        renderWidth = item.width;
      } else {
        switch (item.width.kind) {
          case "rightAt": {
            renderWidth = item.width.rightAt - x;
            break;
          }
          default: throw new Error(`Unknown width type: ${item.width}`);
        }
      }
      const renderBox: Box = b.modify(box, b.shrinkHoriz(x, 0), b.setWidth(renderWidth, "left"));
      item.render(ctx, renderBox);
      x = renderBox.right - box.left;
    }
  })
}

export function textBlock(ctx: DrawerContext, text: string, opt?: {
  font?: string;
  halign?: HAlign;
  valign?: VAlign;
  rightAt?: number;
  width?: number;
  render?: (ctx: DrawerContext, box: Box) => void;
}): Block {
  const font = opt?.font;
  const halign = opt?.halign ?? "left";
  const valign = opt?.valign ?? "top";
  const rightAt = opt?.rightAt;
  let width: number | { kind: "rightAt", rightAt: number };
  if( typeof opt?.width === "number" ){
    width = opt?.width;
  } else if( rightAt !== undefined ){
    width = { kind: "rightAt", rightAt };
  } else {
    width = textWidth(ctx, text, font);
  }
  const render = opt?.render;
  return {
    width,
    render: (ctx: DrawerContext, box: Box) => {
      c.drawText(ctx, text, box, halign, valign);
      if( render) {
        render(ctx, box);
      }
    }
  }
}

function textWidth(ctx: DrawerContext, text: string, font: string | undefined): number {
  return font ? c.textWidthWithFont(ctx, text, font) : c.textWidth(ctx, text);
}

export function gap(width: number): Block {
  return {
    width,
    render: () => {},
  }
}
