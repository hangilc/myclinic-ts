import { OpCreateFont, OpCreatePen, OpDrawChars, OpLineTo, OpMoveTo, OpSetFont, OpSetPen, OpSetTextColor, type Op } from "../drawer/op";
import { Box } from "./box";
import { breakLine } from "./break-line";
import { charWidth } from "./char-width";
import { HorizAlign, VertAlign, VertDirection } from "./enums";
import { StrVariant, MarkVariant, SpaceVariant, type SpaceVariantOpt, type TextVariant, type StrVariantOpt } from "./text-variant";

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

  setFont(name: string): string {
    const save = this.curFont;
    if (this.curFont !== name) {
      this.ops.push(new OpSetFont(name));
      if( !(name in this.fontSizeMap) ){
        throw new Error("Cannot find font: " + name);
      }
      this.curFont = name;
    }
    return save;
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
      throw new Error("Cannot find mark: " + labelName);
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

  str(str: string, opt: StrVariantOpt) {
    return new StrVariant(str, opt);
  }

  textAt(x: number, y: number, t: string, opt: TextOpt = {}): void {
    const variants: TextVariant[] = Array.from(t).map(c => new StrVariant(c));
    const fontSize: number = this.curFontSize;
    let totalWidth: number = variants.map(v => v.getWidth(this)).reduce((a, b) => a + b, 0);
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
    variants.forEach(v => {
      v.render(x0, y0, this);
      x0 += v.getWidth(this) + ics;
    });
  }

  text(b: Box, ts: string | (string | TextVariant)[], opt: TextOpt = {}): Box {
    if (typeof ts === "string") {
      ts = [ts];
    }
    const variants: TextVariant[] = [];
    ts.forEach(t => {
      if (typeof t === "string") {
        for (let c of t) {
          variants.push(new StrVariant(c));
        }
      } else {
        variants.push(t);
      }
    });
    const fontSize: number = this.curFontSize;
    let totalWidth: number = variants.map(v => v.getWidth(this)).reduce((a, b) => a + b, 0);
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
    y0 += opt.dy ?? 0;
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
    variants.forEach(v => {
      v.render(x, y0, this);
      x += v.getWidth(this) + ics;
    });
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

  textAndAdvance(b: Box, ts: string | (string | TextVariant)[], opt: TextOpt = {}): Box {
    const tb = this.text(b, ts, opt);
    return b.setLeft(tb.right);
  }

  paragraph(b: Box, s: string): Box {
    let y = b.top;
    let x = b.left;
    const fontSize = this.curFontSize;
    const lines = breakLine(s, fontSize, b.width);
    let lb = b.setHeight(fontSize, VertDirection.Top);
    for(let line of lines) {
      this.text(lb, line, { halign: HorizAlign.Left, valign: VertAlign.Top });
      lb = lb.flipBottom();
    }
    return b.setBottom(lb.bottom);
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
  dy?: number;
}

export interface VertTextOpt {
  interCharsSpace?: number;
}

export interface TextLinesOpt {
  leading?: number;
}
