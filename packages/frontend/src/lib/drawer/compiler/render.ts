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

export type WidthSpec = {
  kind: "measure";
  getWidth: (ctx: DrawerContext) => number;
} | {
  kind: "fixed";
  size: number;
} | {
  kind: "expand";
} | {
  kind: "advanceTo";
  advanceTo: number;
};

export interface LineItemSpec {
  width: WidthSpec;
  getHeight: (ctx: DrawerContext) => number;
  render: (ctx: DrawerContext, box: Box) => void;
  decorate?: (ctx: DrawerContext, box: Box) => void;
}

export function line(ctx: DrawerContext, specs: LineItemSpec[], opt?: {
  maxWidth?: number;
  valign?: VAlign;
}): Block {
  const items: Block[] = [];
  let expanders: Block[] = [];
  let maxHeight: number = 0;
  let x = 0;
  specs.forEach(spec => {
    const render: (ctx: DrawerContext, box: Box) => void = (ctx, box) => {
      spec.render(ctx, box);
      if (spec.decorate) {
        spec.decorate(ctx, box);
      }
    };
    switch (spec.width.kind) {
      case "measure": {
        const width = spec.width.getWidth(ctx);
        const height = spec.getHeight(ctx);
        maxHeight = Math.max(maxHeight, height);
        items.push({ width, height, render });
        break;
      }
      case "fixed": {
        const width = spec.width.size;
        const height = spec.getHeight(ctx);
        maxHeight = Math.max(maxHeight, height);
        items.push({ width, height, render });
        break;
      }
      case "expand": {
        const item = { width: 0, height: 0, render };
        items.push(item);
        expanders.push(item);
        break;
      }
      case "advanceTo": {
        const currentWidth = items.reduce((acc, ele) => acc + ele.width, 0);
        if (expanders.length > 0) {
          let maxWidth = spec.width.advanceTo;
          const expand = (maxWidth - currentWidth) / expanders.length;
          expanders.forEach(item => item.width = expand);
          expanders = [];
        } else {
          const extra = spec.width.advanceTo - currentWidth;
          items.push({ width: extra, height: spec.getHeight(ctx), render: () => {}})
        }
        x = spec.width.advanceTo;
        break;
      }
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
  const valign = opt?.valign ?? "top";
  return {
    width: items.reduce((acc, ele) => acc + ele.width, 0),
    height: maxHeight,
    render: (ctx: DrawerContext, box: Box) => {
      let x = 0;
      items.forEach(item => {
        const boundBox = b.modify(box, b.shrinkHoriz(x, 0), b.setWidth(item.width, "left"));
        let itemBox = b.modify(boundBox, b.setHeight(item.height, "top"));
        itemBox = b.align(itemBox, boundBox, "left", valign);
        item.render(ctx, itemBox);
        x += item.width;
      })
    }
  }
}

export function textBlock(textOpt: string | undefined, opt?: {
  decorate?: (ctx: DrawerContext, box: Box) => void;
}): LineItemSpec {
  const text = textOpt ?? "";
  return {
    width: { kind: "measure", getWidth: (ctx: DrawerContext) => c.textWidth(ctx, text) },
    getHeight: (ctx: DrawerContext) => c.currentFontSize(ctx),
    render: (ctx: DrawerContext, box: Box) => c.drawText(ctx, text, box, "left", "top"),
    decorate: opt?.decorate,
  }
}

export function gap(size: number, opt?: {
  text?: string, halign?: HAlign, decorate?: (ctx: DrawerContext, box: Box) => void
}): LineItemSpec {
  return {
    width: { kind: "fixed", size },
    getHeight: (ctx: DrawerContext) => c.currentFontSize(ctx),
    render: (ctx: DrawerContext, box: Box) => {
      if (opt?.text) {
        c.drawText(ctx, opt?.text, box, opt?.halign ?? "left", "top");
      }
    },
    decorate: opt?.decorate,
  }
}

export function expander(opt?: { text?: string, halign?: HAlign }): LineItemSpec {
  return {
    width: { kind: "expand" },
    getHeight: (ctx: DrawerContext) => c.currentFontSize(ctx),
    render: (ctx: DrawerContext, box: Box) => {
      if (opt?.text) {
        c.drawText(ctx, opt?.text ?? "", box, opt?.halign ?? "left", "top");
      }
    },
  };
}

export function advanceTo(at: number): LineItemSpec {
  return {
    width: { kind: "advanceTo", advanceTo: at },
    getHeight: () => 0,
    render: () => { },
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
