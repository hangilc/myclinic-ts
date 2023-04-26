import { OpCreateFont, OpDrawChars, OpLineTo, OpMoveTo, OpSetFont, type Op } from "../drawer/op";
import type { Box } from "./box";
import { charWidth } from "./char-width";
import { HorizAlign, VertAlign } from "./enums";

export class DrawerCompiler {
  ops: Op[] = [];
  fontSizeMap: Record<string, number> = { "": 4 };
  curFont: string = "";

  compile(): Op[] {
    return this.ops;
  }

  get curFontSize(): number {
    return this.fontSizeMap[this.curFont];
  }

  moveTo(x: number, y: number): void {
    this.ops.push(new OpMoveTo(x, y));
  }

  lineTo(x: number, y: number): void {
    this.ops.push(new OpLineTo(x, y));
  }

  createFont(
    name: string,
    fontName: string,
    size: number,
    weight: number = 0,
    italic: boolean = false
  ): void {
    this.ops.push(new OpCreateFont(name, fontName, size, weight, italic));
    this.fontSizeMap[name] = size;
  }

  setFont(name: string): void {
    if (this.curFont !== name) {
      this.ops.push(new OpSetFont(name));
      this.curFont = name;
    }
  }

  line(x1: number, y1: number, x2: number, y2: number): void {
    this.moveTo(x1, y1);
    this.lineTo(x2, y2);
  }

  rect(x1: number, y1: number, x2: number, y2: number): void {
    this.moveTo(x1, y1);
    this.lineTo(x2, y1);
    this.lineTo(x2, y2);
    this.lineTo(x1, y2);
    this.lineTo(x1, y1);
  }

  box(b: Box): void {
    this.rect(b.left, b.top, b.right, b.bottom);
  }

  text(b: Box, t: string, opt: TextOpt = {}): void {
    const chars: string[] = [];
    const xs: number[] = [];
    let left: number = 0;
    const fontSize = this.curFontSize;
    const elements: string[] = Array.from(t);
    const ws: number[] = elements.map(c => charWidth(c, fontSize));
    let ics: number = 0;
    if (opt.halign === HorizAlign.Justify && ws.length > 1) {
      ics = (b.width - ws.reduce((a, b) => a + b, 0)) / (ws.length - 1);
    } else if (opt.interCharsSpace !== undefined) {
      ics = opt.interCharsSpace;
    }
    elements.forEach((e, i) => {
      chars.push(e);
      if( i > 0 ){
        left += ics;
      }
      xs.push(left);
      left += ws[i];
    });
    console.log("xs", xs);
    let y: number;
    switch (opt.valign ?? VertAlign.Center) {
      case VertAlign.Center: y = b.top + (b.height - fontSize) / 2; break;
      case VertAlign.Bottom: y = b.bottom - fontSize; break;
      default: y = b.top; break;
    }
    let dx = b.left;
    switch (opt.halign ?? HorizAlign.Center) {
      case HorizAlign.Center: {
        dx += (b.width - left) / 2.0;
        break;
      }
      case HorizAlign.Right: {
        dx += (b.width - left);
        break;
      }
    }
    for(let i=0;i<xs.length;i++){
      xs[i] += dx;
    }
    this.ops.push(new OpDrawChars(chars.join(""), xs, [y]));
  }
}

export interface TextOpt {
  halign?: HorizAlign;
  valign?: VertAlign;
  interCharsSpace?: number;
}
