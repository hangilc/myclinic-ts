import { OpDrawChars } from "../drawer/op";
import { Box } from "./box";
import { charWidth, textWidth } from "./char-width";
import type { DrawerCompiler } from "./drawer-compiler";

export interface TextVariant {
  getWidth(c: DrawerCompiler): number;
  render(x0: number, y0: number, c: DrawerCompiler): void;
}

export class StrVariant implements TextVariant {
  str: string;
  opt: StrVariantOpt;

  constructor(str: string, opt: StrVariantOpt = {}) {
    this.str = str;
    this.opt = opt;
  }

  getWidth(c: DrawerCompiler): number {
    let fontSize: number;
    if (this.opt.font) {
      fontSize = c.fontSizeMap[this.opt.font];
    } else {
      fontSize = c.curFontSize;
    }
    return charWidth(this.str, fontSize) + (this.opt.padLeft ?? 0) + (this.opt.padRight ?? 0);
  }

  render(x0: number, y0: number, c: DrawerCompiler): void {
    let prevFont: string | undefined = undefined;
    if( this.opt.font ){
      prevFont = c.curFont;
      c.setFont(this.opt.font);
    }
    c.ops.push(new OpDrawChars(this.str, [x0 + (this.opt.padLeft ?? 0)], [y0 + (this.opt.dy ?? 0)]));
    if( prevFont ){
      c.setFont(prevFont);
    }
  }
}

export interface StrVariantOpt {
  font?: string;
  dy?: number;
  padLeft?: number;
  padRight?: number;
}

export class MarkVariant implements TextVariant {
  str: string;
  labelName: string;

  constructor(str: string, labelName: string) {
    this.str = str;
    this.labelName = labelName;
  }

  getWidth(c: DrawerCompiler): number {
    return textWidth(this.str, c.curFontSize);
  }

  render(x0: number, y0: number, c: DrawerCompiler): void {
    const fontSize = c.curFontSize;
    const xs: number[] = [];
    const ys: number[] = [];
    let x = x0;
    for (let c of this.str) {
      xs.push(x);
      ys.push(y0);
      x += charWidth(c, fontSize);
    }
    const b = new Box(x0, y0, x0 + this.getWidth(c), y0 + fontSize);
    c.addMark(this.labelName, b);
  }
}

export interface SpaceVariantOpt {
  mark?: string;
  height?: number;
}

export class SpaceVariant implements TextVariant {
  spaceWidth: number;
  opt: SpaceVariantOpt;

  constructor(spaceWidth: number, opt: SpaceVariantOpt = {}) {
    this.spaceWidth = spaceWidth;
    this.opt = opt;
  }

  getWidth(): number {
    return this.spaceWidth;
  }

  render(x0: number, y0: number, c: DrawerCompiler): void {
    if (this.opt.mark) {
      const mark: string = this.opt.mark;
      const height = this.opt.height ?? c.curFontSize;
      const b = new Box(x0, y0, x0 + this.spaceWidth, y0 + height);
      c.addMark(mark, b);
    }
  }
}

