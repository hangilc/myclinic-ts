import type { Box } from "@/lib/drawer/compiler/box";
import type { DrawerContext } from "@/lib/drawer/compiler/context";
import * as x from "./xsplit";
import * as r from "./row-renderer";
import * as b from "@/lib/drawer/compiler/box";

export interface Item {
  height: (ctx: DrawerContext) => number | { kind: "gap"} | { kind: "at"; at: number };
  render: (ctx: DrawerContext, box: Box) => void;
}

export function fixed(height: number, rowItems?: r.Item[] ): Item {
  let render: (ctx: DrawerContext, box: Box) => void = () => {};
  if( rowItems ){
    render = (ctx, box) => r.renderRow(ctx, box, ...rowItems);
  }
  return {
    height: () => height,
    render,
  }
}

export function gap(
  rowItems?: r.Item[]
): Item {
  let render: (ctx: DrawerContext, box: Box) => void = () => {};
  if( rowItems ){
    render = (ctx, box) => r.renderRow(ctx, box, ...rowItems);
  }
  return {
    height: () => ({ kind: "gap"}),
    render,
  }
}

export function at(pos: number, render?: (ctx: DrawerContext, box: Box) => void): Item {
  return {
    height: () => ({ kind: "at", at: pos }),
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

export function renderCol(ctx: DrawerContext, row: Box, ...items: Item[]) {
  const splits = items.map(item => {
    let w = item.height(ctx);
    if( typeof w === "number" ){
      return x.fixed(w);
    } else if( w.kind === "gap" ){
      return x.gap();
    } else {
      return x.at(w.at);
    }
  });
  let bs = b.splitToRows(row, x.split(...splits));
  for(let i=0;i<items.length;i++){
    let item = items[i];
    let box = bs[i];
    item.render(ctx, box);
  }
}
