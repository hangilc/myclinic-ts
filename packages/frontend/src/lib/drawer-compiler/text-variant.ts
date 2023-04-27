import { charWidth } from "./char-width";
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
