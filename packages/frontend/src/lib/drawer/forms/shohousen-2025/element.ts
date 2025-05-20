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

export function textElement(text: string, opt?: {
  font?: string;
  color?: c.Color;
}): Element {
  return {
    width: (ctx) => c.textWidthWithFont(ctx, text, opt?.font),
    height: (ctx) => c.getFontSizeOf(ctx, opt?.font),
    render: (ctx, box) => {
      c.withFontAndColor(ctx, opt?.font, opt?.color, () => {
        c.drawText(ctx, text, box, "left", "top");
      });
    }
  }
}

export function stackedTexts(texts: string[], opt?: {
  font?: string;
  halign?: HAlign;
  leading?: number;
}): Element {
  const halign = opt?.halign ?? "center";
  return colOfElements(texts.map(text => textElement(text, {
    font: opt?.font,
  })), { halign, leading: opt?.leading })
}

export function drawElement(ctx: DrawerContext, box: Box, ele: Element, opt?: {
  halign?: HAlign,
  valign?: VAlign,
}) {
  let halign: HAlign = opt?.halign ?? "center";
  let valign: VAlign = opt?.valign ?? "center";
  let eb = b.aligned(box, ele.width(ctx), ele.height(ctx), halign, valign);
  ele.render(ctx, eb);
}

export function rowElement(ctx: DrawerContext, ...items: r.FixedWidthItem[]): Element {
  let height = c.currentFontSize(ctx);
  return {
    width: (ctx) => {
      let width = 0;
      for(let item of items) {
        width += item.width(ctx);
      }
      return width;
    },
    height: () => height,
    render: (ctx, box) => {
      r.renderRow(ctx, box, ...items);
    }
  }
}

export function rowOfElements(elements: Element[], opt?: {
  valign?: VAlign;
}): Element {
  return {
    width: (ctx) => elements.reduce((acc, ele) => acc + ele.width(ctx), 0),
    height: (ctx) => Math.max(...elements.map(ele => ele.height(ctx))),
    render: (ctx, box) => {
      const valign: VAlign = opt?.valign ?? "top";
      let left = box.left;
      for(let ele of elements) {
        let w = ele.width(ctx);
        let right = left + w;
        let bb = Object.assign({}, box, { left, right });
        left = right;
        drawElement(ctx, bb, ele, { halign: "left", valign })
      }
    }
  }
}

export function colOfElements(elements: Element[], opt?: {
  halign?: HAlign;
  leading?: number;
}): Element {
  const leading = opt?.leading ?? 0;
  return {
    width: (ctx) => Math.max(...elements.map(ele => ele.width(ctx))),
    height: (ctx) => {
      return elements.reduce((acc, ele) => acc + ele.height(ctx), 0) +
        Math.max(0, leading * (elements.length - 1))
    },
    render: (ctx, box) => {
      const halign: HAlign = opt?.halign ?? "left";
      let top = box.top;
      for(let ele of elements) {
        let h = ele.height(ctx);
        let bottom = top + h;
        let bb = Object.assign({}, box, { top, bottom });
        top = bottom + leading;
        drawElement(ctx, bb, ele, { halign, valign: "top" })
      }
    }
  }
}
