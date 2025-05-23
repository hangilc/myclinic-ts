import type { HAlign, VAlign } from "./align";
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

export function leftTop(box: Box): [number, number] {
  return [box.left, box.top];
}

export function rightTop(box: Box): [number, number] {
  return [box.right, box.top];
}

export function leftBottom(box: Box): [number, number] {
  return [box.left, box.bottom];
}

export function rightBottom(box: Box): [number, number] {
  return [box.right, box.bottom];
}

export function paperSizeToBox(paperSize: PaperSize, opt: { landscape?: boolean } = {}): Box {
  let box = { left: 0, top: 0, right: paperSize.width, bottom: paperSize.height };
  if (opt.landscape) {
    box = { left: 0, top: 0, right: box.bottom, bottom: box.right };
  }
  return box;
}

export function clone(box: Box): Box {
  return Object.assign({}, box);
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

export function shiftUp(dy: number): Modifier {
  return shift(0, -dy);
}

export function shiftToRight(dx: number): Modifier {
  return shift(dx, 0);
}

export function setLeft(left: number): Modifier {
  return box => Object.assign({}, box, { left, });
}

export function setRight(right: number): Modifier {
  return box => Object.assign({}, box, { right, });
}

export function setTop(top: number): Modifier {
  return box => Object.assign({}, box, { top });
}

export function setBottom(bottom: number): Modifier {
  return box => Object.assign({}, box, { bottom });
}

export function inset(dx: number, dy: number = dx, dx2: number = dx, dy2: number = dy): Modifier {
  return offset(dx, dy, -dx2, -dy2);
}

export function shrinkHoriz(shrinkLeft: number, shrinkRight: number): Modifier {
  return offset(shrinkLeft, 0, -shrinkRight, 0);
}

export function shrinkVert(shrinkTop: number, shrinkBottom: number): Modifier {
  return offset(0, shrinkTop, 0, -shrinkBottom);
}

export function setWidth(w: number, anchor: "left" | "center" | "right"): Modifier {
  return box => {
    switch (anchor) {
      case "left": return Object.assign({}, box, { right: box.left + w });
      case "center": return Object.assign({}, box, { left: cx(box) - w / 2.0, right: cx(box) + w / 2.0 });
      case "right": return Object.assign({}, box, { left: box.right - w })
    }
  }
}

export function setHeight(h: number, anchor: "top" | "center" | "bottom"): Modifier {
  return box => {
    switch (anchor) {
      case "top": return Object.assign({}, box, { bottom: box.top + h });
      case "center": return Object.assign({}, box, { top: cy(box) - h / 2.0, bottom: cy(box) + h / 2.0 });
      case "bottom": return Object.assign({}, box, { top: box.bottom - h });
    }
  }
}

export function innerBox(left: number, top: number, right: number, bottom: number): Modifier {
  return box => ({
    left: box.left + left,
    top: box.top + top,
    right: box.left + right,
    bottom: box.top + bottom,
  });
}

export function flipRight(): Modifier {
  return box => Object.assign({}, box, { left: box.right, right: box.left + width(box) })
}

export function flipLeft(): Modifier {
  return box => Object.assign({}, box, { left: box.left - width(box), right: box.left })
}

export function flipDown(): Modifier {
  return box => Object.assign({}, box, { top: box.bottom, bottom: box.bottom + height(box) })
}

export function flipUp(): Modifier {
  return box => Object.assign({}, box, { top: box.bottom - height(box), bottom: box.top })
}

export function alignHoriz(outerBox: Box, halign: HAlign): Modifier {
  return box => {
    let left: number;
    switch(halign){
      case "left": left = outerBox.left; break;
      case "center": left = cx(outerBox) - width(box) * 0.5; break;
      case "right": left = outerBox.right - width(box); break;
    }
    return mkBox(left, box.top, left + width(box), box.bottom);
  }
}

export function alignVert(outerBox: Box, valign: VAlign): Modifier {
  return box => {
    let top: number;
    switch(valign){
      case "top": top = outerBox.top; break;
      case "center": top = cy(outerBox) - height(box) * 0.5; break;
      case "bottom": top = outerBox.bottom - height(box); break;
    }
    return mkBox(box.left, top, box.right, top + height(box));
  }
}

export type Splitter = (ext: number) => number[];

export function splitAt(...at: number[]): Splitter {
  return (ext) => at.map(a => a >= 0 ? a : (ext + a));
}

export function evenSplitter(n: number): Splitter {
  return ext => {
    const at: number[] = [];
    for (let i = 1; i < n; i++) {
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

export function splitWidthsFromEnd(...widths: number[]): Splitter {
  return (ext: number) => {
    if( widths.length === 0 ){
      return [];
    } 
    const at: number[] = [];
    const sum = widths.reduce((acc, ele) => acc + ele, 0);
    let c = ext - sum;
    at.push(c);
    for(let i=0;i<widths.length-1;i++){
      c += widths[i];
      at.push(c);
    }
    return at;
  }
}

export const splitHeights: (...heights: number[]) => Splitter = splitWidths;

export function splitToColumns(box: Box, splitter: Splitter): Box[] {
  const at: number[] = splitter(width(box));
  const cols: Box[] = [];
  let left = box.left;
  for (let i = 0; i < at.length; i++) {
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
  for (let i = 0; i < at.length; i++) {
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

export function withSplitRows<T>(box: Box, splitter: Splitter, f: (rows: Box[]) => T,
  opt: Partial<{
    boxModifiers?: Modifier[],
    rowModifiers?: Modifier[],
  }> = {}
): T {
  if (opt.boxModifiers) {
    box = modify(box, ...opt.boxModifiers);
  }
  let rows = splitToRows(box, splitter);
  if (opt.rowModifiers) {
    const m = opt.rowModifiers;
    rows = rows.map(r => modify(r, ...m));
  }
  return f(rows);
}

export function combine(boxes: Box[]): Box {
  return {
    left: boxes[0].left,
    top: boxes[0].top,
    right: boxes[boxes.length - 1].right,
    bottom: boxes[boxes.length - 1].bottom,
  }
}

export function align(box: Box, outer: Box, halign: HAlign, valign: VAlign): Box {
  return modify(box, alignHoriz(outer, halign), alignVert(outer, valign));
}

export function aligned(wrapping: Box, width: number, height: number,
  halign: HAlign, valign: VAlign): Box {
    let b = mkBox(0, 0, width, height);
    return align(b, wrapping, halign, valign);
  }

export function withSlice(box: Box, size: number, f: (slice: Box) => void): Box {
  f(modify(box, setHeight(size, "top")));
  return modify(box, shrinkVert(size, 0));
}
