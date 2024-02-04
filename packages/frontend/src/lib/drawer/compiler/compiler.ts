import type { DrawerContext } from "./context";
import { FontWeightBold, FontWeightNormal } from "./font-weight";
import type { Op } from "./op";
import * as fsm from "./font-size-manager";
import * as b from "./box";
import type { Box, Splitter } from "./box";
import type { HAlign, VAlign } from "./align";
import { stringToCharWidths } from "./char-width";
import { sumOfNumbers } from "./util";

export function getOps(ctx: DrawerContext): Op[] {
  return ctx.ops;
}

export function moveTo(ctx: DrawerContext, x: number, y: number) {
  ctx.ops.push(["move_to", x, y]);
}

export function lineTo(ctx: DrawerContext, x: number, y: number) {
  ctx.ops.push(["line_to", x, y]);
}

export function createFont(
  ctx: DrawerContext, name: string, fontName: string, size: number,
  weight: number | "bold" = FontWeightNormal, italic: boolean = false) {
  function resolveWeight(): number {
    if (weight === "bold") {
      return FontWeightBold;
    } else {
      return weight;
    }
  }
  ctx.ops.push(["create_font", name, fontName, size, resolveWeight(), italic]);
  fsm.registerFontSize(ctx.fsm, name, size);
}

export function setFont(ctx: DrawerContext, name: string) {
  ctx.ops.push(["set_font", name]);
  fsm.setFont(ctx.fsm, name);
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

export function mark(ctx: DrawerContext, key: string, box: Box) {
  ctx.marks[key] = box;
}

function locateY(box: Box, fontSize: number,  valign: VAlign) {
  switch(valign){
    case "top": return box.top;
    case "center": return b.cy(box) - fontSize / 2.0;
    case "bottom": return box.bottom - fontSize;
    default: throw new Error(`unknown valign: ${valign}`)
  }
}

function locateX(box: Box, fontSize: number, halign: HAlign) {
  switch(halign){
    case "left": return box.left;
    case "center": return b.cx(box) - fontSize / 2.0;
    case "right": return box.right - fontSize;
    default: throw new Error("`unknown halign: ${halign}");
  }
}

export function drawTextJustified(ctx: DrawerContext, text: string, box: Box, valign: VAlign) {
  const fontSize = fsm.getCurrentFontSize(ctx.fsm);
  const charWidths  = stringToCharWidths(text, fontSize);
  const y = locateY(box, fontSize, valign);
  if( charWidths.length === 0 ){
    return;
  } else if( charWidths.length === 1 ){
    drawChars(ctx, text, [box.left], [y]);
    return;
  }
  const length = sumOfNumbers(charWidths);
  const remain = b.width(box) - length;
  const gap = remain / (charWidths.length - 1);
  let x = box.left;
  let xs: number[] = [];
  let ys: number[] = [];
  for(let i=0;i<charWidths.length;i++){
    if( i > 0 ){
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
  if( text.length === 0 ){
    return;
  } else if( text.length === 1 ){
    drawChars(ctx, text, [x], [box.top]);
    return;
  }
  const length = text.length * fontSize;
  const remain = b.height(box) - length;
  const gap = remain / (text.length - 1);
  let y = box.top;
  const xs: number[] = [];
  const ys: number[] = [];
  for(let i=0;i<text.length;i++){
    if( i > 0 ){
      y += gap;
    }
    xs.push(x);
    ys.push(y);
    y += fontSize;
  }
  drawChars(ctx, text, xs, ys);
}

export function drawText(ctx: DrawerContext, text: string, box: Box, halign: HAlign, valign: VAlign) {
  const fontSize = fsm.getCurrentFontSize(ctx.fsm);
  const charWidths  = stringToCharWidths(text, fontSize);
  const length = sumOfNumbers(charWidths);
  const y = locateY(box, fontSize, valign);
  let x: number;
  switch(halign){
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
  for(let i=0;i<charWidths.length;i++){
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

export function frameInnerColumnBorders(ctx: DrawerContext, box: Box, splitter: Splitter) {
  splitter(b.width(box)).forEach(at => {
    moveTo(ctx, box.left + at, box.top);
    lineTo(ctx, box.left + at, box.bottom);
  })
}

export function textWidth(ctx: DrawerContext, text: string): number {
  const fontSize = fsm.getCurrentFontSize(ctx.fsm);
  const charWidths  = stringToCharWidths(text, fontSize);
  return sumOfNumbers(charWidths);
}

export interface CompositeMarkTo {
  kind: "mark-to";
  at: number;
}

export interface CompositeText {
  kind: "text";
  text: string;
}

export interface CompositeGap {
  kind: "gap";
  width: number;
}

export type CompositeItem = CompositeMarkTo | CompositeText | CompositeGap;

export function drawComposite(ctx: DrawerContext, box: Box, comps: CompositeItem[]): Box[] {
  let pos = 0;
  let marks: Box[] = [];
  comps.forEach(item => {
    switch(item.kind) {
      case "mark-to": {
        marks.push(Object.assign({}, box, { left: box.left + pos, right: box.left + item.at }));
        pos = item.at;
          break;
      }
      case "text": {
        drawText(ctx, item.text, b.modify(box, b.inset(pos, 0)), "left", "center");
        pos += textWidth(ctx, item.text);
        break;
      }
      case "gap": {
        pos += item.width;
        break;
      }
    }
  });
  return marks;
}

export function drawVertLines(ctx: DrawerContext, box: Box, splitter: Splitter) {
  splitter(b.width(box)).forEach(at => {
    moveTo(ctx, box.left + at, box.top);
    lineTo(ctx, box.left + at, box.bottom);
  });
}
