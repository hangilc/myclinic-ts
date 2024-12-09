import { mkBox, type Box } from "./box";
import type { DrawerContext } from "./context";
import * as c from "./compiler";
import * as b from "./box";
import type { HAlign, VAlign } from "./align";
import type { Color } from "./compiler";
import { breakLines, breakSingleLine } from "./break-lines";
import type { RenderedDrug } from "@/lib/denshi-shohou/presc-renderer";
import { stringToCharWidths } from "./char-width";

export interface Position {
  x: number;
  y: number;
}

export interface Offset {
  dx: number;
  dy: number;
}

export type Locator = (pos: Position) => Position;

export function identityLocator(): Locator {
  return pos => pos;
}

export function shiftLocator(offset: Offset): Locator {
  return (pos: Position): Position => {
    return { x: pos.x + offset.dx, y: pos.y + offset.dy };
  }
}

export function horizAlign(itemWidth: number, boundWidth: number, halign: HAlign): number {
  switch(halign) {
    case "left": return 0;
    case "center": return (boundWidth - itemWidth) * 0.5;
    case "right": return boundWidth - itemWidth;
  }
}

export function vertAlign(itemHeight: number, boundHeight: number, valign: VAlign): number {
  switch(valign) {
    case "top": return 0;
    case "center": return (boundHeight - itemHeight) * 0.5;
    case "bottom": return boundHeight - itemHeight;
  }
}

export interface Extent {
  width: number;
  height: number;
}

export function horizAlignLocator(width: number, boundWidth: number, halign: HAlign): Locator {
  return (pos: Position): Position => {
    return {
      x: pos.x + horizAlign(width, boundWidth, halign),
      y: pos.y,
    }
  }
}

export function vertAlignLocator(height: number, boundHeight: number, valign: VAlign): Locator {
  return (pos: Position): Position => {
    return {
      x: pos.x,
      y: pos.y + vertAlign(height, boundHeight, valign),
    }
  }
}

export function alignLocator(childExtent: Extent, parentExtent: Extent, halign: HAlign, valign: VAlign): Locator {
  return composedLocator(
    horizAlignLocator(childExtent.width, parentExtent.width, halign),
    vertAlignLocator(childExtent.height, parentExtent.height, valign),
  )
}

export function composedLocator(...locators: Locator[]): Locator {
  return (pos: Position): Position => {
    locators.forEach(locator => pos = locator(pos));
    return pos;
  }
}

export function extentOfBox(box: Box): Extent {
  return { width: b.width(box), height: b.height(box) }
}

export function leftTopOfBox(box: Box): Position {
  return { x: box.left, y: box.top };
}

export interface Item {
  extent: Extent;
  renderAt: (ctx: DrawerContext, pos: Position) => void;
}

export function mkLocatedItem(item: Item, locator: Locator): Item {
  return {
    extent: item.extent,
    renderAt: (ctx: DrawerContext, pos: Position) => {
      item.renderAt(ctx, locator(pos));
    }
  }
}

export function modifyItemExtent(item: Item, extent: Extent, halign: HAlign, valign: VAlign): Item {
  const locator = alignLocator(item.extent, extent, halign, valign);
  return {
    extent,
    renderAt(ctx: DrawerContext, pos: Position) {
      item.renderAt(ctx, locator(pos));
    },
  }
}

export function modifyItemHeight(item: Item, height: number, valign: VAlign): Item {
  return modifyItemExtent(item, { width: item.extent.width, height }, "left", valign);
}

export interface TextOpt {
  font?: string;
  color?: Color;
}

export function mkText(ctx: DrawerContext, text: string, opt?: TextOpt): Item {
  const width = c.textWidthWithFont(ctx, text, opt?.font);
  const height = c.resolveFontHeight(ctx, opt?.font);
  return {
    extent: { width, height },
    renderAt: (ctx: DrawerContext, { x, y }) => {
      const fontSize = height;
      let charWidths = stringToCharWidths(text, fontSize);
      const xs: number[] = [];
      const ys: number[] = [];
      for (let i = 0; i < charWidths.length; i++) {
        xs.push(x);
        ys.push(y);
        x += charWidths[i];
      }
      c.withTextColor(ctx, opt?.color, () => {
        c.withFont(ctx, opt?.font, () => {
          c.drawChars(ctx, text, xs, ys);
        })
      });
    },
  }
}


// export interface Block {
//   width: number;
//   height: number;
//   render: (ctx: DrawerContext, dx: number, dy: number) => void;
// }

// export interface TextBlockOpt {
//   font?: string;
//   color?: Color;
// }

// export interface Pack {
//   box: Box;
//   items: { dx: number, dy: number, block: Block }[];
// }

// export function putAt(block: Block, dx: number, dy: number, pack: Pack) {
//   pack.items.push({ dx, dy, block });
// }

// export function putAligned(block: Block, halign: HAlign, valign: VAlign, pack: Pack) {
//   const bb = b.align(mkBox(0, 0, block.width, block.height), pack.box, halign, valign);
//   putAt(block, bb.left, bb.top, pack);
// }

// export function renderPack(ctx: DrawerContext, pack: Pack) {
//   pack.items.forEach(({ dx, dy, block }) => {
//     block.render(ctx, dx, dy);
//   })
// }

// export function textBlock(ctx: DrawerContext, text: string, opt?: TextBlockOpt): Block {
//   const font = opt?.font;
//   const width = font ? c.textWidthWithFont(ctx, text, font) : c.textWidth(ctx, text);
//   const height = font ? c.getFontSizeOf(ctx, font) : c.currentFontSize(ctx);
//   const render = (ctx: DrawerContext, dx: number, dy: number) => {
//     c.withTextColor(ctx, opt?.color, () => {
//       c.withFont(ctx, font, () => {
//         const bb = mkBox(dx, dy, dx + width, dy + height);
//         c.drawText(ctx, text, bb, "left", "top");
//       });
//     });
//   };
//   return { width, height, render };
// }

// export interface DrawTextOpt {
//   halign?: HAlign;
//   valign?: VAlign;
//   textBlockOpt?: TextBlockOpt;
// }

// export function drawText(ctx: DrawerContext, text: string, box: Box, opt?: DrawTextOpt): Box {
//   const textBlockOpt = opt?.textBlockOpt;
//   let block = textBlock(ctx, text, textBlockOpt);
//   const bb = b.align(boundsOfBlock(block), box, opt?.halign ?? "left", opt?.valign ?? "top");
//   block.render(ctx, bb);
//   return bb;
// }

// export function emptyBlock(opt?: BlockOpt): Block {
//   return mkBlock(0, 0, () => { }, opt);
// }

// export function boundsOfBlock(block: Block): Box {
//   return b.mkBox(0, 0, block.width, block.height);
// }

// export type PutInOpt = {
//   halign: HAlign;
//   valign: VAlign;
// }

// export function putIn(ctx: DrawerContext, block: Block, outer: Box, opt?: PutInOpt): Box {
//   let halign: HAlign = opt?.halign ?? "left";
//   let valign: VAlign = opt?.valign ?? "top";
//   let bounds = b.align(boundsOfBlock(block), outer, halign, valign);
//   block.render(ctx, bounds);
//   return bounds;
// }

// // Blocks ////////////////////////////////////////////////////////////////////////////////////

// export interface StackedBlockOpt {
//   halign?: HAlign;
//   leading?: number;
//   blockOpt?: BlockOpt;
// }

// export function stackedBlock(blocks: Block[], opt?: StackedBlockOpt): Block {
//   if (blocks.length === 0) {
//     return emptyBlock();
//   } else if (blocks.length === 1) {
//     return blocks[0];
//   } else {
//     const width = blocks.reduce((acc, ele) => Math.max(acc, ele.width), 0);
//     const leading = opt?.leading ?? 0;
//     return mkBlock(
//       width,
//       blocks.reduce((acc, ele) => acc + ele.height, 0) + leading * (blocks.length - 1),
//       (ctx: DrawerContext, box: Box) => {
//         let y = 0;
//         blocks.forEach((block, i) => {
//           if (i !== 0) {
//             y += leading;
//           }
//           const blockBox = b.modify(box,
//             b.setHeight(block.height, "top"),
//             b.shiftDown(y),
//             b.setWidth(block.width, "left"),
//             b.alignHoriz(box, opt?.halign ?? "left"));
//           block.render(ctx, blockBox);
//           y += block.height;
//         })
//       },
//       opt?.blockOpt
//     );
//   }
// }

// export type SetHeightOpt = {
//   valign: VAlign;
//   blockOpt?: BlockOpt;
// }

// export function setHeight(block: Block, height: number, opt?: SetHeightOpt): Block {
//   const valign: VAlign = opt?.valign ?? "top";
//   return mkBlock(
//     block.width,
//     height,
//     (ctx: DrawerContext, box: Box) => {
//       putIn(ctx, block, box, { halign: "left", valign });
//     },
//     opt?.blockOpt
//   );
// }

// export type SquareBlockOpt = {
//   pen?: string;
//   blockOpt?: BlockOpt;
// }

// export function squareBlock(size: number, opt?: SquareBlockOpt): Block {
//   return mkBlock(
//     size,
//     size,
//     (ctx: DrawerContext, box: Box) => {
//       c.withPen(ctx, opt?.pen, () => c.frame(ctx, box));
//     },
//     opt?.blockOpt
//   )
// }

// // Extent ////////////////////////////////////////////////////////////////////////////////////

// export type ExtentOpt = {
//   callback?: (left: number, right: number) => void;
// }

// export type Extent = ({
//   kind: "fixed";
//   value: number;
// } | {
//   kind: "expand";
// } | {
//   kind: "advance-to";
//   at: number;
// }) & { opt?: ExtentOpt }

// export function fixedExtent(value: number, opt?: ExtentOpt): Extent {
//   return { kind: "fixed", value, opt };
// }

// export function expandExtent(opt?: ExtentOpt): Extent {
//   return { kind: "expand", opt };
// }

// export function advanceToExtent(at: number, opt?: ExtentOpt): Extent {
//   return { kind: "advance-to", at, opt };
// }

// function resolveExtent(exts: Extent[], maxSize?: number): number[] {
//   const chunks: { exts: Extent[], advanceTo: number | undefined }[] = [];
//   let curChunk: Extent[] = [];
//   exts.forEach(ext => {
//     curChunk.push(ext);
//     if (ext.kind === "advance-to") {
//       chunks.push({ exts: curChunk, advanceTo: ext.at });
//       curChunk = [];
//     }
//   });
//   chunks.push({ exts: curChunk, advanceTo: maxSize });
//   const result: { size: number, opt?: ExtentOpt }[] = [];
//   let pos = 0;
//   chunks.forEach(chunk => {
//     const advanceTo = chunk.advanceTo;
//     const expands: { size: number }[] = [];
//     chunk.exts.forEach(ext => {
//       if (ext.kind === "fixed") {
//         result.push({ size: ext.value, opt: ext.opt });
//         pos += ext.value;
//       } else if (ext.kind === "expand") {
//         const item = { size: 0, opt: ext.opt };
//         result.push(item);
//         expands.push(item);
//       } else if (ext.kind === "advance-to") {
//         result.push({ size: 0, opt: ext.opt });
//       } else {
//         throw new Error("unhandled extent");
//       }
//     });
//     if (expands.length > 0) {
//       if (advanceTo == undefined) {
//         throw new Error("max-size is rquired for expand extent");
//       }
//       const extra = advanceTo - pos;
//       const expandSize = extra / expands.length;
//       expands.forEach(exp => exp.size = expandSize);
//     } else {
//       if (advanceTo != undefined) {
//         result[result.length - 1].size = advanceTo - pos;
//       }
//     }
//     if (advanceTo != undefined) {
//       pos = advanceTo;
//     }
//   });
//   pos = 0;
//   result.forEach(r => {
//     const right = pos + r.size;
//     if (r.opt?.callback) {
//       r.opt?.callback(pos, right);
//     }
//     pos = right;
//   })
//   return result.map(r => r.size);
// }

// // Splitter //////////////////////////////////////////////////////////////////////////

// export function splitByExtent(...exts: ("*" | number)[]): b.Splitter {
//   function cvt(ext: "*" | number): Extent {
//     if (ext === "*") {
//       return { kind: "expand" };
//     } else {
//       return { kind: "fixed", value: ext };
//     }
//   }
//   return (maxSize: number) => {
//     const pos: number[] = [];
//     const ws = resolveExtent(exts.map(cvt), maxSize);
//     let x = 0;
//     for (let i = 0; i < ws.length - 1; i++) {
//       x += ws[i];
//       pos.push(x);
//     }
//     return pos;
//   };
// }

// // RowBlock ////////////////////////////////////////////////////////////////////////////

// export interface RowItem {
//   width: Extent;
//   render: (ctx: DrawerContext, box: Box) => void;
// };

// export type RowItemOpt = {

// };

// export function mkRowItem(width: Extent, render: Renderer, opt?: RowItemOpt): RowItem {
//   let item = { width, render };
//   return item;
// }

// export type RowBlockOpt = {
//   maxWidth?: number;
//   blockOpt?: BlockOpt;
// }

// export function rowBlock(height: number, items: RowItem[], opt?: RowBlockOpt): Block {
//   const maxWidth = opt?.maxWidth;
//   const ws: number[] = resolveExtent(items.map(item => item.width), maxWidth);
//   if (!(items.length === ws.length)) {
//     throw new Error("inconsistent ext result");
//   }
//   return mkBlock(
//     ws.reduce((acc, ele) => acc + ele, 0),
//     height,
//     (ctx: DrawerContext, box: Box) => {
//       let x = 0;
//       for (let i = 0; i < items.length; i++) {
//         const itemWidth = ws[i];
//         const itemBox = b.modify(box, b.shrinkHoriz(x, 0), b.setWidth(itemWidth, "left"));
//         const item = items[i];
//         item.render(ctx, itemBox);
//         x += itemWidth;
//       }
//     },
//     opt?.blockOpt
//   )
// }

// export type TextItemOpt = {
//   textBlockOpt?: TextBlockOpt;
//   containerItemOpt?: ContainerItemOpt;
// }

// export function textItem(ctx: DrawerContext, text: string, opt?: TextItemOpt): RowItem {
//   let textBlockOpt = opt?.textBlockOpt;
//   const block = textBlock(ctx, text, textBlockOpt);
//   return containerItem(
//     { kind: "fixed", value: block.width },
//     block,
//     opt?.containerItemOpt,
//   )
// }

// export type ContainerItemOpt = {
//   putInOpt?: PutInOpt;
//   rowItemOpt?: RowItemOpt;
// }

// export function containerItem(width: Extent, block: Block, opt?: ContainerItemOpt): RowItem {
//   let putInOpt: PutInOpt = { halign: "left", valign: "top" };
//   if (opt?.putInOpt) {
//     putInOpt = Object.assign(putInOpt, opt?.putInOpt);
//   }
//   return mkRowItem(
//     width,
//     (ctx: DrawerContext, box: Box) => {
//       putIn(ctx, block, box, putInOpt);
//     },
//     opt?.rowItemOpt,
//   )
// }

// export type GapItemOpt = {
//   extentOpt?: ExtentOpt;
//   containerItemOpt?: ContainerItemOpt;
//   block?: Block;
// }

// export function gapItem(size: number, opt?: GapItemOpt): RowItem {
//   const width = fixedExtent(size, opt?.extentOpt);
//   if (opt?.block) {
//     return containerItem(
//       width,
//       opt?.block,
//       opt?.containerItemOpt
//     )
//   }
//   return mkRowItem(width, () => { }, opt?.containerItemOpt?.rowItemOpt);
// }

// export type ExpanderItemOpt = {
//   extentOpt?: ExtentOpt;
//   containerItemOpt?: ContainerItemOpt;
//   block?: Block;
// }

// export function expanderItem(opt?: ExpanderItemOpt): RowItem {
//   const width = expandExtent(opt?.extentOpt);
//   if (opt?.block) {
//     return containerItem(
//       width,
//       opt?.block,
//       opt?.containerItemOpt
//     )
//   }
//   return mkRowItem(width, () => { }, opt?.containerItemOpt?.rowItemOpt);
// }

// export type AdvanceToItemOpt = {
//   extentOpt?: ExtentOpt;
//   containerItemOpt?: ContainerItemOpt;
//   block?: Block;
// }

// export function advanceToItem(at: number, opt?: AdvanceToItemOpt): RowItem {
//   const width = advanceToExtent(at, opt?.extentOpt);
//   if (opt?.block) {
//     return containerItem(
//       width,
//       opt?.block,
//       opt?.containerItemOpt
//     )
//   }
//   return mkRowItem(width, () => { }, opt?.containerItemOpt?.rowItemOpt);
// }

// export type SquareItemOpt = {
//   squareBlockOpt?: SquareBlockOpt;
//   rowItemOpt?: RowItemOpt;
//   putInOpt?: PutInOpt;
// }

// export function squareItem(size: number, opt?: SquareItemOpt): RowItem {
//   let putInOpt: PutInOpt = { halign: "center", valign: "center" };
//   if (opt?.putInOpt) {
//     Object.assign(putInOpt, opt?.putInOpt);
//   }
//   return mkRowItem(
//     fixedExtent(size),
//     (ctx: DrawerContext, box: Box) => {
//       const block = squareBlock(size, opt?.squareBlockOpt);
//       putIn(ctx, block, box, putInOpt);
//     },
//     opt?.rowItemOpt
//   )
// }

// export function splitToChars(ctx: DrawerContext, text: string, opt?: TextItemOpt): RowItem[] {
//   return Array.from(text).map(ch => textItem(ctx, ch, opt));
// }

// export function spacedItems(items: RowItem[], space: number): RowItem[] {
//   const rs: RowItem[] = [];
//   items.forEach((item, i) => {
//     if (i !== 0) {
//       rs.push(gapItem(space));
//     }
//     rs.push(item);
//   })
//   return rs;
// }

// export function justifiedItems(items: RowItem[], width: number): RowItem[] {
//   const rs: RowItem[] = [];
//   items.forEach((item, i) => {
//     if (i !== 0) {
//       rs.push(expanderItem());
//     }
//     rs.push(item);
//   })
//   return rs;
// }

// export function modifyItem(item: RowItem, ...fs: ((item: RowItem) => RowItem)[]): RowItem {
//   let i: RowItem = Object.assign({}, item);
//   fs.forEach(f => {
//     i = f(i);
//   });
//   return i;
// }

// // Row blocks //////////////////////////////////////////////////////////////////////////////

// export function justifiedTextBlock(ctx: DrawerContext, text: string, width: number, opt?: TextItemOpt): Block {
//   const chars = splitToChars(ctx, text, opt);
//   const items: RowItem[] = justifiedItems(chars, width);
//   return rowBlock(c.resolveFontHeight(ctx, opt?.textBlockOpt?.font), items, { maxWidth: width });
// }

// export function spacedTextBlock(ctx: DrawerContext, text: string, space: number, opt?: TextItemOpt): Block {
//   const chars = splitToChars(ctx, text, opt);
//   const items: RowItem[] = spacedItems(chars, space);
//   return rowBlock(c.resolveFontHeight(ctx, opt?.textBlockOpt?.font), items);
// }

// export interface TextPackBlockEnv {
//   textBlockOpt?: TextBlockOpt;
//   stackedBlockOpt?: StackedBlockOpt;
// }

// export function textPackBlock(ctx: DrawerContext, text: string, box: Box, envs: TextPackBlockEnv[]): Block {
//   for (let env of envs) {
//     const width = c.textWidthWithFont(ctx, text, env.textBlockOpt?.font);
//     if (width <= b.width(box)) {
//       return textBlock(ctx, text, env.textBlockOpt);
//     } else {
//       const fontSize = c.resolveFontHeight(ctx, env.textBlockOpt?.font);
//       const lines = breakLines(text, fontSize, b.width(box));
//       const height = c.requiredHeight(lines.length, fontSize, env.stackedBlockOpt?.leading ?? 0);
//       if (height <= b.height(box)) {
//         return stackedBlock(lines.map(line => textBlock(ctx, line, env.textBlockOpt)), env.stackedBlockOpt);
//       }
//     }
//   }
//   if (envs.length === 0) {
//     return textBlock(ctx, text);
//   } else {
//     const env = envs[envs.length - 1];
//     const fontSize = c.resolveFontHeight(ctx, env.textBlockOpt?.font);
//     const lines = breakLines(text, fontSize, b.width(box));
//     return stackedBlock(lines.map(line => textBlock(ctx, line, env.textBlockOpt)), env.stackedBlockOpt);
//   }
// }

// // ColumnBlockBuilder ////////////////////////////////////////////////////////////////////////////

// export type ColumnBlockBuilderOpt = {
//   blockOpt?: BlockOpt;
// }

// export class ColumnBlockBuilder {
//   width: number;
//   items: { y: number, block: Block }[] = [];
//   leading: number = 0;
//   ypos: number = 0;

//   constructor(width: number) {
//     this.width = width;
//   }

//   clone(): ColumnBlockBuilder {
//     const builder = new ColumnBlockBuilder(this.width);
//     builder.items = this.items.map(item => Object.assign({}, item));
//     builder.leading = this.leading;
//     builder.ypos = this.ypos;
//     return builder;
//   }

//   build(opt?: ColumnBlockBuilderOpt): Block {
//     const render = (ctx: DrawerContext, box: Box) => {
//       this.items.forEach(item => {
//         const bb = b.modify(box, b.setHeight(item.block.height, "top"), b.shiftDown(item.y));
//         item.block.render(ctx, bb);
//       })
//     }
//     return mkBlock(this.width, this.ypos, render, opt?.blockOpt);
//   }

//   setLeading(leading: number): ColumnBlockBuilder {
//     this.leading = leading;
//     return this;
//   }

//   addBlock(block: Block): ColumnBlockBuilder {
//     if (this.items.length > 0) {
//       this.ypos += this.leading;
//     }
//     this.items.push({
//       y: this.ypos,
//       block,
//     });
//     this.ypos += block.height;
//     return this;
//   }

//   popBlock(): Block | undefined {
//     const item = this.items.pop();
//     if (item === undefined) {
//       return item;
//     } else {
//       this.ypos = item.y;
//       if (this.items.length > 0) {
//         this.ypos -= this.leading;
//       }
//       item.block;
//     }
//   }

//   currentHeight(): number {
//     return this.ypos;
//   }

//   advanceTo(ypos: number): ColumnBlockBuilder {
//     this.ypos = ypos;
//     return this;
//   }

//   isEmpty(): boolean {
//     return this.items.length === 0;
//   }
// }

// // others /////////////////////////////////////////////////////////////////////////////////////////

// export type ParagraphOpt = {
//   blockOpt?: BlockOpt;
//   stackedBlockOpt: StackedBlockOpt;
// };

// export function paragraph(ctx: DrawerContext, text: string, width: number, height: number, opt?: ParagraphOpt): {
//   block: Block; rest: string;
// } {
//   const fontSize = c.currentFontSize(ctx);
//   const lineWidth = width;
//   let start = 0;
//   let blocks: Block[] = [];
//   let stacked: Block | undefined = undefined;
//   while (start < text.length) {
//     const end = breakSingleLine(text, start, fontSize, lineWidth);
//     const line = text.substring(start, end);
//     const block = textBlock(ctx, line, { blockOpt: opt?.blockOpt });
//     const newBlocks = [...blocks, block];
//     const newStacked = stackedBlock(newBlocks, opt?.stackedBlockOpt);
//     if (stacked === undefined || newStacked.height <= height) {
//       blocks = newBlocks;
//       stacked = newStacked;
//       start = end;
//     } else {
//       break;
//     }
//   }
//   return {
//     block: stacked ?? emptyBlock(),
//     rest: text.substring(start)
//   }
// }

// export type DrawSplitTextOpt = {
//   textBlockOpt?: TextBlockOpt;
//   putInOpt?: PutInOpt;
// }

// export function drawSplitText(ctx: DrawerContext, text: string, box: Box, opt?: DrawSplitTextOpt) {
//   const bs = b.splitToColumns(box, b.evenSplitter(text.length));
//   Array.from(text).forEach((ch, i) => {
//     console.log("ch", ch);
//     const block = textBlock(ctx, ch, opt?.textBlockOpt);
//     putIn(ctx, block, bs[i], opt?.putInOpt);
//   })
// }
