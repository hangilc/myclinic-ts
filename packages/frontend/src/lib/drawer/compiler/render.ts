import { mkBox, type Box } from "./box";
import type { DrawerContext } from "./context";
import * as b from "./box";
import * as c from "./compiler";
import type { HAlign, VAlign } from "./align";

export interface Block {
  width: number;
  height: number;
  render: (ctx: DrawerContext, box: Box) => void;
}

export function putIn(ctx: DrawerContext, block: Block, outer: Box, opt?: {
  halign?: HAlign;
  valign?: VAlign;
  dx?: number;
  dy?: number;
}) {
  let bounds = b.align(boundsOfBlock(block), outer,
    opt?.halign ?? "left",
    opt?.valign ?? "top",
  );
  if ((opt?.dx !== undefined && opt?.dx !== 0) || (opt?.dy !== undefined && opt?.dy !== 0)) {
    bounds = b.modify(bounds, b.shift(opt?.dx ?? 0, opt?.dy ?? 0));
  }
  block.render(ctx, bounds);
}

function boundsOfBlock(block: Block): Box {
  return mkBox(0, 0, block.width, block.height);
}

export function mkTextBlock(ctx: DrawerContext, text: string, font?: string): Block {
  const width = calcWidth(ctx, text, font);
  const height = calcHeight(ctx, font);
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
  width: Extent;
  calcHeight: (ctx: DrawerContext) => number;
  render: (ctx: DrawerContext, box: Box) => void;
} & LineItemSpecExtender;

export type LineItemSpecExtender = {
  halign?: HAlign;
  valign?: VAlign;
  decorate?: (ctx: DrawerContext, box: Box, boundBox: Box) => void;
  dx?: number;
  dy?: number;
}

export function line(ctx: DrawerContext, specs: LineItemSpec[], opt?: {
  maxWidth?: number;
  valign?: VAlign;
}): Block {
  const widths = resolveExtent(ctx, specs.map(spec => spec.width), opt?.maxWidth);
  const blockSpecs: { block: Block, spec: LineItemSpec }[] = [];
  for (let i = 0; i < specs.length; i++) {
    const spec = specs[i];
    const width = widths[i];
    const height = spec.calcHeight(ctx);
    const block = { width, height, render: spec.render };
    blockSpecs.push({ block, spec });
  }
  const width = blockSpecs.reduce((acc, ele) => acc + ele.block.width, 0);
  const height = blockSpecs.reduce((acc, ele) => Math.max(acc, ele.block.height), 0);
  const render = (ctx: DrawerContext, box: Box) => {
    let x = 0;
    blockSpecs.forEach(({ block, spec }) => {
      let itemBox = b.modify(box, b.shrinkHoriz(x, 0), b.setWidth(block.width, "left"));
      const valign: VAlign = opt?.valign ?? "bottom";
      itemBox = b.modify(itemBox, b.alignVert(box, valign));
      if ((spec.dx !== undefined && spec.dx !== 0) || (spec.dy !== undefined && spec.dy !== 0)) {
        itemBox = b.modify(itemBox, b.shift(spec.dx ?? 0, spec.dy ?? 0));
      }
      spec.render(ctx, itemBox);
      x += block.width;
    });
  }
  return { width, height, render };
}

export function textBlock(textOpt: string | undefined, width?: Extent, opt?: LineItemSpecExtender & {
  font?: string;
}): LineItemSpec {
  const text = textOpt ?? "";
  return {
    width: width ?? {
      kind: "calc", calc: (ctx: DrawerContext) => calcWidth(ctx, text, opt?.font),
    },
    calcHeight: (ctx: DrawerContext) => calcHeight(ctx, opt?.font),
    render: (ctx: DrawerContext, box: Box) => c.drawText(ctx, text, box, "left", "top"),
    ...opt
  }
}

export function advanceTo(at: number): LineItemSpec {
  return {
    width: { kind: "advance-to", at: at },
    calcHeight: () => 0,
    render: () => {},
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

//////////////////////////////////////////////////////////////////////////////////////////////

export function calcHeight(ctx: DrawerContext, font?: string): number {
  return font ? c.getFontSizeOf(ctx, font) : c.currentFontSize(ctx);
}

export function calcWidth(ctx: DrawerContext, text: string, font?: string): number {
  return font ? c.textWidthWithFont(ctx, text, font) : c.textWidth(ctx, text);
}

// Extent ////////////////////////////////////////////////////////////////////////////////////

export type Extent = {
  kind: "calc";
  calc: (ctx: DrawerContext) => number;
} | {
  kind: "fixed";
  value: number;
} | {
  kind: "expand";
} | {
  kind: "advance-to";
  at: number;
}

function resolveExtent(ctx: DrawerContext, exts: Extent[], maxSize?: number): number[] {
  const chunks: { exts: Extent[], advanceTo: number | undefined }[] = [];
  let curChunk: Extent[] = [];
  exts.forEach(ext => {
    curChunk.push(ext);
    if (ext.kind === "advance-to") {
      chunks.push({ exts: curChunk, advanceTo: ext.at });
      curChunk = [];
    }
  });
  chunks.push({ exts: curChunk, advanceTo: maxSize });
  const result: { size: number }[] = [];
  let pos = 0;
  chunks.forEach(chunk => {
    const advanceTo = chunk.advanceTo;
    const expands: { size: number }[] = [];
    chunk.exts.forEach(ext => {
      if (ext.kind === "calc") {
        const width = ext.calc(ctx);
        result.push({ size: width });
        pos += width;
      } else if (ext.kind === "fixed") {
        result.push({ size: ext.value });
        pos += ext.value;
      } else if (ext.kind === "expand") {
        const item = { size: 0 };
        result.push(item);
        expands.push(item);
      } else if( ext.kind === "advance-to" ){
        result.push({ size: 0 });
      } else {
        throw new Error("unhandled extent");
      }
    });
    if (expands.length > 0) {
      if (advanceTo == undefined) {
        throw new Error("max-size is rquired for expand extent");
      }
      const extra = advanceTo - pos;
      const expandSize = extra / expands.length;
      expands.forEach(exp => exp.size = expandSize);
    }
    if (advanceTo != undefined) {
      pos = advanceTo;
    }
  })
  return result.map(r => r.size);
}