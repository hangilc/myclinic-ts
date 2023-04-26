import type { insert } from "svelte/internal";

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

  insert(left: number, top: number | undefined, right: number | undefined, bottom: number | undefined): Box {
    if( top === undefined ){
      top = left;
    }
    if( right === undefined ){
      right = left;
    }
    if( bottom === undefined ){
      bottom = top;
    }
    return new Box(this.left + left, this.top + top, this.right - right, this.bottom - bottom);
  }

  splitToRowsAt(...ys: number[]): Box[] {
    const bs: Box[] = [];
    let top: number = this.top;
    ys.forEach(y => {
      const bot = top + y;
      bs.push(new Box(this.left, top, this.right, bot));
      top = bot;
    })
    bs.push(new Box(this.left, top, this.right, this.bottom ))
    return bs;
  }

  splitToColsAt(...xs: number[]): Box[] {
    const bs: Box[] = [];
    let left: number = this.left;
    xs.forEach(y => {
      const right = left + y;
      bs.push(new Box(left, this.top, right, this.bottom));
      left = right;
    })
    bs.push(new Box(left, this.top, this.right, this.bottom));
    return bs;
  }

  shrinkWidth(w: number, dir: HorizShrinkDirection = HorizShrinkDirection.Left): Box {
    switch(dir) {
      case HorizShrinkDirection.Left: {
        return new Box(this.left, this.top, this.left + w, this.bottom);
      }
      case HorizShrinkDirection.Center: {
        const left = (this.left + this.right) / 2 - w/2;
        const right = left + w;
        return new Box(left, this.top, right, this.bottom);
      }
      case HorizShrinkDirection.Right: {
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

enum HorizShrinkDirection { Left, Center, Right }
