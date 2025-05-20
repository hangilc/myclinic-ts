import type { Box } from "@/lib/drawer/compiler/box";
import * as b from "@/lib/drawer/compiler/box";
import * as c from "@/lib/drawer/compiler/compiler";
import * as r from "./row-renderer";
import { type DrawerContext } from "@/lib/drawer/compiler/context";
import type { HAlign, VAlign } from "@lib/drawer/compiler/align";

export interface Element {
  width(ctx: DrawerContext): number;
  height(ctx: DrawerContext): number;
  render: (ctx: DrawerContext, box: Box) => void;
}

export function stackedTexts(texts: string[]): Element {
  let halign: HAlign = "center";
  let valign: VAlign = "center";
  return {
    width: (ctx) => Math.max(...texts.map(t => c.textWidth(ctx, t))),
    height: (ctx) => c.currentFontSize(ctx) * texts.length,
    render: (ctx, box) => {
      let bs = b.splitToRows(box, b.evenSplitter(texts.length));
      for(let i=0;i<texts.length;i++){
        let t = texts[i];
        let b = bs[i];
        c.drawText(ctx, t, b, halign, valign);
      }
    }
  }
}

export function drawElement(ctx: DrawerContext, box: Box, ele: Element) {
  let halign: HAlign = "center";
  let valign: VAlign = "center";
  let eb = b.aligned(box, ele.width(ctx), ele.height(ctx), halign, valign);
  ele.render(ctx, eb);
}

export function rowElement(ctx: DrawerContext, ...items: r.FixedWidthItem[]): Element {
  let width = 0;
  for(let item of items) {
    width += item.width(ctx);
  }
  let height = c.currentFontSize(ctx);
  return {
    width: () => width,
    height: () => height,
    render: (ctx, box) => {
      r.renderRow(ctx, box, ...items);
    }
  }
}
