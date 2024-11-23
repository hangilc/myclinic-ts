import type { Box } from "./box";
import type { DrawerContext } from "./context";
import * as b from "./box";
import * as c from "./compiler";
import type { HAlign, VAlign } from "./align";

export type BlockWidth = number | { kind: "rightAt", rightAt: number } | "expand";

export type Block = {
  width: BlockWidth;
  render: (ctx: DrawerContext, box: Box) => void;
}

export function seq(ctx: DrawerContext, box: Box, items: Block[], opt?: {
  halign?: HAlign
}) {
  let x = 0;
  let expanderCount = 0;
  items.forEach(item => {
    if (item.width === "expand") {
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
  const properWidth = expanderCount > 0 ? b.width(box) : x;
  const extra = Math.max(0, b.width(box) - x);
  const expanderWidth = expanderCount > 0 ? extra / expanderCount : 0;
  x = 0;
  if( opt?.halign === "center" ){
    x = (b.width(box) - properWidth) / 2.0;
  } else if( opt?.halign === "right" ){
    x = b.width(box) - properWidth;
  }
  items.forEach(item => {
    let renderWidth: number;
    if (item.width === "expand") {
      renderWidth = expanderWidth;
    } else {
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
    }
    const renderBox: Box = b.modify(box, b.shrinkHoriz(x, 0), b.setWidth(renderWidth, "left"));
    item.render(ctx, renderBox);
    x = renderBox.right - box.left;
  })
}

export function textBlock(ctx: DrawerContext, text: string, opt?: {
  font?: string;
  halign?: HAlign;
  valign?: VAlign;
  rightAt?: number;
  expand?: boolean;
  width?: number;
  render?: (ctx: DrawerContext, box: Box) => void;
}): Block {
  const font = opt?.font;
  const halign = opt?.halign ?? "left";
  const valign = opt?.valign ?? "top";
  const rightAt = opt?.rightAt;
  let width: BlockWidth;
  if( typeof opt?.width === "number" ){
    width = opt?.width;
  } else if( rightAt !== undefined ){
    width = { kind: "rightAt", rightAt };
  } else if( opt?.expand ){
    width = "expand";
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

