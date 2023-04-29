import type { insert } from "svelte/internal";
import { HorizDirection, VertDirection } from "./enums";

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

  get cx(): number {
    return (this.left + this.right) / 2.0;
  }

  get cy(): number {
    return (this.top + this.bottom) / 2.0;
  }

  shift(dx: number, dy: number): Box {
    return new Box(this.left + dx, this.top + dy, this.right + dx, this.bottom + dy);
  }

  shiftLeftValue(dx: number): Box {
    return new Box(this.left + dx, this.top, this.right, this.bottom);
  }

  shiftTopValue(dy: number): Box {
    return new Box(this.left, this.top + dy, this.right, this.bottom);
  }

  shiftRightValue(dx: number): Box {
    return new Box(this.left, this.top, this.right + dx, this.bottom);
  }

  shiftBottomValue(dy: number): Box {
    return new Box(this.left, this.top, this.right, this.bottom + dy);
  }

  setLeft(left: number): Box {
    return new Box(left, this.top, this.right, this.bottom);
  }

  setTop(top: number): Box {
    return new Box(this.left, top, this.right, this.bottom);
  }

  setRight(right: number): Box {
    return new Box(this.left, this.top, right, this.bottom);
  }

  setBottom(bottom: number): Box {
    return new Box(this.left, this.top, this.right, bottom);
  }

  setWidth(width: number, dir: HorizDirection = HorizDirection.Left): Box {
    switch (dir) {
      case HorizDirection.Left: {
        return new Box(this.left, this.top, this.left + width, this.bottom);
      }
      case HorizDirection.Center: {
        return new Box(this.cx - width / 2, this.top, this.cx + width / 2, this.bottom);
      }
      case HorizDirection.Right: {
        return new Box(this.right - width, this.top, this.right, this.bottom);
      }
    }
  }

  setHeight(height: number, dir: VertDirection = VertDirection.Top): Box {
    switch(dir) {
      case VertDirection.Top: {
        return new Box(this.left, this.top, this.right, this.top + height);
      }
      case VertDirection.Center: {
        return new Box(this.left, this.cy - height / 2.0, this.right, this.cy + height / 2.0);
      }
      case VertDirection.Bottom: {
        return new Box(this.left, this.bottom - height, this.right, this.bottom);
      }
    }
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

  splitToEvenRows(n: number): Box[] {
    const h = this.height / n;
    const boxes: Box[] = [];
    for (let i = 0; i < n; i++) {
      const b = new Box(
        this.left,
        this.top + h * i,
        this.right,
        i === (n - 1) ? this.bottom : this.top + h * (i + 1)
      );
      boxes.push(b);
    }
    return boxes;
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

  splitToEvenCols(n: number): Box[] {
    const w = this.width / n;
    const boxes: Box[] = [];
    for (let i = 0; i < n; i++) {
      const b = new Box(
        this.left + w * i,
        this.top,
        this.left + w * (i + 1),
        this.bottom
      );
      boxes.push(b);
    }
    return boxes;
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

  shrinkToRight(dx: number): Box {
    return this.shiftLeftValue(dx);
  }

  flipRight(): Box {
    return new Box(this.right, this.top, this.right + this.width, this.bottom);
  }

  flipBottom(): Box {
    return new Box(this.left, this.bottom, this.right, this.bottom + this.height);
  }

  leftBottom(): [number, number] {
    return [this.left, this.bottom];
  }

  rightTop(): [number, number] {
    return [this.right, this.top];
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


