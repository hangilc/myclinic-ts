import type { Box } from "@/lib/drawer/compiler/box";
import type { DrawerContext } from "@/lib/drawer/compiler/context";
import * as x from "./xsplit";
import * as b from "@/lib/drawer/compiler/box";
import * as c from "@/lib/drawer/compiler/compiler";
import type { VAlign } from "@/lib/drawer/compiler/align";

export interface Item {
  width: (ctx: DrawerContext) => number | { kind: "gap"} | { kind: "at"; at: number };
  render: (ctx: DrawerContext, box: Box) => void;
}

export function t(text: string, opt?: {
  valign?: VAlign;
  render?: (ctx: DrawerContext, box: Box, orig: (ctx: DrawerContext, box: Box) => void) => void;
}): Item {
  let render = (ctx: DrawerContext, box: Box) => {
    let valign: VAlign = opt?.valign ?? "center";
    c.drawText(ctx, text, box, "left", valign);
  }
  return {
    width: (ctx) => c.textWidth(ctx, text),
    render: extendRender(render, opt?.render),
  }
}

export function fixed(w: number, render?: (ctx: DrawerContext, box: Box) => void): Item {
  return {
    width: () => w,
    render: (ctx, box) => {
      if( render ){
        render(ctx, box);
      }
    }
  }
}

export function gap(
  render?: (ctx: DrawerContext, box: Box) => void,
): Item {
  return {
    width: () => ({ kind: "gap"}),
    render: render ?? (() => {}),
  }
}

export function at(pos: number, render?: (ctx: DrawerContext, box: Box) => void): Item {
  return {
    width: () => ({ kind: "at", at: pos }),
    render: (ctx, box) => {
      if( render ){
        render(ctx, box);
      }
    }
  }
}

function extendRender(
  orig?: (ctx: DrawerContext, box: Box) => void,
  optRender?: (ctx: DrawerContext, box: Box, orig: (ctx: DrawerContext, box: Box) => void) => void,
): (ctx: DrawerContext, box: Box) => void {
  orig = orig ?? (() => {});
  if( optRender ){
    return (ctx, box) => {
      optRender(ctx, box, orig);
    }
  } else {
    return orig;
  }
}

export function renderRow(ctx: DrawerContext, row: Box, ...items: Item[]) {
  const splits = items.map(item => {
    let w = item.width(ctx);
    if( typeof w === "number" ){
      return x.fixed(w);
    } else if( w.kind === "gap" ){
      return x.gap();
    } else {
      return x.at(w.at);
    }
  });
  let bs = b.splitToColumns(row, x.split(...splits));
  for(let i=0;i<items.length;i++){
    let item = items[i];
    let box = bs[i];
    item.render(ctx, box);
  }
}
