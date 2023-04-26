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
    let y: number;
    const fontSize = this.curFontSize;
    function calcTextWidth(): number {
      const ics = opt.interCharsSpace ?? 0;
      let w = 0;
      for(let c of t){
        if( w > 0 ){
          w += ics;
        }
        w += charWidth(c, fontSize);
      }
      return w;
    }
    function calcJustifyICS(): number {
      const len = t.length;
      if( len <= 1 ){
        return 0;
      } else {
        return (b.width - calcTextWidth()) / (len - 1);
      }
    }
    function resolveICS(): number {
      if( opt.halign === HorizAlign.Justify ){
        return calcJustifyICS();
      } else {
        return opt.interCharsSpace ?? 0;
      }
    }
    switch (opt.valign ?? VertAlign.Center) {
      case VertAlign.Top: y = b.top; break;
      case VertAlign.Center: y = b.top + (b.height - fontSize) / 2; break;
      case VertAlign.Bottom: y = b.bottom - fontSize; break;
    }
    let x: number;
    switch (opt.halign ?? HorizAlign.Center) {
      case HorizAlign.Left: x = b.left; break;
      case HorizAlign.Center: x = b.left + (b.width - calcTextWidth()) / 2; break;
      case HorizAlign.Right: x = b.right - calcTextWidth(); break;
      case HorizAlign.Justify: x = b.left; break;
    }
    let xs: number[] = [];
    const ics: number = resolveICS();
    for (let c of t) {
      xs.push(x);
      x += charWidth(c.codePointAt(0)!, fontSize) + ics;
    }
    this.ops.push(new OpDrawChars(t, xs, [y]));
  }
}

export interface TextOpt {
  halign?: HorizAlign;
  valign?: VertAlign;
  interCharsSpace?: number;
}
