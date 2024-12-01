import type { Box } from "./box";
import type { DrawerContext } from "./context";
import * as c from "./compiler";
import * as b from "./box";
import type { HAlign, VAlign } from "./align";
import type { Color } from "./compiler";
import { breakLines } from "./break-lines";

export interface Block {
  width: number;
  height: number;
  render: (ctx: DrawerContext, box: Box) => void;
}

export interface TextBlockOpt {
  font?: string;
  color?: Color;
}

export function textBlock(ctx: DrawerContext, text: string, opt?: TextBlockOpt): Block {
  const font = opt?.font;
  return {
    width: font ? c.textWidthWithFont(ctx, text, font) : c.textWidth(ctx, text),
    height: font ? c.getFontSizeOf(ctx, font) : c.currentFontSize(ctx),
    render: (ctx: DrawerContext, box: Box) => {
      c.withTextColor(ctx, opt?.color, () => {
        c.withFont(ctx, font, () => {
          c.drawText(ctx, text, box, "left", "top");
        });
      });
    }
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

export interface StackedBlockOpt {
  halign?: HAlign;
  leading?: number;
}

export function stackedBlock(blocks: Block[], opt?: StackedBlockOpt): Block {
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
          const blockBox = b.modify(box,
            b.setHeight(block.height, "top"),
            b.shiftDown(y),
            b.alignHoriz(box, opt?.halign ?? "left"));
          block.render(ctx, blockBox);
          y += block.height;
        })
      }
    }
  }
}

export function setHeight(block: Block, height: number, valign: VAlign): Block {
  return {
    width: block.width,
    height,
    render: (ctx: DrawerContext, box: Box) => {
      putIn(ctx, block, box, "left", valign);
    }
  }
}

export function squareBlock(size: number, opt?: { pen?: string }): Block {
  return {
    width: size,
    height: size,
    render: (ctx: DrawerContext, box: Box) => {
      c.withPen(ctx, opt?.pen, () => c.frame(ctx, box));
    }
  }
}

// Extent ////////////////////////////////////////////////////////////////////////////////////

export type ExtentOpt = {
  callback?: (left: number, right: number) => void;
}

export type Extent = ({
  kind: "fixed";
  value: number;
} | {
  kind: "expand";
} | {
  kind: "advance-to";
  at: number;
}) & ExtentOpt

export function fixedExtent(value: number): Extent {
  return { kind: "fixed", value };
}

export function expandExtent(): Extent {
  return { kind: "expand" };
}

export function advanceToExtent(at: number): Extent {
  return { kind: "advance-to", at };
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
  const result: { size: number, callback?: (left: number, right: number) => void }[] = [];
  let pos = 0;
  chunks.forEach(chunk => {
    const advanceTo = chunk.advanceTo;
    const expands: { size: number }[] = [];
    chunk.exts.forEach(ext => {
      if (ext.kind === "fixed") {
        result.push({ size: ext.value, callback: ext.callback });
        pos += ext.value;
      } else if (ext.kind === "expand") {
        const item = { size: 0, callback: ext.callback };
        result.push(item);
        expands.push(item);
      } else if (ext.kind === "advance-to") {
        result.push({ size: 0, callback: ext.callback });
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
    } else {
      if (advanceTo != undefined) {
        result[result.length - 1].size = advanceTo - pos;
      }
    }
    if (advanceTo != undefined) {
      pos = advanceTo;
    }
  });
  pos = 0;
  result.forEach(r => {
    const right = pos + r.size;
    if (r.callback) {
      r.callback(pos, right);
    }
    pos = right;
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

export type RowItem = {
  width: Extent;
  render: (ctx: DrawerContext, box: Box) => void;
};

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

export type ContainerItemOpt = {
  halign?: HAlign;
  valign?: VAlign;
}

export type TextItemOpt = {
  valign?: VAlign;
  textBlockOpt?: TextBlockOpt;
}

export function textItem(ctx: DrawerContext, text: string, opt?: TextItemOpt): RowItem {
  const block = textBlock(ctx, text, opt?.textBlockOpt);
  return {
    width: { kind: "fixed", value: block.width },
    render: (ctx: DrawerContext, box: Box) => {
      putIn(ctx, block, box, "left", (opt?.valign ?? "top"));
    }
  }
}

export function containerItem(width: Extent, block: Block, opt?: ContainerItemOpt): RowItem {
  return {
    width,
    render: (ctx: DrawerContext, box: Box) => {
      putIn(ctx, block, box, opt?.halign ?? "left", opt?.valign ?? "top");
    }
  }
}

export function gapItem(size: number, opt?: { extentOpt?: ExtentOpt }): RowItem {
  return {
    width: { kind: "fixed", value: size, ...opt?.extentOpt },
    render: () => { },
  }
}

export function gapContainerItem(size: number, block: Block, opt?: ContainerItemOpt): RowItem {
  return containerItem({ kind: "fixed", value: size }, block, opt);
}

export function expanderItem(): RowItem {
  return {
    width: { kind: "expand" },
    render: () => { }
  };
}

export function expanderContainerItem(block: Block, opt?: ContainerItemOpt): RowItem {
  return containerItem({ kind: "expand" }, block, opt);
}

export function advanceToItem(at: number): RowItem {
  return { width: advanceToExtent(at), render: () => { } };
}

export function advanceToContainerItem(at: number, block: Block, opt?: ContainerItemOpt): RowItem {
  return containerItem(advanceToExtent(at), block, opt);
}

export function squareItem(size: number, opt?: { pen?: string }): RowItem {
  return {
    width: fixedExtent(size),
    render: (ctx: DrawerContext, box: Box) => {
      const block = squareBlock(size, opt);
      putIn(ctx, block, box, "center", "center");
    }
  }
}

export function splitToChars(ctx: DrawerContext, text: string, opt?: TextItemOpt): RowItem[] {
  return Array.from(text).map(ch => textItem(ctx, ch, opt));
}

export function spacedItems(items: RowItem[], space: number): RowItem[] {
  const rs: RowItem[] = [];
  items.forEach((item, i) => {
    if (i !== 0) {
      rs.push(gapItem(space));
    }
    rs.push(item);
  })
  return rs;
}

export function justifiedItems(items: RowItem[], width: number): RowItem[] {
  const rs: RowItem[] = [];
  items.forEach((item, i) => {
    if (i !== 0) {
      rs.push(expanderItem());
    }
    rs.push(item);
  })
  return rs;
}

export function modifyItem(item: RowItem, ...fs: ((item: RowItem) => RowItem)[]): RowItem {
  let i: RowItem = Object.assign({}, item);
  fs.forEach(f => {
    i = f(i);
  });
  return i;
}

// Row blocks //////////////////////////////////////////////////////////////////////////////

export function justifiedTextBlock(ctx: DrawerContext, text: string, width: number, opt?: TextItemOpt): Block {
  const chars = splitToChars(ctx, text, opt);
  const items: RowItem[] = justifiedItems(chars, width);
  return rowBlock(c.resolveFontHeight(ctx, opt?.textBlockOpt?.font), items, width);
}

export function spacedTextBlock(ctx: DrawerContext, text: string, space: number, opt?: TextItemOpt): Block {
  const chars = splitToChars(ctx, text, opt);
  const items: RowItem[] = spacedItems(chars, space);
  return rowBlock(c.resolveFontHeight(ctx, opt?.textBlockOpt?.font), items);
}

export interface TextPackBlockEnv {
  textBlockOpt?: TextBlockOpt;
  stackedBlockOpt?: StackedBlockOpt;
}

export function textPackBlock(ctx: DrawerContext, text: string, box: Box, envs: TextPackBlockEnv[]): Block {
  for (let env of envs) {
    const width = c.textWidthWithFont(ctx, text, env.textBlockOpt?.font);
    if (width <= b.width(box)) {
      return textBlock(ctx, text, env.textBlockOpt);
    } else {
      const fontSize = c.resolveFontHeight(ctx, env.textBlockOpt?.font);
      const lines = breakLines(text, fontSize, b.width(box));
      const height = c.requiredHeight(lines.length, fontSize, env.stackedBlockOpt?.leading ?? 0);
      if (height <= b.height(box)) {
        return stackedBlock(lines.map(line => textBlock(ctx, line, env.textBlockOpt)), env.stackedBlockOpt);
      }
    }
  }
  if (envs.length === 0) {
    return textBlock(ctx, text);
  } else {
    const env = envs[envs.length - 1];
    const fontSize = c.resolveFontHeight(ctx, env.textBlockOpt?.font);
    const lines = breakLines(text, fontSize, b.width(box));
    return stackedBlock(lines.map(line => textBlock(ctx, line, env.textBlockOpt)), env.stackedBlockOpt);
  }
}

