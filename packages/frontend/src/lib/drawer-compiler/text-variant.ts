import type { construct_svelte_component } from "svelte/internal";
import { Box } from "./box";
import { charWidth, textWidth } from "./char-width";
import type { DrawerCompiler } from "./drawer-compiler";

export interface TextVariant {
  getWidth(fontSize: number): number;
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

  getLocations(x0: number, y0: number, _fontSize: number, _c: DrawerCompiler): [number[], number[]] {
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
