import { mkBox, type Box } from "./box";
import type { DrawerContext } from "./context";
import * as c from "./compiler";
import * as b from "./box";
import type { HAlign, VAlign } from "./align";
import type { Color } from "./compiler";
import { breakMultipleLines, breakSingleLine } from "./break-lines";
import { stringToCharWidths } from "./char-width";

export interface Position {
  x: number;
  y: number;
}

export interface Offset {
  dx: number;
  dy: number;
}

export function addOffsets(...offsets: Offset[]): Offset {
  let offset = { dx: 0, dy: 0 };
  offsets.forEach(ofs => {
    offset = {
      dx: offset.dx + ofs.dx,
      dy: offset.dy + ofs.dy,
    };
  })
  return offset;
}

export function shiftPosition(pos: Position, ...offsets: Offset[]): Position {
  for(let offset of offsets){
    pos = {
      x: pos.x + offset.dx,
      y: pos.y + offset.dy,
    }
  }
  return pos;
}

export function horizAlign(itemWidth: number, boundWidth: number, halign: HAlign): number {
  switch (halign) {
    case "left": return 0;
    case "center": return (boundWidth - itemWidth) * 0.5;
    case "right": return boundWidth - itemWidth;
  }
}

export function vertAlign(itemHeight: number, boundHeight: number, valign: VAlign): number {
  switch (valign) {
    case "top": return 0;
    case "center": return (boundHeight - itemHeight) * 0.5;
    case "bottom": return boundHeight - itemHeight;
  }
}

export interface Extent {
  width: number;
  height: number;
}

export function eqExtent(a: Extent, b: Extent): boolean {
  return a.width === b.width && a.height === b.height;
}

export function extentSmallerOrEqual(a: Extent, b: Extent): boolean {
  return a.width <= b.width && a.height <= b.height;
}

export function align(childExtent: Extent, parentExtent: Extent, halign: HAlign, valign: VAlign): Offset {
  return {
    dx: horizAlign(childExtent.width, parentExtent.width, halign),
    dy: vertAlign(childExtent.height, parentExtent.height, valign),
  }
}

export function insetExtent(extent: Extent, dx: number, dy: number = dx, dx2: number = dx, dy2: number = dy):
  OffsetExtent {
  return {
    offset: { dx, dy },
    extent: { width: extent.width - dx - dx2, height: extent.height - dy - dy2 }
  };
}

export function extentOfBox(box: Box): Extent {
  return { width: b.width(box), height: b.height(box) }
}

export function leftTopOfBox(box: Box): Position {
  return { x: box.left, y: box.top };
}

export function positionExtentToBox(pos: Position, extent: Extent): Box {
  return b.mkBox(pos.x, pos.y, pos.x + extent.width, pos.y + extent.height);
}

export function centerOfExtent(ext: Extent): Offset {
  return { dx: ext.width * 0.5, dy: ext.height * 0.5 };
}

export interface Renderer {
  renderAt: (ctx: DrawerContext, pos: Position) => void;
}

// Item /////////////////////////////////////////////////////////////////////////////////

export type Item = {
  extent: Extent;
} & Renderer;

export interface TextOpt {
  font?: string;
  color?: Color;
};

export function textItem(ctx: DrawerContext, text: string, opt?: TextOpt): Item {
  const width = c.textWidthWithFont(ctx, text, opt?.font);
  const height = c.resolveFontHeight(ctx, opt?.font);
  return {
    extent: { width, height },
    renderAt: (ctx: DrawerContext, pos: Position) => {
      let { x, y } = pos;
      const fontSize = c.resolveFontHeight(ctx, opt?.font);
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
    }
  }
}

export function emptyItem(extent: Extent = { width: 0, height: 0 }): Item {
  return { extent, renderAt: () => { } }
}

export function decorateItem(item: Item, deco: (extent: Extent) => Renderer): Item {
  return {
    extent: item.extent,
    renderAt(ctx, pos) {
      item.renderAt(ctx, pos);
      deco(item.extent).renderAt(ctx, pos);
    },
  }
}

export function frame(extent: Extent, pen?: string): Renderer {
  return boxRenderer(extent, (ctx, box) => {
    c.withPen(ctx, pen, () => {
      c.frame(ctx, box);
    });
  });
}

export function frameBottom(extent: Extent, pen?: string): Renderer {
  return boxRenderer(extent, (ctx, box) => {
    c.withPen(ctx, pen, () => {
      c.frameBottom(ctx, box)
    });
  });
}

export function frameRight(extent: Extent, pen?: string): Renderer {
  return boxRenderer(extent, (ctx, box) => {
    c.withPen(ctx, pen, () => {
      c.frameRight(ctx, box)
    });
  });
}

export function boxRenderer(extent: Extent, f: (ctx: DrawerContext, box: Box) => void): Renderer {
  return {
    renderAt: (ctx: DrawerContext, pos: Position) => {
      const box = positionExtentToBox(pos, extent);
      f(ctx, box);
    }
  }
}

export function boxItem(extent: Extent, f: (ctx: DrawerContext, box: Box) => void): Item {
  return {
    extent,
    renderAt: (ctx: DrawerContext, pos: Position) => {
      const box = positionExtentToBox(pos, extent);
      f(ctx, box);
    }
  }
}

export function insetItem(item: Item, dx: number, dy: number = dx, dx2: number = dx, dy2: number = dy): Item {
  return {
    extent: { width: item.extent.width - dx - dx2, height: item.extent.height - dy - dy2 },
    renderAt: (ctx: DrawerContext, pos: Position) => {
      item.renderAt(ctx, shiftPosition(pos, { dx, dy }))
    }
  }
}

export function alignedText(ctx: DrawerContext, text: string, extent: Extent,
  halign: HAlign, valign: VAlign, opt?: TextOpt): Item {
  const item = textItem(ctx, text, opt);
  return alignedItem(item, extent, halign, valign);
}

export function stackedItems(items: Item[], opt?: { halign?: HAlign }): Item {
  const width = Math.max(0, ...items.map(ele => ele.extent.width));
  const height = items.reduce((acc, ele) => acc + ele.extent.height, 0);
  const extent: Extent = { width, height };
  const halign: HAlign = opt?.halign ?? "left";
  return {
    extent,
    renderAt(ctx: DrawerContext, pos: Position) {
      let dy = 0;
      items.forEach(item => {
        const dx = horizAlign(item.extent.width, width, halign);
        item.renderAt(ctx, shiftPosition(pos, { dx, dy }));
        dy += item.extent.height;
      })
    }
  }
}

export class Container implements Renderer {
  children: { offset: Offset, renderer: Renderer }[] = [];

  add(renderer: Renderer, ...offsets: Offset[]) {
    this.children.push({ offset: addOffsets(...offsets), renderer });
  }

  addAligned(item: Item, bound: { offset: Offset; extent: Extent }, halign: HAlign, valign: VAlign) {
    const aligned = alignedItem(item, bound.extent, halign, valign);
    this.add(aligned, bound.offset);
  }

  addCreated(creator: (extent: Extent) => Renderer, at: OffsetExtent) {
    const renderer = creator(at.extent);
    this.add(renderer, at.offset);
  }

  frame(at: OffsetExtent, pen?: string) {
    this.add(frame(at.extent, pen), at.offset);
  }

  frameExtent(extent: Extent, pen?: string) {
    this.frame({ offset: zeroOffset(), extent }, pen);
  }

  frameRight(at: OffsetExtent, pen?: string) {
    this.add(frameRight(at.extent, pen), at.offset);
  }

  frameBottom(at: OffsetExtent, pen?: string) {
    this.add(frameBottom(at.extent, pen), at.offset);
  }

  renderAt(ctx: DrawerContext, pos: Position) {
    this.children.forEach(child => {
      child.renderer.renderAt(ctx, shiftPosition(pos, child.offset));
    })
  }
}

export function alignedItem(item: Item, extent: Extent, halign: HAlign, valign: VAlign): Item {
  return {
    extent,
    renderAt(ctx: DrawerContext, pos: Position) {
      const offset = align(item.extent, extent, halign, valign);
      item.renderAt(ctx, shiftPosition(pos, offset));
    },
  }
}

export function justifiedItem(items: Item[], width: number): Item {
  if (items.length === 0) {
    return emptyItem();
  } else if (items.length === 1) {
    return items[0];
  } else {
    const height = items.reduce((acc, ele) => Math.max(acc, ele.extent.height), 0);
    const rest = width - items.reduce((acc, ele) => acc + ele.extent.width, 0);
    const gap = rest / (items.length - 1);
    const con = new Container();
    let dx = 0;
    items.forEach((item, i) => {
      if (i !== 0) {
        dx += gap;
      }
      con.add(item, { dx, dy: 0 });
      dx += item.extent.width;
    })
    return Object.assign(con, { extent: { width, height } });
  }
}

export function justifiedText(ctx: DrawerContext, text: string, width: number, opt?: {
  font?: string, color?: Color;
}): Item {
  const items = Array.from(text).map(t => textItem(ctx, t, { font: opt?.font, color: opt?.color }));
  return justifiedItem(items, width);
}

export function verticallyJustifiedItem(items: Item[], height: number): Item {
  if (items.length === 0) {
    return emptyItem();
  } else if (items.length === 1) {
    return items[0];
  } else {
    const width = items.reduce((acc, ele) => Math.max(acc, ele.extent.width), 0);
    const rest = height - items.reduce((acc, ele) => acc + ele.extent.height, 0);
    const gap = rest / (items.length - 1);
    const con = new Container();
    let dy = 0;
    items.forEach((item, i) => {
      if (i !== 0) {
        dy += gap;
      }
      con.add(item, { dx: 0, dy });
      dy += item.extent.height;
    })
    return Object.assign(con, { extent: { width, height } });
  }
}

export function verticallyJustifiedText(ctx: DrawerContext, text: string, height: number): Item {
  const items = Array.from(text).map(t => textItem(ctx, t));
  return verticallyJustifiedItem(items, height);
}

// OffsetExtent ////////////////////////////////////////////////////////////

export interface OffsetExtent {
  offset: Offset;
  extent: Extent;
}

export function insetOffsetExtent(oe: OffsetExtent, dx: number, dy: number = dx,
  dx2: number = dx, dy2: number = dy): OffsetExtent {
  return {
    offset: addOffsets(oe.offset, { dx, dy }),
    extent: {
      width: oe.extent.width - dx - dx2,
      height: oe.extent.height - dy - dy2,
    }
  }
}

export function centerOfOffsetExtent(oe: OffsetExtent): Offset {
  return addOffsets(oe.offset, centerOfExtent(oe.extent));
}

export function zeroOffset(): Offset {
  return { dx: 0, dy: 0 };
}

// RowBuilder ///////////////////////////////////////////////////////////////////////////////

export class RowBuilder {
  extent: Extent;
  offset: Offset;

  constructor(extent: Extent, offset?: Offset) {
    this.extent = extent;
    this.offset = offset ?? { dx: 0, dy: 0 };
  }

  static fromOffsetExtent(oe: OffsetExtent): ColumnBuilder {
    return new RowBuilder(oe.extent, oe.offset);
  }

  static fromExtent(extent: Extent): RowBuilder {
    return new RowBuilder(extent);
  }

  splitBySizes(...specs: RowColumnFlexSize[]): OffsetExtent[] {
    const hs = resolveFlexSizes(specs, this.extent.height);
    const rows: { offset: Offset, extent: Extent }[] = [];
    let top = 0;
    if (hs.length !== specs.length) {
      throw new Error("inconsistent flex size length");
    }
    for (let i = 0; i < specs.length; i++) {
      const spec = specs[i];
      const height = hs[i];
      if (!spec["instruction-only"]) {
        rows.push({
          offset: addOffsets(this.offset, { dx: 0, dy: top }),
          extent: { width: this.extent.width, height }
        });
      }
      top += height;

    }
    return rows;
  }

  splitEven(n: number): { offset: Offset, extent: Extent }[] {
    return this.splitBySizes(...repeat({ kind: "expand" } as const, n));
  }

  fixed(size: number): RowColumnFlexSize[] {
    return [{ kind: "fixed", value: size }];
  }


  expand(): RowColumnFlexSize[] {
    return [{ kind: "expand" }];
  }

  expandTo(position: number): RowColumnFlexSize[] {
    return [{ kind: "expand" }, { kind: "advance-to", position, "instruction-only": true }]
  }

  skip(size: number): RowColumnFlexSize[] {
    return [{ kind: "fixed", value: size, "instruction-only": true }]
  }

  tabTo(position: number): RowColumnFlexSize[] {
    return [{ kind: "advance-to", position, "instruction-only": true }];
  }

  split(...specs: RowColumnFlexSize[][]): OffsetExtent[] {
    const sizes: RowColumnFlexSize[] = [];
    specs.forEach(spec => sizes.push(...spec));
    return this.splitBySizes(...sizes);
  }

  splitAt(...positions: number[]): OffsetExtent[] {
    const specs: RowColumnFlexSize[][] = positions.map(pos => this.expandTo(pos));
    specs.push(this.expand());
    return this.split(...specs);
  }
}

// ColumnBuilder //////////////////////////////////////////////////////////////////////////////

export class ColumnBuilder {
  extent: Extent;
  offset: Offset;

  constructor(extent: Extent, offset?: Offset) {
    this.extent = extent;
    this.offset = offset ?? { dx: 0, dy: 0 };
  }

  static fromOffsetExtent(oe: OffsetExtent): ColumnBuilder {
    return new ColumnBuilder(oe.extent, oe.offset);
  }

  static fromExtent(extent: Extent): ColumnBuilder {
    return new ColumnBuilder(extent);
  }

  splitBySizes(...specs: RowColumnFlexSize[]): OffsetExtent[] {
    const ws = resolveFlexSizes(specs, this.extent.width);
    const cols: { offset: Offset, extent: Extent }[] = [];
    let left = 0;
    if (ws.length !== specs.length) {
      throw new Error("inconsistent flex size length");
    }
    for (let i = 0; i < specs.length; i++) {
      const spec = specs[i];
      const width = ws[i];
      if (!spec["instruction-only"]) {
        cols.push({
          offset: addOffsets(this.offset, { dx: left, dy: 0 }),
          extent: { width, height: this.extent.height }
        });
      }
      left += width;

    }
    return cols;
  }

  splitEven(n: number): { offset: Offset, extent: Extent }[] {
    return this.splitBySizes(...repeat({ kind: "expand" } as const, n));
  }

  fixed(size: number): RowColumnFlexSize[] {
    return [{ kind: "fixed", value: size }];
  }


  expand(): RowColumnFlexSize[] {
    return [{ kind: "expand" }];
  }

  expandTo(position: number): RowColumnFlexSize[] {
    return [{ kind: "expand" }, { kind: "advance-to", position, "instruction-only": true }]
  }

  skip(size: number): RowColumnFlexSize[] {
    return [{ kind: "fixed", value: size, "instruction-only": true }]
  }

  tabTo(position: number): RowColumnFlexSize[] {
    return [{ kind: "advance-to", position, "instruction-only": true }];
  }

  split(...specs: RowColumnFlexSize[][]): OffsetExtent[] {
    const sizes: RowColumnFlexSize[] = [];
    specs.forEach(spec => sizes.push(...spec));
    return this.splitBySizes(...sizes);
  }

  splitAt(...positions: number[]): OffsetExtent[] {
    const specs: RowColumnFlexSize[][] = positions.map(pos => this.expandTo(pos));
    specs.push(this.expand());
    return this.split(...specs);
  }
}

// row column specs //////////////////////////////////////////////////////////////////////////

export function fixed(size: number): RowColumnFlexSize[] {
  return [{ kind: "fixed", value: size }];
}


export function expand(): RowColumnFlexSize[] {
  return [{ kind: "expand" }];
}

export function expandTo(position: number): RowColumnFlexSize[] {
  return [{ kind: "expand" }, { kind: "advance-to", position, "instruction-only": true }]
}

export function skip(size: number): RowColumnFlexSize[] {
  return [{ kind: "fixed", value: size, "instruction-only": true }]
}

export function tabTo(position: number): RowColumnFlexSize[] {
  return [{ kind: "advance-to", position, "instruction-only": true }];
}

// FlexSize //////////////////////////////////////////////////////////////////////////////////

export type FlexSizeBase = {
  kind: "fixed";
  value: number;
} | {
  kind: "expand";
}

export type FlexSize = FlexSizeBase | {
  kind: "advance-to";
  position: number;
}

function resolveFlexSizeBases(sizes: FlexSizeBase[], totalSize?: number): number[] {
  let sum = 0;
  let nexp = 0;
  sizes.forEach(size => {
    switch (size.kind) {
      case "fixed": {
        sum += size.value;
        break;
      }
      case "expand": {
        nexp += 1;
        break;
      }
    }
  });
  let expand = 0;
  if (nexp > 0) {
    if (totalSize !== undefined) {
      expand = (totalSize - sum) / nexp;
    } else {
      console.error("totalSize unspecified while processing expand");
    }
  }
  return sizes.map(size => {
    switch (size.kind) {
      case "fixed": return size.value;
      case "expand": return expand;
    }
  });
}

function resolveFlexSizes(sizes: FlexSize[], totalSize?: number): number[] {
  const groups: { sizes: FlexSizeBase[], totalSize?: number }[] = [];
  let acc: FlexSizeBase[] = [];
  let lastPosition = 0;
  sizes.forEach(size => {
    if (size.kind === "advance-to") {
      acc.push({ kind: "fixed", value: 0 }); // placeholder for advance-to element
      groups.push({ sizes: acc, totalSize: size.position - lastPosition });
      lastPosition = size.position;
      acc = [];
    } else {
      acc.push(size);
    }
  });
  groups.push({ sizes: acc, totalSize: (totalSize ? totalSize - lastPosition : undefined) });
  const resolved: number[] = [];
  groups.forEach(group => {
    const rs = resolveFlexSizeBases(group.sizes, group.totalSize);
    resolved.push(...rs);
  });
  return resolved;
}

// RowColumnFlexSize ///////////////////////////////////////////////////////////////////////////

export type RowColumnFlexSize = FlexSize & { "instruction-only"?: true };

// FlexRow /////////////////////////////////////////////////////////////////////////////////////

export type FlexRowItem = ({
  kind: "item";
  item: Item;
  decorator?: (extent: Extent) => Renderer;
} | {
  kind: "gap";
  width: number;
  content?: (extent: Extent) => Item;
} | {
  kind: "expand";
  content?: (extent: Extent) => Item;
} | {
  kind: "advance-to";
  position: number;
}) & { halign?: HAlign, valign?: VAlign, "instruction-only"?: true };

export function flexRow(height: number, rowItems: FlexRowItem[], maxWidth?: number): Item {
  const flexSizes: FlexSize[] = rowItems.map(item => {
    switch (item.kind) {
      case "item": return { kind: "fixed", value: item.item.extent.width };
      case "gap": return { kind: "fixed", value: item.width };
      case "expand": return { kind: "expand" };
      case "advance-to": return { kind: "advance-to", position: item.position };
    }
  })
  const ws = resolveFlexSizes(flexSizes, maxWidth);
  const items: Item[] = [];
  if (rowItems.length !== ws.length) {
    throw new Error("inconsistent ws length (flexRow)");
  }
  for (let i = 0; i < rowItems.length; i++) {
    const rowItem = rowItems[i];
    const extent = { width: ws[i], height };
    let innerItem: Item;
    switch (rowItem.kind) {
      case "item": {
        if (rowItem.decorator) {
          const con = new Container();
          con.add(rowItem.item);
          const deco = rowItem.decorator(rowItem.item.extent);
          con.add(deco);
          innerItem = Object.assign(con, { extent: rowItem.item.extent });
        } else {
          innerItem = rowItem.item;
        }
        break;
      }
      case "gap": {
        if (rowItem.content) {
          innerItem = rowItem.content(extent);
        } else {
          innerItem = emptyItem();
        }
        break;
      }
      case "expand": {
        if (rowItem.content) {
          innerItem = rowItem.content(extent);
        } else {
          innerItem = emptyItem();
        }
        break;
      }
      case "advance-to": {
        innerItem = emptyItem({ width: 0, height });
        break;
      }
    }
    items.push(alignedItem(innerItem, extent, rowItem.halign ?? "left", rowItem.valign ?? "top"));
  }
  if (items.length !== ws.length) {
    throw new Error("inconsistent items length (flexRow)");
  }
  const width = items.reduce((acc, ele) => acc + ele.extent.width, 0);
  const con = new Container();
  let dx = 0;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const itemWidth = ws[i];
    con.add(item, { dx, dy: 0 });
    dx += itemWidth;
  }
  return {
    extent: { width, height },
    renderAt: (ctx: DrawerContext, pos: Position) => con.renderAt(ctx, pos)
  }
}

// stuffedTextItem //////////////////////////////////////////////////////////////////////////////

export type StuffedItemSpec = {
  innerItemCreator: (ctx: DrawerContext, text: string, boundWidth: number) => Item;
  innerItemAligner: (item: Item) => Item;
}

export function stuffedTextItem(ctx: DrawerContext, text: string, extent: Extent, specs: StuffedItemSpec[],
  ifAllFails: StuffedItemSpec): Item {
  for (let spec of specs) {
    let item: Item = spec.innerItemCreator(ctx, text, extent.width);
    if (extentSmallerOrEqual(item.extent, extent)) {
      return spec.innerItemAligner(item);
    }
  }
  let item = ifAllFails.innerItemCreator(ctx, text, extent.width);
  console.log("item", item);
  return ifAllFails.innerItemAligner(item);
}

// wrappedTextItem //////////////////////////////////////////////////////////////////////////////

export function wrappedTextItem(ctx: DrawerContext, text: string, width: number, opt?: {
  font?: string;
  color?: Color;
  halign?: HAlign;
}): Item {
  const font = opt?.font;
  const lines = breakToLines(ctx, text, width, font);
  const items = lines.map(line => textItem(ctx, line, { font, color: opt?.color }));
  return stackedItems(items, { halign: opt?.halign })
}

// Others ///////////////////////////////////////////////////////////////////////////////////////

export function breakToLines(ctx: DrawerContext, text: string, width: number, font?: string): string[] {
  const fontSize = c.resolveFontHeight(ctx, font);
  return breakMultipleLines(text, fontSize, width);
}

export function breakToTextItems(ctx: DrawerContext, text: string, width: number, opt?: {
  font?: string; color?: Color;
}): Item[] {
  return breakToLines(ctx, text, width, opt?.font).map(text => textItem(ctx, text, { font: opt?.font, color: opt?.color }));
}

function repeat<T>(a: T, n: number): T[] {
  const as: T[] = [];
  for (let i = 0; i < n; i++) {
    as.push(a);
  }
  return as;
}

export function interpose<T>(ts: T[], value: (i: number) => T): T[] {
  if (ts.length <= 1) {
    return ts;
  } else {
    const rs: T[] = [];
    ts.forEach((t, i) => {
      if (i !== 0) {
        rs.push(value(i - 1));
      }
      rs.push(t);
    })
    return rs;
  }
}

export function flowTextIn(ctx: DrawerContext, extent: Extent, text: string, opt?: {
  font?: string;
  color?: Color;
  leading?: number;
}): { renderer: Renderer, rest: string } {
  const font = opt?.font;
  const fontSize = c.resolveFontHeight(ctx, font);
  const lineWidth = extent.width;
  let start = 0;
  let leading = opt?.leading ?? 0;
  let items: Item[] = [];
  let iter = 0;
  while (start < text.length) {
    const nline = items.length + 1;
    const nextHeight = fontSize * nline + leading * (nline - 1);
    if (nextHeight > extent.height) {
      break;
    }
    const end = breakSingleLine(text, start, fontSize, lineWidth);
    const line = text.substring(start, end);
    const item = textItem(ctx, line, { font, color: opt?.color });
    items.push(item);
    start = end;
    if (++iter > 200) {
      throw new Error("too many iteration (flowTextIn)");
    }
  }
  const halign: HAlign = "left"
  return {
    renderer: stackedItems(items, { halign }),
    rest: text.substring(start)
  }
}

export function stackedTexts(ctx: DrawerContext, texts: string[], opt?: {
  font?: string, color?: Color, halign?: HAlign, leading?: number
}
): Item {
  const font = opt?.font;
  const halign = opt?.halign ?? "left";
  const leading = opt?.leading ?? 0;
  let items = texts.map(text => textItem(ctx, text, { font, color: opt?.color }));
  if (leading !== 0) {
    const spacer = emptyItem({ width: 0, height: leading });
    items = interpose(items, () => spacer);
  }
  return stackedItems(items, { halign });
}

export function stackedJustifiedTexts(ctx: DrawerContext, texts: string[], opt?: {
  font?: string, color?: Color, leading?: number
}
): Item {
  const font = opt?.font;
  let width = 0;
  Array.from(texts).forEach(text => {
    const tw = c.textWidthWithFont(ctx, text, font);
    width = Math.max(width, tw);
  });
  const leading = opt?.leading ?? 0;
  let items = texts.map(text => justifiedText(ctx, text, width, { font, color: opt?.color }));
  if (leading !== 0) {
    const spacer = emptyItem({ width: 0, height: leading });
    items = interpose(items, () => spacer);
  }
  return stackedItems(items, { halign: "left" });
}

export class GrowingColumn {
  width: number;
  contents: { dy: number, item: Item }[] = [];
  top = 0;

  constructor(width: number) {
    this.width = width;
  }

  add(item: Item, halign?: HAlign) {
    if( halign !== undefined ){
      const extent = { width: this.width, height: item.extent.height };
      item = alignedItem(item, extent, halign, "top");
    }
    this.contents.push({ dy: this.top, item });
    this.top += item.extent.height;
  }

  advance(dy: number) {
    this.top += dy;
  }

  advanceTo(top: number) {
    this.top = top;
  }

  toItem(): Item {
    const extent = { width: this.width, height: this.top };
    const renderAt = (ctx: DrawerContext, pos: Position) => {
      this.contents.forEach(content => {
        content.item.renderAt(ctx, shiftPosition(pos, { dx: 0, dy: content.dy }));
      })
    }
    return { extent, renderAt };
  }
}

export class GrowingColumnGroup {
  columns: GrowingColumn[];

  constructor(...columns: GrowingColumn[]) {
    this.columns = columns;
  }

  add(col: GrowingColumn) {
    this.columns.push(col);
  }

  toItem(): Item {
    const colItems: Item[] = this.columns.map(col => col.toItem());
    const width = colItems.reduce((acc, ele) => acc + ele.extent.width, 0);
    const height = Math.max(...colItems.map(col => col.extent.height));
    const renderAt  = (ctx: DrawerContext, pos: Position) => {
      let dx = 0;
      colItems.forEach(item => {
        item.renderAt(ctx, shiftPosition(pos, { dx, dy: 0 }));
        dx += item.extent.width;
      })
    }
    return {
      extent: { width, height },
      renderAt,
    }
  }
}
