import type { Box } from "./box";
import * as b from "./box";
import type { DrawerContext } from "./context";

interface Item {
  getWidth(ctx: DrawerContext): number | "expand" | { kind: "tabTo", at: number };
  render(ctx: DrawerContext, box: Box): void;
}

function line(ctx: DrawerContext, box: Box, item: Item[]) {

}

function resolveWidth(ctx: DrawerContext, box: Box, items: Item[]): { 
  width: number;
  render: (ctx: DrawerContext, box: Box) => void;
}[] {
  const result: { 
    width: number;
    render: (ctx: DrawerContext, box: Box) => void;
  } [] = [];
  let expanders: { 
    width: number;
    render: (ctx: DrawerContext, box: Box) => void;
  } [] = [];
  let x = 0;
  items.forEach(item => {
    const w = item.getWidth(ctx);
    if( typeof w === "number" ){
      x += w;
      result.push({ width: w, render: item.render });
    } else if( w === "expand" ) {
      const i = { width: 0, render: item.render };
      result.push(i);
      expanders.push(i);
    } else {
      switch(w.kind) {
        case "tabTo": {
          const extra = Math.max(0, w.at - x);
          const n = expanders.length;
          if( n > 0 ){
            const e = extra / n;
            expanders.forEach(expander => expander.width = e);
            expanders = [];
          }
          break;
        }
      }
    }
  })
  const n = expanders.length;
  if( n > 0 ){
    const e = Math.max(0, b.width(box) - x) / n;
    expanders.forEach(i => i.width = e);
  }
  return result;
}
