import { OpCreateFont, OpLineTo, OpMoveTo, OpSetFont, type Op } from "../drawer/op";
import type { Box } from "./box";

export class DrawerCompiler {
  ops: Op[] = [];

  compile(): Op[] {
    return this.ops;
  }

  opMoveTo(x: number, y: number): void {
    this.ops.push(new OpMoveTo(x, y));
  }

  opLineTo(x: number, y: number): void {
    this.ops.push(new OpLineTo(x, y));
  }

  opCreateFont(name: string, fontName: string, size: number, weight: number = 0, italic: boolean = false): void {
    this.ops.push(new OpCreateFont(name, fontName, size, weight, italic));
  }

  opSetFont(name: string): void {
    this.ops.push(new OpSetFont(name));
  }

  line(x1: number, y1: number, x2: number, y2: number): void {
    this.opMoveTo(x1, y1);
    this.opLineTo(x2, y2);
  }

  rect(x1: number, y1: number, x2: number, y2: number): void {
    this.opMoveTo(x1, y1);
    this.opLineTo(x2, y1);
    this.opLineTo(x2, y2);
    this.opLineTo(x1, y2);
    this.opLineTo(x1, y1);
  }

  box(b: Box): void {
    this.rect(b.left, b.top, b.right, b.bottom);
  }
}
