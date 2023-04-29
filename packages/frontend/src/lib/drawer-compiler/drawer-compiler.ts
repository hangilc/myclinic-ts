import { OpCreateFont, OpCreatePen, OpDrawChars, OpLineTo, OpMoveTo, OpSetFont, OpSetPen, OpSetTextColor, type Op } from "../drawer/op";
import { Box } from "./box";
import { charWidth } from "./char-width";
import { HorizAlign, VertAlign } from "./enums";
import { CharVariant, MarkVariant, SpaceVariant, type SpaceVariantOpt, type TextVariant } from "./text-variant";

export class DrawerCompiler {
  ops: Op[] = [];
  fontSizeMap: Record<string, number> = { "": 4 };
  curFont: string = "";
  marks: Record<string, Box> = {};

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
      if( !(name in this.fontSizeMap) ){
        throw new Error("Cannot find font: " + name);
      }
      this.curFont = name;
    }
  }

  setTextcolor(r: number, g: number, b: number): void {
    this.ops.push(new OpSetTextColor(r, g, b));
  }

  createPen(name: string, r: number, g: number, b: number, width: number, style: number[] = []): void {
    this.ops.push(new OpCreatePen(name, r, g, b, width, style));
  }

  setPen(name: string): void {
    this.ops.push(new OpSetPen(name));
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

  frame(b: Box): void {
    this.rect(b.left, b.top, b.right, b.bottom);
  }

  addMark(labelName: string, box: Box): void {
    this.marks[labelName] = box;
  }

  getMark(labelName: string): Box {
    const b = this.marks[labelName];
    if (!b) {
      throw new Error("Cannto find mark: " + labelName);
    } else {
      return b;
    }
  }

  marker(str: string, labelName: string): MarkVariant {
    return new MarkVariant(str, labelName);
  }

  space(spaceWidth: number, opt?: SpaceVariantOpt) {
    return new SpaceVariant(spaceWidth, opt);
  }

  textAt(x: number, y: number, t: string, opt: TextOpt = {}): void {
    const variants: TextVariant[] = Array.from(t).map(c => new CharVariant(c));
    const fontSize: number = this.curFontSize;
    let totalWidth: number = variants.map(v => v.getWidth(fontSize)).reduce((a, b) => a + b, 0);
    let ics: number = opt.interCharsSpace ?? 0;
    if (ics > 0) {
      totalWidth += ics * (variants.length - 1);
    }
    let y0: number = y;
    switch (opt.valign ?? VertAlign.Top) {
      case VertAlign.Center: {
        y0 = y - fontSize / 2.0;
        break;
      }
      case VertAlign.Bottom: {
        y0 = y - fontSize;
        break;
      }
    }
    let x0: number = x;
    switch (opt.halign ?? HorizAlign.Left) {
      case HorizAlign.Center: {
        x0 = x - totalWidth / 2.0;
        break;
      }
      case HorizAlign.Right: {
        x0 = x - totalWidth;
        break;
      }
    }
    const chars: string = variants.map(v => v.getChars()).join("");
    const xs: number[] = [];
    const ys: number[] = [];
    variants.forEach(v => {
      const [vxs, vys] = v.getLocations(x0, y0, fontSize, this);
      xs.push(...vxs);
      ys.push(...vys);
      x0 += v.getWidth(fontSize) + ics;
    });
    this.ops.push(new OpDrawChars(chars, xs, ys));
  }

  text(b: Box, ts: string | (string | TextVariant)[], opt: TextOpt = {}): Box {
    if (typeof ts === "string") {
      ts = [ts];
    }
    const variants: TextVariant[] = [];
    ts.forEach(t => {
      if (typeof t === "string") {
        for (let c of t) {
          variants.push(new CharVariant(c));
        }
      } else {
        variants.push(t);
      }
    });
    const fontSize: number = this.curFontSize;
    let totalWidth: number = variants.map(v => v.getWidth(fontSize)).reduce((a, b) => a + b, 0);
    let ics: number = 0;
    if (opt.halign === HorizAlign.Justify && variants.length >= 2) {
      ics = (b.width - totalWidth) / (variants.length - 1);
    } else if (opt.interCharsSpace !== undefined) {
      ics = opt.interCharsSpace;
    }
    if (ics > 0) {
      totalWidth += ics * (variants.length - 1);
    }
    let y0: number = b.top;
    switch (opt.valign ?? VertAlign.Top) {
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
    switch (opt.halign ?? HorizAlign.Left) {
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
    this.ops.push(new OpDrawChars(chars, xs, ys));
    return new Box(x0, y0, x0 + totalWidth, y0 + fontSize);
  }

  vertText(b: Box, t: string, opt: VertTextOpt = {}): void {
    if (t === "") {
      return;
    }
    const fontSize = this.curFontSize;
    const x = b.left + (b.width - fontSize) / 2.0;
    let totalHeight = t.length * fontSize;
    const ics = opt.interCharsSpace ?? 0;
    totalHeight += ics * (t.length - 1);
    let y = b.top + (b.height - totalHeight) / 2.0;
    for (let c of t) {
      this.ops.push(new OpDrawChars(c, [x], [y]));
      y += fontSize + ics;
    }
  }

  textLines(b: Box, ts: string[], opt: TextLinesOpt = {}): Box {
    if (ts.length === 0) {
      return b.setBottom(b.top);
    }
    const leading = opt.leading ?? 0;
    let rb = b;
    const fontSize = this.curFontSize;
    ts.forEach(t => {
      this.text(rb, t);
      rb = rb.shiftTopValue(fontSize + leading);
    })
    return rb.setTop(b.top).shiftBottomValue(-leading);
  }

  labelMarks(): void {
    this.createFont("_labelMark", "sans-serif", 3);
    this.setFont("_labelMark");
    this.createPen("_labelMark", 255, 0, 0, 0.2);
    this.setPen("_labelMark");
    this.setTextcolor(255, 0, 0);
    for (let m in this.marks) {
      const b = this.getMark(m);
      this.frame(b);
      this.text(b, m, { halign: HorizAlign.Left, valign: VertAlign.Top});
    }
  }
}

export interface TextOpt {
  halign?: HorizAlign;
  valign?: VertAlign;
  interCharsSpace?: number;
}

export interface VertTextOpt {
  interCharsSpace?: number;
}

export interface TextLinesOpt {
  leading?: number;
}
