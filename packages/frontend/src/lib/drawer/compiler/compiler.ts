import type { DrawerContext } from "./context";
import { FontWeightBold, FontWeightDontCare, FontWeightNormal } from "./font-weight";
import type { Op } from "./op";
import * as fsm from "./font-size-manager";
import * as b from "./box";
import type { Box, Modifier, Splitter } from "./box";
import type { HAlign, VAlign } from "./align";
import { stringDrawWidth, stringToCharWidths } from "./char-width";
import { sumOfNumbers } from "./util";
import { scaleOp } from "./scale";
import { offsetOp } from "./offset";
import { breakLines } from "./break-lines";
import { hasCompTmpl, parseCompTmpl } from "@/practice/jihi-kenshin/composite-template";

export interface GetOpsOpt {
  scale?: number;
  offsetX?: number;
  offsetY?: number;
}

export function getOps(ctx: DrawerContext, opt: GetOpsOpt = {}): Op[] {
  const scale = opt.scale ?? 1;
  const offsetX = opt.offsetX ?? 0;
  const offsetY = opt.offsetY ?? 0;
  if (scale === 1 && offsetX === 0 && offsetY === 0) {
    return ctx.ops;
  } else {
    let ops = ctx.ops;
    if (scale !== 1) {
      ops = ops.map(op => scaleOp(op, scale));
    }
    if (offsetX !== 0 || offsetY !== 0) {
      ops = ops.map(op => offsetOp(op, offsetX, offsetY))
    }
    return ops;
  }

}

export function moveTo(ctx: DrawerContext, x: number, y: number) {
  ctx.ops.push(["move_to", x, y]);
}

export function lineTo(ctx: DrawerContext, x: number, y: number) {
  ctx.ops.push(["line_to", x, y]);
}

export function createFont(
  ctx: DrawerContext, name: string, fontName: string, size: number,
  weight: number | "bold" = FontWeightDontCare, italic: boolean = false) {
  function resolveWeight(): number {
    if (weight === "bold") {
      return FontWeightBold;
    } else {
      return weight;
    }
  }
  ctx.ops.push(["create_font", name, fontName, size, resolveWeight(), italic ? 1 : 0]);
  fsm.registerFontSize(ctx.fsm, name, size);
}

export function setFont(ctx: DrawerContext, name: string) {
  ctx.ops.push(["set_font", name]);
  fsm.setFont(ctx.fsm, name);
  ctx.currentFont = name;
}

export function setTextColor(ctx: DrawerContext, r: number, g: number, b: number) {
  ctx.ops.push(["set_text_color", r, g, b]);
}

export function drawChars(ctx: DrawerContext, str: string, xs: number[], ys: number[]) {
  ctx.ops.push(["draw_chars", str, xs, ys]);
}

export function createPen(ctx: DrawerContext, name: string, r: number, g: number, b: number,
  width: number, penStyle: number[] = []) {
  ctx.ops.push(["create_pen", name, r, g, b, width, penStyle])
}

export function setPen(ctx: DrawerContext, name: string) {
  ctx.ops.push(["set_pen", name]);
}

export function circle(ctx: DrawerContext, x: number, y: number, r: number) {
  ctx.ops.push(["circle", x, y, r]);
}

export function getCurrentFont(ctx: DrawerContext): string {
  if (ctx.currentFont === undefined) {
    throw new Error("Cannot get current font");
  }
  return ctx.currentFont;
}

export function mark(ctx: DrawerContext, key: string, box: Box) {
  ctx.marks[key] = box;
}

export function getMark(ctx: DrawerContext, key: string, ...modifiers: Modifier[]): Box {
  let mark = ctx.marks[key];
  if (!mark) {
    throw new Error(`Cannot find mark: ${key}.`);
  }
  if (modifiers.length > 0) {
    mark = b.modify(mark, ...modifiers)
  }
  return mark;
}

function locateY(box: Box, fontSize: number, valign: VAlign) {
  switch (valign) {
    case "top": return box.top;
    case "center": return b.cy(box) - fontSize / 2.0;
    case "bottom": return box.bottom - fontSize;
    default: throw new Error(`unknown valign: ${valign}`)
  }
}

function locateX(box: Box, fontSize: number, halign: HAlign) {
  switch (halign) {
    case "left": return box.left;
    case "center": return b.cx(box) - fontSize / 2.0;
    case "right": return box.right - fontSize;
    default: throw new Error("`unknown halign: ${halign}");
  }
}

export function currentFontSize(ctx: DrawerContext): number {
  return fsm.getCurrentFontSize(ctx.fsm);
}

export function getFontSizeOf(ctx: DrawerContext, fontName: string): number {
  return fsm.getFontSizeOf(ctx.fsm, fontName);
}

export function drawTextJustified(ctx: DrawerContext, text: string, box: Box, valign: VAlign) {
  const fontSize = currentFontSize(ctx);
  const charWidths = stringToCharWidths(text, fontSize);
  const y = locateY(box, fontSize, valign);
  if (charWidths.length === 0) {
    return;
  } else if (charWidths.length === 1) {
    drawChars(ctx, text, [box.left], [y]);
    return;
  }
  const length = sumOfNumbers(charWidths);
  const remain = b.width(box) - length;
  const gap = remain / (charWidths.length - 1);
  let x = box.left;
  let xs: number[] = [];
  let ys: number[] = [];
  for (let i = 0; i < charWidths.length; i++) {
    if (i > 0) {
      x += gap;
    }
    xs.push(x);
    ys.push(y);
    x += charWidths[i];
  }
  drawChars(ctx, text, xs, ys);
}

export function drawTextJustifiedVertically(ctx: DrawerContext, text: string, box: Box, halign: HAlign) {
  const fontSize = fsm.getCurrentFontSize(ctx.fsm);
  const x = locateX(box, fontSize, halign);
  if (text.length === 0) {
    return;
  } else if (text.length === 1) {
    drawChars(ctx, text, [x], [box.top]);
    return;
  }
  const length = text.length * fontSize;
  const remain = b.height(box) - length;
  const gap = remain / (text.length - 1);
  let y = box.top;
  const xs: number[] = [];
  const ys: number[] = [];
  for (let i = 0; i < text.length; i++) {
    if (i > 0) {
      y += gap;
    }
    xs.push(x);
    ys.push(y);
    y += fontSize;
  }
  drawChars(ctx, text, xs, ys);
}

export interface DrawTextOptionArg {
  interCharsSpace?: number;
  dy?: number;
  modifiers?: Modifier[];
}

class DrawerTextOption {
  interCharsSpace: number;
  dy: number;
  modifiers: Modifier[];

  constructor(arg: DrawTextOptionArg) {
    this.interCharsSpace = arg.interCharsSpace ?? 0;
    this.dy = arg.dy ?? 0;
    this.modifiers = arg.modifiers ?? [];
  }
}

export function drawText(ctx: DrawerContext, text: string, box: Box, halign: HAlign, valign: VAlign,
  optArg: DrawTextOptionArg = {}) {
  const opt = new DrawerTextOption(optArg);
  if( opt.modifiers.length > 0 ){
    box = b.modify(box, ...opt.modifiers);
  }
  const fontSize = fsm.getCurrentFontSize(ctx.fsm);
  let charWidths = stringToCharWidths(text, fontSize);
  if (opt.interCharsSpace !== 0) {
    charWidths = charWidths.map((cs, i) => {
      if (i !== charWidths.length - 1) {
        return cs + opt.interCharsSpace;
      } else {
        return cs;
      }
    })
  }
  const length = sumOfNumbers(charWidths);
  const y = locateY(box, fontSize, valign) + opt.dy;
  let x: number;
  switch (halign) {
    case "left": {
      x = box.left;
      break;
    }
    case "center": {
      x = b.cx(box) - length / 2.0;
      break;
    }
    case "right": {
      x = box.right - length;
      break;
    }
  }
  const xs: number[] = [];
  const ys: number[] = [];
  for (let i = 0; i < charWidths.length; i++) {
    xs.push(x);
    ys.push(y);
    x += charWidths[i];
  }
  drawChars(ctx, text, xs, ys);
}

export interface DrawTextVerticallyOptionArg {
  interCharsSpace?: number;
}

class DrawerTextVerticallyOption {
  interCharsSpace: number;

  constructor(arg: DrawTextVerticallyOptionArg) {
    this.interCharsSpace = arg.interCharsSpace ?? 0;
  }
}

export function drawTextVertically(ctx: DrawerContext, text: string, box: Box, halign: HAlign, valign: VAlign,
  optArg: DrawTextOptionArg = {}) {
  const opt = new DrawerTextVerticallyOption(optArg);
  const fontSize = currentFontSize(ctx);
  const tw = fontSize;
  let th = fontSize * text.length;
  if (text.length > 1 && opt.interCharsSpace !== 0) {
    th += opt.interCharsSpace * (text.length - 1);
  }
  let x: number;
  switch (halign) {
    case "center": {
      x = b.cx(box) - tw / 2.0;
      break;
    }
    case "right": {
      x = box.right - tw;
      break;
    }
    default: {
      x = box.left;
      break;
    }
  }
  let y: number;
  switch (valign) {
    case "center": {
      y = b.cy(box) - th / 2.0;
      break;
    }
    case "bottom": {
      y = box.bottom - th;
      break;
    }
    default: {
      y = box.top;
      break;
    }
  }
  for (let i = 0; i < text.length; i++) {
    const ch = text.charAt(i);
    drawChars(ctx, ch, [x], [y]);
    y += fontSize + opt.interCharsSpace;
  }
}

export function drawTextInEvenColumns(ctx: DrawerContext, text: string, box: Box, ncol: number,
  justify: "left" | "right" = "left") {
  let start = 0;
  if (justify === "right") {
    start = ncol - text.length;
  }
  const cols = b.splitToColumns(box, b.evenSplitter(ncol));
  for (let i = 0; i < text.length; i++) {
    const ch = text.charAt(i);
    drawText(ctx, ch, cols[start], "center", "center");
    start += 1;
  }
}

export interface DrawTextsInBoxesOptArg {
  lineHeight?: number;
  leading?: number;
  valignChunk?: VAlign;
}

export class DrawTextsInBoxesOpt {
  lineHeight: number;
  leading: number;
  valignChunk: VAlign;

  constructor(arg: DrawTextsInBoxesOptArg, ctx: DrawerContext) {
    this.lineHeight = arg.lineHeight ?? currentFontSize(ctx);
    this.leading = arg.leading ?? 0;
    this.valignChunk = arg.valignChunk ?? "top";
  }
}

export function drawTextsInBoxes(ctx: DrawerContext, texts: string[], box: Box,
  writer: (t: string, b: Box) => void, optArg: DrawTextsInBoxesOptArg = {}) {
  const opt = new DrawTextsInBoxesOpt(optArg, ctx);
  let top = box.top;
  if (opt.valignChunk === "center" || opt.valignChunk === "bottom") {
    let totalHeight = opt.lineHeight * texts.length;
    if (opt.leading !== 0 && texts.length > 1) {
      totalHeight += opt.leading * (texts.length - 1);
    }
    if (opt.valignChunk === "center") {
      const rem = b.height(box) - totalHeight;
      top += rem * 0.5;
    } else if (opt.valignChunk === "bottom") {
      top = box.bottom - totalHeight;
    }
  }
  let bb = b.modify(box, b.setHeight(opt.lineHeight, "top"), b.setTop(top));
  texts.forEach(t => {
    writer(t, bb);
    bb = b.modify(bb, b.shiftDown(opt.lineHeight + opt.leading));
  })
}

export type DrawTextsOptArg = DrawTextsInBoxesOptArg & DrawTextOptionArg & {
  halign?: HAlign;
  valign?: VAlign;
  leading?: number;
}

class DrawTextsOpt extends DrawTextsInBoxesOpt {
  halign: HAlign;
  valign: VAlign;
  leading: number;

  constructor(arg: DrawTextsOptArg, ctx: DrawerContext) {
    super(arg, ctx);
    this.halign = arg.halign ?? "left";
    this.valign = arg.valign ?? "top";
    this.leading = arg.leading ?? 0;
  }
}

export function drawTexts(ctx: DrawerContext, texts: string[], box: Box, optArg: DrawTextsOptArg = {}) {
  const opt = new DrawTextsOpt(optArg, ctx);
  drawTextsInBoxes(ctx, texts, box,
    (tt, bb) => {
      drawText(ctx, tt, bb, opt.halign, opt.valign, optArg);
    },
    optArg);
}

export function drawTextTmpls(ctx: DrawerContext, texts: string[], box: Box,
  writer: (key: string) => CompositeItem[], optArg: DrawTextsOptArg = {}) {
  const opt = new DrawTextsOpt(optArg, ctx);
  drawTextsInBoxes(ctx, texts, box,
    (tt, bb) => {
      if (hasCompTmpl(tt)) {
        drawComposite(ctx, bb, parseCompTmpl(tt, writer), optArg);
      } else {
        drawText(ctx, tt, bb, opt.halign, opt.valign, optArg);
      }
    },
    optArg);
}

interface ParagraphOptArg {
  valign?: VAlign;
  leading?: number;
}

class ParagraphOpt {
  valign: VAlign;
  leading: number;

  constructor(arg: ParagraphOptArg) {
    this.valign = arg.valign ?? "top";
    this.leading = arg.leading ?? 0;
  }
}

export function paragraph(ctx: DrawerContext, content: string, box: Box, optArg: ParagraphOptArg = {}) {
  const texts: string[] = content.split("\n");
  let fontSize = currentFontSize(ctx);
  const lines: string[] = [];
  const w = b.width(box);
  texts.forEach(text => {
    const ls = breakLines(text, fontSize, w);
    lines.push(...ls);
  });
  drawTexts(ctx, lines, box, { valignChunk: optArg.valign, leading: optArg.leading });
}

export interface DrawTextAtOptArg {
  halign?: HAlign;
  valign?: VAlign;
  interCharsSpace?: number;
}

class DrawTextAtOpt {
  halign: HAlign;
  valign: VAlign;
  interCharsSpace: number;

  constructor(arg: DrawTextAtOptArg = {}) {
    this.halign = arg.halign ?? "left";
    this.valign = arg.valign ?? "top";
    this.interCharsSpace = arg.interCharsSpace ?? 0;
  }
}

export function drawTextAt(ctx: DrawerContext, text: string, x: number, y: number, optArg: DrawTextAtOptArg = {}) {
  const opt = new DrawTextAtOpt(optArg);
  const fontSize = fsm.getCurrentFontSize(ctx.fsm);
  let charWidths = stringToCharWidths(text, fontSize);
  if (opt.interCharsSpace !== 0) {
    charWidths = charWidths.map((cs, i) => {
      if (i !== charWidths.length - 1) {
        return cs + opt.interCharsSpace;
      } else {
        return cs;
      }
    })
  }
  const length = sumOfNumbers(charWidths);
  switch (opt.halign) {
    case "left": {
      // nop
      break;
    }
    case "center": {
      x = x - length / 2.0;
      break;
    }
    case "right": {
      x = x - length;
      break;
    }
  }
  switch(opt.valign) {
    case "top": {
      // nop
      break;
    }
    case "center": {
      y = y - fontSize / 2.0;
      break;
    }
    case "bottom": {
      y = y - fontSize;
      break;
    }
  }
  const xs: number[] = [];
  const ys: number[] = [];
  for (let i = 0; i < charWidths.length; i++) {
    xs.push(x);
    ys.push(y);
    x += charWidths[i];
  }
  drawChars(ctx, text, xs, ys);
}

export function rect(ctx: DrawerContext, box: Box) {
  moveTo(ctx, box.left, box.top);
  lineTo(ctx, box.right, box.top);
  lineTo(ctx, box.right, box.bottom);
  lineTo(ctx, box.left, box.bottom);
  lineTo(ctx, box.left, box.top);
}

export const frame: (ctx: DrawerContext, box: Box) => void = rect;

export function frameRight(ctx: DrawerContext, box: Box) {
  moveTo(ctx, box.right, box.top);
  lineTo(ctx, box.right, box.bottom);
}

export function frameLeft(ctx: DrawerContext, box: Box) {
  moveTo(ctx, box.left, box.top);
  lineTo(ctx, box.left, box.bottom);
}

export function frameTop(ctx: DrawerContext, box: Box) {
  moveTo(ctx, box.left, box.top);
  lineTo(ctx, box.right, box.top);
}

export function frameBottom(ctx: DrawerContext, box: Box) {
  moveTo(ctx, box.left, box.bottom);
  lineTo(ctx, box.right, box.bottom);
}

export function line(ctx: DrawerContext, ...points: [number, number][]) {
  const start = points.shift();
  if (!start) { return }
  moveTo(ctx, ...start);
  points.forEach(([x, y]) => lineTo(ctx, x, y));
}

export function frameInnerColumnBorders(ctx: DrawerContext, box: Box, splitter: Splitter) {
  splitter(b.width(box)).forEach(at => {
    moveTo(ctx, box.left + at, box.top);
    lineTo(ctx, box.left + at, box.bottom);
  })
}

export function frameInnerRowBorders(ctx: DrawerContext, box: Box, splitter: Splitter) {
  splitter(b.height(box)).forEach(at => {
    moveTo(ctx, box.left, box.top + at);
    lineTo(ctx, box.right, box.top + at);
  })
}

export function withGrid(ctx: DrawerContext, box: Box, rowSplitter: Splitter | number, colSplitter: Splitter | number,
  f: (cells: Box[][]) => void) {
  const rSplitter: Splitter = typeof rowSplitter === "number" ? b.evenSplitter(rowSplitter) : rowSplitter;
  const cSplitter: Splitter = typeof colSplitter === "number" ? b.evenSplitter(colSplitter) : colSplitter;
  rect(ctx, box);
  frameInnerRowBorders(ctx, box, rSplitter);
  frameInnerColumnBorders(ctx, box, cSplitter);
  const cells: Box[][] = [];
  b.withSplitRows(box, rSplitter, rows => {
    rows.forEach(row => {
      b.withSplitColumns(row, cSplitter, cols => {
        cells.push(cols);
      })
    })
  });
  f(cells);
}

export function textWidth(ctx: DrawerContext, text: string): number {
  return stringDrawWidth(text, fsm.getCurrentFontSize(ctx.fsm));
}

export function textWidthWithFont(ctx: DrawerContext, text: string, fontName: string): number {
  return stringDrawWidth(text, getFontSizeOf(ctx, fontName));
}

export interface CompositeText {
  kind: "text";
  text: string;
  mark?: string;
}

export interface CompositeGap {
  kind: "gap";
  width: number;
  mark?: string;
  modifiers?: Modifier[];
}

export interface CompositeGapTo {
  kind: "gap-to";
  at: number;
  mark?: string;
  modifiers?: Modifier[];
}

export interface TextByFont {
  kind: "text-by-font";
  text: string;
  fontName: string;
  dx?: number;
  dy?: number;
}

export type CompositeItem = CompositeText | CompositeGap | CompositeGapTo | TextByFont;

export interface DrawCompositeOptionArg {
  halign?: HAlign;
  valign?: VAlign;
}

class DrawCompositeOption {
  halign: HAlign;
  valign: VAlign;

  constructor(arg: DrawCompositeOptionArg) {
    this.halign = arg.halign ?? "left";
    this.valign = arg.valign ?? "center";
  }
}

export function compositeWidth(ctx: DrawerContext, comps: CompositeItem[]): number {
  let w = 0;
  for (let i = 0; i < comps.length; i++) {
    const comp = comps[i];
    switch (comp.kind) {
      case "text": {
        w += textWidth(ctx, comp.text);
        break;
      }
      case "gap": {
        w += comp.width;
        break;
      }
      case "text-by-font": {
        w += textWidthWithFont(ctx, comp.text, comp.fontName);
        break;
      }
      default: {
        throw new Error(`Cannot calculate width of composite: ${comp}`);
      }
    }
  }
  return w;
}

export function drawComposite(ctx: DrawerContext, box: Box, comps: CompositeItem[],
  optArg: DrawCompositeOptionArg = {}) {
  const opt = new DrawCompositeOption(optArg);
  switch (opt.halign) {
    case "center": {
      const cw = compositeWidth(ctx, comps);
      const extra = (b.width(box) - cw) / 2.0;
      box = b.modify(box, b.shrinkHoriz(extra, extra));
      break;
    }
    case "right": {
      const cw = compositeWidth(ctx, comps);
      const x = box.right - cw;
      box = b.modify(box, b.setLeft(x));
      break;
    }
  }
  let pos = 0;
  comps.forEach(item => {
    switch (item.kind) {
      case "text": {
        const textBox = b.modify(box, b.shift(pos, 0))
        drawText(ctx, item.text, textBox, "left", opt.valign);
        if( item.mark ){
          mark(ctx, item.mark, textBox);
        }
        pos += textWidth(ctx, item.text);
        break;
      }
      case "gap": {
        if (item.mark) {
          let mb = Object.assign({}, box, { left: box.left + pos, right: box.left + pos + item.width });
          if (item.modifiers) {
            mb = b.modify(mb, ...item.modifiers);
          }
          mark(ctx, item.mark, mb);
        }
        pos += item.width;
        break;
      }
      case "gap-to": {
        if (item.mark) {
          let mb = Object.assign({}, box, { left: box.left + pos, right: box.left + item.at });
          if (item.modifiers) {
            mb = b.modify(mb, ...item.modifiers);
          }
          mark(ctx, item.mark, mb);
        }
        pos = item.at;
        break;
      }
      case "text-by-font": {
        const fontSave = getCurrentFont(ctx);
        const dx = item.dx ?? 0;
        const dy = item.dy ?? 0;
        drawText(ctx, item.text, b.modify(box, b.shift(pos + dx, dy)), "left", opt.valign);
        pos += textWidthWithFont(ctx, item.text, item.fontName);
        setFont(ctx, fontSave);
        break;
      }
    }
  });
}

export function drawVertLines(ctx: DrawerContext, box: Box, splitter: Splitter) {
  splitter(b.width(box)).forEach(at => {
    moveTo(ctx, box.left + at, box.top);
    lineTo(ctx, box.left + at, box.bottom);
  });
}

export function withFont(ctx: DrawerContext, fontName: string, f: () => void) {
  const save = getCurrentFont(ctx);
  setFont(ctx, fontName);
  f();
  setFont(ctx, save);
}
