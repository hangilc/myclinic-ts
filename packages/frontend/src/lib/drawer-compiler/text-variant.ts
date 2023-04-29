import type { construct_svelte_component } from "svelte/internal";
import { Box } from "./box";
import { charWidth, textWidth } from "./char-width";
import type { DrawerCompiler } from "./drawer-compiler";

export interface TextVariant {
  getWidth(fontSize: number, c: DrawerCompiler): number;
  getChars(): string;
  getLocations(x0: number, y0: number, fontSize: number, c: DrawerCompiler): [number[], number[]];
}

export class CharVariant implements TextVariant {
  chr: string;

  constructor(chr: string) {
    this.chr = chr;
  }

  getWidth(fontSize: number): number {
    return charWidth(this.chr, fontSize);
  }

  getChars(): string {
    return this.chr;
  }

  getLocations(x0: number, y0: number): [number[], number[]] {
    return [[x0], [y0]];
  }
}

export class MarkVariant implements TextVariant {
  str: string;
  labelName: string;

  constructor(str: string, labelName: string) {
    this.str = str;
    this.labelName = labelName;
  }

  getWidth(fontSize: number): number {
    return  textWidth(this.str, fontSize);
  }

  getChars(): string {
    return this.str;
  }

  getLocations(x0: number, y0: number, fontSize: number, c: DrawerCompiler): [number[], number[]] {
    const b = new Box(x0, y0, x0 + this.getWidth(fontSize), y0 + fontSize);
    const xs: number[] = [];
    const ys: number[] = [];
    let x = x0;
    for(let c of this.str) {
      xs.push(x);
      ys.push(y0);
      x += charWidth(c, fontSize);
    }
    return [xs, ys];
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

  getChars(): string {
    return "";
  }

  getLocations(x0: number, y0: number, fontSize: number, c: DrawerCompiler): [number[], number[]] {
    if( this.opt.mark ) {
      const mark: string = this.opt.mark;
      const height = this.opt.height ?? fontSize;
      const b = new Box(x0, y0, x0 + this.spaceWidth, y0 + height);
      c.addMark(mark, b);
    }
    return [[], []];
  }
}

export class SuperVariant implements TextVariant {
  text: string;
  font: string;

  constructor(text: string, font: string) {
    this.text = text;
    this.font = font;
  }

  getWidth(_fontSize: number, c: DrawerCompiler): number {
    const size = c.fontSizeMap[this.font];
    return textWidth(this.text, size);
  }

  getChars(): string {
    return this.text;
  }

  getLocations(x0: number, y0: number, fontSize: number, c: DrawerCompiler): [number[], number[]] {
    
  }
}

