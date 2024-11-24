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
}

export function line(ctx: DrawerContext, specs: LineItemSpec[], opt?: {
  maxWidth?: number;
}): Block {
  const items: Block[] = [];
  const expanders: Block[] = [];
  let maxHeight: number = 0;
  let x = 0;
  specs.forEach(spec => {
    switch (spec.width.kind) {
      case "measure": {
        const width = spec.width.getWidth(ctx);
        const height = spec.getHeight(ctx);
        maxHeight = Math.max(maxHeight, height);
        items.push({ width, height, render: spec.render });
        break;
      }
      case "fixed": {
        const width = spec.width.size;
        const height = spec.getHeight(ctx);
        maxHeight = Math.max(maxHeight, height);
        items.push({ width, height, render: spec.render });
        break;
      }
      case "expand": {
        const item = { width: 0, height: 0, render: () => { } };
        items.push(item);
        expanders.push(item);
        break;
      }
      case "advanceTo": {
        if (expanders.length > 0) {
          const itemWidth = items.reduce((acc, ele) => acc + ele.width, 0);
          let maxWidth = spec.width.advanceTo;
          const expand = (maxWidth - itemWidth) / expanders.length;
          expanders.forEach(item => item.width = expand);
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
  return {
    width: items.reduce((acc, ele) => acc + ele.width, 0),
    height: maxHeight,
    render: (ctx: DrawerContext, box: Box) => {
      let x = 0;
      items.forEach(item => {
        const itemBox = b.modify(box, b.shrinkHoriz(x, 0), b.setWidth(item.width, "left"));
        item.render(ctx, itemBox);
        x += item.width;
      })
    }
  }
}

export function textBlock(textOpt: string | undefined): LineItemSpec {
  const text = textOpt ?? "";
  return {
    width: { kind: "measure", getWidth: (ctx: DrawerContext) => c.textWidth(ctx, text) },
    getHeight: (ctx: DrawerContext) => c.currentFontSize(ctx),
    render: (ctx: DrawerContext, box: Box) => c.drawText(ctx, text, box, "left", "top"),
  }
}

export function gap(size: number, opt?: { text?: string }): LineItemSpec {
  return {
    width: { kind: "fixed", size },
    getHeight: (ctx: DrawerContext) => c.currentFontSize(ctx),
    render: (ctx: DrawerContext, box: Box) => {
      if (opt?.text) {
        c.drawText(ctx, opt?.text, box, "left", "top");
      }
    },
  }
}

export function expander(opt?: { text?: string }): LineItemSpec {
  return {
    width: { kind: "expand" },
    getHeight: () => 0,
    render: (ctx: DrawerContext, box: Box) => {
      if (opt?.text) {
        c.drawText(ctx, opt?.text ?? "", box, "left", "top");
      }
    },
  };
}
