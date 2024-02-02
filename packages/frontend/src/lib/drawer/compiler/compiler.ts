import type { DrawerContext } from "./context";
import { FontWeightBold, FontWeightNormal } from "./font-weight";
import type { Op } from "./op";

export function getOps(ctx: DrawerContext): Op[] {
  return ctx.ops;
}

export function moveTo(ctx: DrawerContext, x: number, y: number) {
  ctx.ops.push(["move_to", x, y]);
}

export function lineTo(ctx: DrawerContext, x: number, y: number) {
  ctx.ops.push(["line_to", x, y]);
}

export function createFont(
  ctx: DrawerContext, name: string, fontName: string, size: number,
  weight: number | "bold" = FontWeightNormal, italic: boolean = false) {
  function resolveWeight(): number {
    if (weight === "bold") {
      return FontWeightBold;
    } else {
      return weight;
    }
  }
  ctx.ops.push(["create_font", name, fontName, size, resolveWeight(), italic]);
}

export function setFont(ctx: DrawerContext, name: string) {
  ctx.ops.push(["set_font", name]);
}

export function setTextColor(ctx: DrawerContext, r: number, g: number, b: number) {
  ctx.ops.push(["set_text_color", r, g, b]);
}

export function drawChars(ctx: DrawerContext, str: string, xs: number[], ys: number[]) {
  ctx.ops.push(["draw_chars", str, xs, ys]);
}

export type OpCreatePen = ["create_pen", name: string, r: number, g: number, b: number, width: number, penStyle: number[]];

export function createPen(ctx: DrawerContext, name: string, r: number, g: number, b: number,
  width: number, penStyle: number[] = []) {
    ctx.ops.push(["create_pen", name, r, g, b, width, penStyle])
}

