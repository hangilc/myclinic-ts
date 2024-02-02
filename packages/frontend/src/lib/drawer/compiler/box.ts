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