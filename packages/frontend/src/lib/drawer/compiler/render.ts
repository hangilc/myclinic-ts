import { mkBox, type Box } from "./box";
import type { DrawerContext } from "./context";
import * as b from "./box";
import * as c from "./compiler";
import type { HAlign, VAlign } from "./align";

export interface Block {
  width: number;
  height: number;
  render(ctx: DrawerContext, box: Box): void;
}

export function putIn(ctx: DrawerContext, block: Block, outer: Box, opt?: {
  halign?: HAlign,
  valign?: VAlign,
}) {
  const bounds = b.align(boundsOfBlock(block), outer,
    opt?.halign ?? "left",
    opt?.valign ?? "top",
  );
  block.render(ctx, bounds);
}

function boundsOfBlock(block: Block): Box {
  return mkBox(0, 0, block.width, block.height);
}

export function mkTextBlock(ctx: DrawerContext, text: string, font?: string): Block {
  const width = font ? c.textWidthWithFont(ctx, text, font) : c.textWidth(ctx, text);
  const height = font ? c.getFontSizeOf(ctx, font) : c.currentFontSize(ctx);
  return {
    width,
    height,
    render: (ctx: DrawerContext, box: Box) => {
      c.drawText(ctx, text, box, "left", "top");
    }
  }
}

export type WidthSpec = number | "expand";

export type LineItemSpec = {
  kind: "block";
  block: Block;
} | {
  kind: "text";
  text: string;
  width?: WidthSpec;
  font?: string;
  halign?: HAlign;
  valign?: VAlign;
} | {
  kind: "advance-to";
  advanceTo: number;
};

export type LineItemSpecExtender = {
  decorate?: (ctx: DrawerContext, box: Box, boundBox: Box) => void;
  modifyBox?: (box: Box) => Box;
}

export function line(ctx: DrawerContext, specs: LineItemSpec[], opt?: {
  maxWidth?: number;
  valign?: VAlign;
}): Block {
  const items: { width: number, height: number, spec: (LineItemSpec & LineItemSpecExtender) }[] = [];
  let expanders: { width: number, height: number, spec: (LineItemSpec & LineItemSpecExtender) }[] = [];
  let maxHeight: number = 0;
  let x = 0;
  specs.forEach(spec => {
    if (spec.kind === "block") {
      items.push({ width: spec.block.width, height: spec.block.height, spec });
      x += spec.block.width;
      maxHeight = Math.max(maxHeight, spec.block.height);
    } else if (spec.kind === "text") {
      let width: number = 0;
      if (spec.width == undefined) {
        width = spec.font ? c.textWidthWithFont(ctx, spec.text, spec.font) : c.textWidth(ctx, spec.text);
      } else if (typeof spec.width === "number") {
        width = spec.width;
      }
      x += width;
      const height = spec.font ? c.getFontSizeOf(ctx, spec.font) : c.currentFontSize(ctx);
      const item = { width, height, spec };
      maxHeight = Math.max(maxHeight, height);
      items.push(item);
      if (spec.width === "expand") {
        expanders.push(item);
      }
    } else if (spec.kind === "advance-to") {
      const currentWidth = items.reduce((acc, ele) => acc + ele.width, 0);
      if (expanders.length > 0) {
        let maxWidth = spec.advanceTo;
        const expand = (maxWidth - currentWidth) / expanders.length;
        expanders.forEach(item => item.width = expand);
        expanders = [];
      } else {
        const extra = spec.advanceTo - currentWidth;
        items.push({ width: extra, height: 0, spec })
      }
      x = spec.advanceTo;
    }
  });
  if (expanders.length > 0) {
    const itemWidth = items.reduce((acc, ele) => acc + ele.width, 0);
    let maxWidth = opt?.maxWidth;
    if (maxWidth == undefined) {
      console.error("expanders without maxWidth");
      maxWidth = itemWidth;
    }
    const expand = (maxWidth - itemWidth) / expanders.length;
    expanders.forEach(item => item.width = expand);
  }
  const defaultVAlign = opt?.valign ?? "top";
  return {
    width: items.reduce((acc, ele) => acc + ele.width, 0),
    height: maxHeight,
    render: (ctx: DrawerContext, box: Box) => {
      let x = 0;
      items.forEach(item => {
        const boundBox = b.modify(box, b.shrinkHoriz(x, 0), b.setWidth(item.width, "left"));
        let itemBox = b.modify(boundBox, b.setHeight(item.height, "top"));
        let halign: HAlign = "left";
        let valign: VAlign = "top";
        if (item.spec.kind === "text") {
          if (item.spec.halign) {
            halign = item.spec.halign;
          }
          if (item.spec.valign) {
            valign = item.spec.valign;
          }
        }
        itemBox = b.align(itemBox, boundBox, halign, valign);
        if (item.spec.modifyBox) {
          itemBox = item.spec.modifyBox(itemBox);
        }
        if (item.spec.kind === "block") {
          item.spec.block.render(ctx, itemBox);
        } else if (item.spec.kind === "text") {
          const text = item.spec.text;
          const font = item.spec.font;
          if (font) {
            c.withFont(ctx, font, () => c.drawText(ctx, text, itemBox, "left", "top"));
          } else {
            c.drawText(ctx, text, itemBox, "left", "top");
          }
        }
        if (item.spec.decorate) {
          item.spec.decorate(ctx, itemBox, boundBox);
        }
        x += item.width;
      })
    }
  }
}

export function textBlock(textOpt: string | undefined, width?: WidthSpec, opt?: {
  font?: string;
  halign?: HAlign;
  decorate?: (ctx: DrawerContext, box: Box) => void;
}): LineItemSpec & LineItemSpecExtender {
  const text = textOpt ?? "";
  return {
    kind: "text",
    text,
    width,
    decorate: opt?.decorate,
    halign: opt?.halign,
  }
}

export function advanceTo(at: number): LineItemSpec {
  return {
    kind: "advance-to",
    advanceTo: at,
  }
}

export function paragraph(ctx: DrawerContext, blocks: Block[], opt?: {
  halign?: HAlign;
  leading?: number;
  decorate?: (ctx: DrawerContext, box: Box) => void;
}): Block {
  const width = blocks.reduce((acc, ele) => Math.max(acc, ele.width), 0);
  const leading = opt?.leading ?? 0;
  const height = blocks.reduce((acc, ele, i) => {
    let h = i === 0 ? 0 : leading;
    h += ele.height;
    return acc + h;
  }, 0);
  return {
    width,
    height,
    render: (ctx: DrawerContext, box: Box) => {
      const halign = opt?.halign ?? "left";
      blocks.forEach(block => {
        box = b.withSlice(box, block.height, (box) => {
          putIn(ctx, block, box, { halign });
        });
        box = b.modify(box, b.shrinkVert(leading, 0));
      })
    }
  }
}
