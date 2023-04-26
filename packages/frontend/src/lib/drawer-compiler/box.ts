import type { insert } from "svelte/internal";
import { HorizDirection } from "./enums";

export class Box {
  left: number;
  top: number;
  right: number;
  bottom: number;

  constructor(left: number, top: number, right: number, bottom: number) {
    this.left = left;
    this.top = top;
    this.right = right;
    this.bottom = bottom;
  }

  get width(): number {
    return this.right - this.left;
  }

  get height(): number {
    return this.bottom - this.top;
  }

  inset(left: number, top?: number, right?: number, bottom?: number): Box {
    if (top === undefined) {
      top = left;
    }
    if (right === undefined) {
      right = left;
    }
    if (bottom === undefined) {
      bottom = top;
    }
    return new Box(this.left + left, this.top + top, this.right - right, this.bottom - bottom);
  }

  splitToRowsAt(...ys: number[]): Box[] {
    const bs: Box[] = [];
    const box = (top: number, bottom: number) =>
      bs.push(new Box(this.left, top, this.right, bottom));
    let top = this.top;
    ys.forEach(y => {
      const bottom = this.top + y;
      box(top, bottom);
      top = bottom;
    });
    box(top, this.bottom);
    return bs;
  }

  splitToRows(...hs: number[]): Box[] {
    const bs: Box[] = [];
    const box = (top: number, bottom: number) =>
      bs.push(new Box(this.left, top, this.right, bottom));
    let top = this.top;
    hs.forEach(h => {
      const bottom = top + h;
      box(top, bottom);
      top = bottom;
    });
    box(top, this.bottom);
    return bs;
  }

  splitToColsAt(...xs: number[]): Box[] {
    const bs: Box[] = [];
    const box = (left: number, right: number) =>
      bs.push(new Box(left, this.top, right, this.bottom));
    let left = this.left;
    xs.forEach(x => {
      const right = this.left + x;
      box(left, right);
      left = right;
    });
    box(left, this.right);
    return bs;
  }

  splitToCols(...ws: number[]): Box[] {
    const bs: Box[] = [];
    const box = (left: number, right: number) =>
      bs.push(new Box(left, this.top, right, this.bottom));
    let left = this.left;
    ws.forEach(w => {
      const right = left + w;
      box(left, right);
      left = right;
    });
    box(left, this.right);
    return bs;
  }

  shrinkWidth(w: number, dir: HorizDirection = HorizDirection.Left): Box {
    switch (dir) {
      case HorizDirection.Left: {
        return new Box(this.left, this.top, this.left + w, this.bottom);
      }
      case HorizDirection.Center: {
        const left = (this.left + this.right) / 2 - w / 2;
        const right = left + w;
        return new Box(left, this.top, right, this.bottom);
      }
      case HorizDirection.Right: {
        return new Box(this.right - w, this.top, this.right, this.bottom);
      }
    }
  }

  static fromPaperSize(size: [number, number]): Box {
    const [w, h] = size;
    return new Box(0, 0, w, h);
  }

  static combineRows(rows: Box[]): Box {
    const first = rows[0];
    return new Box(first.left, first.top, first.right, rows[rows.length - 1].bottom);
  }
}


