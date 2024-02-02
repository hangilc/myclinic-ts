import type { PaperSize } from "./paper-size";

export interface Box {
  left: number;
  top: number;
  right: number;
  bottom: number;
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

export function shift(dx: number, dy: number): Modifier {
  return box => ({
    left: box.left + dx,
    top: box.top + dy,
    right: box.right + dx,
    bottom: box.bottom + dy
  });
}

export function shiftDown(dy: number): Modifier {
  return shift(0, dy);
}

export function setLeft(left: number): Modifier {
  return box => ({
    left: left,
    top: box.top,
    right: box.right,
    bottom: box.bottom,
  })
}

export function setRight(right: number): Modifier {
  return box => ({
    left: box.left,
    top: box.top,
    right,
    bottom: box.bottom
  });
}

export function inset(dx: number, dy: number = dx): Modifier {
  return box => ({
    left: box.left + dx,
    top: box.top + dy,
    right : box.right - dx,
    bottom: box.bottom - dy,
  })
}

export function sliceTop(height: number): Modifier {
  return box => ({
    left: box.left,
    top: box.top,
    right: box.right,
    bottom: box.top + height,
  })
}

export function shrinkHoriz(shrinkLeft: number, shrinkRight: number): Modifier {
  return box => ({
    left: box.left + shrinkLeft,
    top: box.top,
    right: box.right - shrinkRight,
    bottom: box.bottom,
  })
}

export function splitToColumns(box: Box, ...at: number[]): Box[] {
  const cols: Box[] = [];
  let left = box.left;
  for(let i=0;i<at.length;i++){
    const right = box.left + at[i];
    cols.push({
      left, top: box.top, right, bottom: box.bottom
    });
    left = right;
  }
  return cols;
}

export function divideToRows(box: Box, nrow: number): Box[] {
  const at: number[] = [];
  const w = width(box);
  for(let i=1;i<nrow;i++){
    at.push(w * i / nrow);
  }
  return splitToColumns(box, ...at);
}
