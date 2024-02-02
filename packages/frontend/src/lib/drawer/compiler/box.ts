import type { PaperSize } from "./paper-size";

export interface Box {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export function widthOf(box: Box): number {
  return box.right - box.left;
}

export function heightOf(box: Box): number {
  return box.bottom - box.top;
}

export function paperSizeToBox(paperSize: PaperSize): Box {
  return { left: 0, top: 0, right: paperSize.width, bottom: paperSize.height };
}

export function inset(box: Box, dx: number, dy: number = dx): Box {
  return { left: box.left + dx, top: box.top + dy, right: box.right - dx, bottom: box.bottom - dy };
}