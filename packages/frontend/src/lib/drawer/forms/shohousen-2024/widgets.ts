import type { Block } from "../../compiler/render";
import * as c from "../../compiler/compiler";
import * as b from "../../compiler/box";
import * as r from "../../compiler/render";
import type { DrawerContext } from "../../compiler/context";
import type { Box } from "../../compiler/box";
import type { VAlign } from "../../compiler/align";

export function expander(text?: string): r.LineItemSpec {
  return r.textBlock(text, { kind: "expand" }, { halign: "center", valign: "center" });
}

export function justifiedText(ctx: DrawerContext, text: string, box: Box, opt?: {
  font?: string
}): Block {
  const specs: r.LineItemSpec[] = [];
  for(let i=0;i<text.length;i++){
    if( i !== 0 ){
      specs.push(expander());
    }
    const c = text.charAt(i);
    specs.push(r.textBlock(c, undefined, { font: opt?.font }));
  }
  return r.line(ctx, specs, { maxWidth: b.width(box)});
}

export function gap(size: number, text?: string): r.LineItemSpec {
  return r.textBlock(text, { kind: "fixed", value: size }, { halign: "center", valign: "center" })
}

export function text(text: string): r.LineItemSpec {
  return r.textBlock(text, undefined, { valign: "center" });
}

export function drawLeftSquareBracket(ctx: DrawerContext, box: Box) {
  box = b.modify(box, b.shrinkHoriz(b.width(box) * 0.5, 0));
  c.withPen(ctx, "thin", () => {
    c.frameTop(ctx, box);
    c.frameLeft(ctx, box);
    c.frameBottom(ctx, box);
  });
}

export function drawRightSquareBracket(ctx: DrawerContext, box: Box) {
  box = b.modify(box, b.shrinkHoriz(0, b.width(box) * 0.5));
  c.withPen(ctx, "thin", () => {
    c.frameTop(ctx, box);
    c.frameRight(ctx, box);
    c.frameBottom(ctx, box);
  });
}

export function vertAlignedBlock(block: Block, height: number, valign: VAlign): Block {
  return {
    width: block.width,
    height,
    render: (ctx: DrawerContext, box: Box) => {
      r.putIn(ctx, block, box, { valign });
    }
  }
}
