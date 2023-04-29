import { OpDrawChars } from "../drawer/op";
import type { DrawerCompiler } from "./drawer-compiler";

export abstract class TextBlock {
  font: string;
  chars: string;
  width: number;

  constructor(font: string, chars: string, xs: number[], ys: number[], width: number) {
    this.font = font;
    this.chars = chars;
    this.xs = xs;
    this.ys = ys;
    this.width = width;
  }

  render(x0: number, y0: number, c: DrawerCompiler): void {
    c.setFont(this.font);
    c.ops.push(new OpDrawChars(this.chars, this.xs, this.ys));
  }
}

