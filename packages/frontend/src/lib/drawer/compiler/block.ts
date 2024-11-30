import type { Box } from "./box";
import type { DrawerContext } from "./context";
import * as c from "./compiler";
import * as b from "./box";
import type { HAlign, VAlign } from "./align";

export interface Block {
  width: number;
  height: number;
  render: (ctx: DrawerContext, box: Box) => void;
}

export function textBlock(ctx: DrawerContext, text: string, font?: string): Block {
  return {
    width: font ? c.textWidthWithFont(ctx, text, font) : c.textWidth(ctx, text),
    height: font ? c.getFontSizeOf(ctx, font) : c.currentFontSize(ctx),
    render: (ctx: DrawerContext, box: Box) => c.drawText(ctx, text, box, "left", "top"),
  }
}

export function emptyBlock(): Block {
  return {
    width: 0, height: 0, render: () => { },
  }
}

export function boundsOfBlock(block: Block): Box {
  return b.mkBox(0, 0, block.width, block.height);
}

export function putIn(ctx: DrawerContext, block: Block, outer: Box, halign: HAlign, valign: VAlign): Box {
  let bounds = b.align(boundsOfBlock(block), outer, halign, valign);
  block.render(ctx, bounds);
  return bounds;
}

// Blocks ////////////////////////////////////////////////////////////////////////////////////

export function stackedBlock(blocks: Block[], halign: HAlign, opt?: { leading?: number }): Block {
  if (blocks.length === 0) {
    return emptyBlock();
  } else if (blocks.length === 1) {
    return blocks[1];
  } else {
    const width = blocks.reduce((acc, ele) => Math.max(acc, ele.width), 0);
    const leading = opt?.leading ?? 0;
    return {
      width,
      height: blocks.reduce((acc, ele) => acc + ele.height, 0) + leading * (blocks.length - 1),
      render: (ctx: DrawerContext, box: Box) => {
        let y = 0;
        blocks.forEach((block, i) => {
          if (i !== 0) {
            y += leading;
          }
          const blockBox = b.modify(box, b.setHeight(block.height, "top"), b.shiftDown(y), b.alignHoriz(box, halign));
          block.render(ctx, blockBox);
          y += block.height;
        })
      }
    }
  }
}

// Extent ////////////////////////////////////////////////////////////////////////////////////

export type Extent = {
  kind: "fixed";
  value: number;
} | {
  kind: "expand";
} | {
  kind: "advance-to";
  at: number;
}

function resolveExtent(exts: Extent[], maxSize?: number): number[] {
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
      if (ext.kind === "fixed") {
        result.push({ size: ext.value });
        pos += ext.value;
      } else if (ext.kind === "expand") {
        const item = { size: 0 };
        result.push(item);
        expands.push(item);
      } else if (ext.kind === "advance-to") {
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

// Splitter //////////////////////////////////////////////////////////////////////////

export function splitByExtent(exts: ("*" | number)[]): b.Splitter {
  function cvt(ext: "*" | number): Extent {
    if (ext === "*") {
      return { kind: "expand" };
    } else {
      return { kind: "fixed", value: ext };
    }
  }
  return (maxSize: number) => {
    const pos: number[] = [];
    const ws = resolveExtent(exts.map(cvt), maxSize);
    let x = 0;
    for (let i = 0; i < ws.length - 1; i++) {
      x += ws[i];
      pos.push(x);
    }
    return pos;
  };
}

// RowBlock ////////////////////////////////////////////////////////////////////////////

export interface RowItem {
  width: Extent;
  render: (ctx: DrawerContext, box: Box) => void;
}

export function rowBlock(height: number, items: RowItem[], maxWidth?: number): Block {
  const ws: number[] = resolveExtent(items.map(item => item.width), maxWidth);
  if (!(items.length === ws.length)) {
    throw new Error("inconsistent ext result");
  }
  return {
    width: ws.reduce((acc, ele) => acc + ele, 0),
    height,
    render: (ctx: DrawerContext, box: Box) => {
      let x = 0;
      for (let i = 0; i < items.length; i++) {
        const itemWidth = ws[i];
        const itemBox = b.modify(box, b.shrinkHoriz(x, 0), b.setWidth(itemWidth, "left"));
        const item = items[i];
        item.render(ctx, itemBox);
        x += itemWidth;
      }
    }
  }
}

export function textItem(ctx: DrawerContext, text: string, opt?: { valign?: VAlign, font?: string }): RowItem {
  const block = textBlock(ctx, text, opt?.font);
  return {
    width: { kind: "fixed", value: block.width },
    render: (ctx: DrawerContext, box: Box) => {
      putIn(ctx, block, box, "left", (opt?.valign ?? "top"));
    }
  }
}

export function containerItem(width: Extent, block: Block, halign: HAlign, valign: VAlign): RowItem {
  return {
    width,
    render: (ctx: DrawerContext, box: Box) => {
      if (block) {
        putIn(ctx, block, box, halign, valign);
      }
    }
  }
}

export function gapItem(size: number): RowItem {
  return {
    width: { kind: "fixed", value: size },
    render: () => {},
  }
}

export function gapContainerItem(size: number, block: Block, halign: HAlign, valign: VAlign): RowItem {
  return containerItem({ kind: "fixed", value: size }, block, halign, valign);
}

export function expanderItem(): RowItem {
  return { 
    width: { kind: "expand" }, 
    render: () => {} 
  };
}

export function expanderContainerItem(block: Block, halign: HAlign, valign: VAlign): RowItem {
  return containerItem({ kind: "expand" }, block, halign, valign);
}

// Row blocks //////////////////////////////////////////////////////////////////////////////

export function justifiedText(ctx: DrawerContext, text: string, width: number, font?: string): Block {
  const items: RowItem[] = [];
  for (let i = 0; i < text.length; i++) {
    if (i !== 0) {
      items.push(expanderItem())
    }
    const c = text.charAt(i);
    items.push(textItem(ctx, c, { font }));
  }
  return rowBlock(c.resolveFontHeight(ctx, font), items, width);
}