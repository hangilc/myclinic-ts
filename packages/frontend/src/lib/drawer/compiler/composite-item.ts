import type { CompositeBox, CompositeGap, CompositeGapTo, CompositeText, TextByFont } from "./compiler";

export function text(text: string, opt: Partial<CompositeText> = {}): CompositeText {
  return Object.assign({
    kind: "text",
    text,
  }, opt);
}

export function gap(width: number, opt: Partial<CompositeGap>= {}): CompositeGap {
  return Object.assign({
    kind: "gap",
    width,
  }, opt)

}

export function gapTo(at: number, opt: Partial<CompositeGapTo> = {}): CompositeGapTo {
  return Object.assign({
    kind: "gap-to",
    at
  }, opt)
}

export function textByFont(text: string, fontName: string, opt: Partial<TextByFont> = {}): TextByFont {
  return Object.assign({
    kind: "text-by-font",
    text,
    fontName,
  }, opt)
}

export function box(opt: Partial<CompositeBox> = {}): CompositeBox {
  return Object.assign({
    kind: "box",
  }, opt);
}