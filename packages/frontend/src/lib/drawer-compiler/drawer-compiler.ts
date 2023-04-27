import { OpCreateFont, OpDrawChars, OpLineTo, OpMoveTo, OpSetFont, type Op } from "../drawer/op";
import type { Box } from "./box";
import { charWidth } from "./char-width";
import { HorizAlign, VertAlign } from "./enums";
import { CharVariant, MarkVariant, type TextVariant } from "./text-variant";

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

  marker(str: string, labelName: string): MarkVariant {
    return new MarkVariant(str, labelName);
  }

  text(b: Box, ts: string | (string | TextVariant)[], opt: TextOpt = {}): void {
    if( typeof ts === "string" ){
      ts = [ts];
    }
    const variants: TextVariant[] = [];
    ts.forEach(t => {
      if( typeof t === "string" ){
        for(let c of t){
          variants.push(new CharVariant(c));
        }
      } else {
        variants.push(t);
      }
    });
    const fontSize: number = this.curFontSize;
    let totalWidth: number = variants.map(v => v.getWidth(fontSize)).reduce((a, b) => a + b, 0);
    let ics: number = 0;
    if( opt.halign === HorizAlign.Justify && variants.length >= 2 ){
      ics = (b.width -totalWidth) / (variants.length - 1);
    } else if( opt.interCharsSpace !== undefined ){
      ics = opt.interCharsSpace;
    }
    if( ics > 0 ){
      totalWidth += ics * (variants.length - 1);
    }
    let y0: number = b.top;
    switch(opt.valign ?? VertAlign.Center) {
      case VertAlign.Center: {
        y0 = b.top + (b.height - fontSize) / 2.0;
        break;
      }
      case VertAlign.Bottom: {
        y0 = b.bottom - fontSize;
        break;
      }
    }
    let x0: number = b.left;
    switch(opt.halign ?? HorizAlign.Center) {
      case HorizAlign.Center: {
        x0 = b.left + (b.width - totalWidth) / 2.0;
        break;
      }
      case HorizAlign.Right: {
        x0 = b.right - totalWidth;
        break;
      }
    }
    let x = x0;
    const chars: string = variants.map(v => v.getChars()).join("");
    const xs: number[] = [];
    const ys: number[] = [];
    variants.forEach(v => {
      const [vxs, vys] = v.getLocations(x, y0, fontSize, this);
      xs.push(...vxs);
      ys.push(...vys);
      x += v.getWidth(fontSize) + ics;
    });
    console.log("ys", ys);
    this.ops.push(new OpDrawChars(chars, xs, ys));
  }
}

export interface TextOpt {
  halign?: HorizAlign;
  valign?: VertAlign;
  interCharsSpace?: number;
}
