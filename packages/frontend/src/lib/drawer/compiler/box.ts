import type { PaperSize } from "./paper-size";

export interface Box {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export function mkBox(left: number, top: number, right: number, bottom: number): Box {
  return { left, top, right, bottom };
}

export function width(box: Box): number {
  return box.right - box.left;
}

export function height(box: Box): number {
  return box.bottom - box.top;
}

export function cx(box: Box): number {
  return (box.left + box.right) / 2.0;
}

export function cy(box: Box): number {
  return (box.top + box.bottom) / 2.0;
}

export function paperSizeToBox(paperSize: PaperSize): Box {
  return { left: 0, top: 0, right: paperSize.width, bottom: paperSize.height };
}

export type Modifier = (src: Box) => Box;

export function modify(box: Box, ...modifiers: Modifier[]): Box {
  modifiers.forEach(m => {
    box = m(box);
  });
  return box;
}

export function offset(dx1: number, dy1: number, dx2: number, dy2: number): Modifier {
  return box => ({
    left: box.left + dx1,
    top: box.top + dy1,
    right: box.right + dx2,
    bottom: box.bottom + dy2,
  })
}

export function shift(dx: number, dy: number): Modifier {
  return offset(dx, dy, dx, dy);
}

export function shiftDown(dy: number): Modifier {
  return shift(0, dy);
}

export function setLeft(left: number): Modifier {
  return box => Object.assign({}, box, { left, });
}

export function setRight(right: number): Modifier {
  return box => Object.assign({}, box, { right, });
}

export function inset(dx: number, dy: number = dx): Modifier {
  return offset(dx, dy, -dx, -dy);
}

export function sliceTop(height: number): Modifier {
  return box => Object.assign({}, box, { bottom: box.top + height });
}

export function shrinkHoriz(shrinkLeft: number, shrinkRight: number): Modifier {
  return offset(shrinkLeft, 0, -shrinkRight, 0);
}

export function shrinkVert(shrinkTop: number, shrinkBottom: number): Modifier {
  return offset(0, shrinkTop, 0, -shrinkBottom);
}

export function setWidth(w: number, anchor: "left" | "center" | "right" ): Modifier {
  return box => {
    switch(anchor){
      case "left": return Object.assign({}, box, { right: box.left + w});
      case "center": return Object.assign({}, box, { left: cx(box) - w/2.0, right: cx(box) + w/2.0});
      case "right": return Object.assign({}, box, { left: box.right - w})
    }
  }
}

export type Splitter = (ext: number) => number[];

export function splitAt(...at: number[]): Splitter {
  return (_) => at;
}

export function evenSplitter(n: number): Splitter {
  return ext => {
    const at: number[] = [];
    for(let i=1;i<n;i++){
      at.push(ext * i / n);
    }
    return at;
  }
}

export function splitWidths(...widths: number[]): Splitter {
  return (_) => {
    const at: number[] = [];
    let c = 0;
    widths.forEach(w => {
      c += w;
      at.push(c);
    })
    return at;
  }
}

export function splitToColumns(box: Box, splitter: Splitter): Box[] {
  const at: number[] = splitter(width(box));
  const cols: Box[] = [];
  let left = box.left;
  for(let i=0;i<at.length;i++){
    const right = box.left + at[i];
    cols.push(Object.assign({}, box, { left, right }));
    left = right;
  }
  cols.push(Object.assign({}, box, { left, }));
  return cols;
}

export function splitToRows(box: Box, splitter: Splitter): Box[] {
  const at: number[] = splitter(height(box));
  const cols: Box[] = [];
  let top = box.top;
  for(let i=0;i<at.length;i++){
    const bottom = box.top + at[i];
    cols.push(Object.assign({}, box, { top, bottom }));
    top = bottom;
  }
  cols.push(Object.assign({}, box, { top, }));
  return cols;
}

export function withSplitColumns<T>(box: Box, splitter: Splitter, f: (cols: Box[]) => T): T {
  return f(splitToColumns(box, splitter));
}

export function withSplitRows<T>(box: Box, splitter: Splitter, f: (rows: Box[]) => T): T {
  return f(splitToRows(box, splitter));
}
