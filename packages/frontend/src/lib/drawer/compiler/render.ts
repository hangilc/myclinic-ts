import type { Box } from "./box";
import type { DrawerContext } from "./context";
import * as b from "./box";
import * as c from "./compiler";

export type Block = {
  kind: "block";
  width: number;
  render: (ctx: DrawerContext, box: Box) => void;
};

export type Expander = {
  kind: "expander";
  weight: number;
};

function textBlock(ctx: DrawerContext, text: string, opt?: {
  font?: string;
}): Block {
  const font = opt?.font;
  return {
    kind: "block",
    width: font ? c.textWidthWithFont(ctx, text, font) : c.textWidth(ctx, text),
    render: (ctx, box) => {
      function render() {
        c.drawText(ctx, text, box, "left", "top");
      }
      if( font ){
        c.withFont(ctx, font, render);
      } else {
        render();
      }
    },
  };
}

export type Item = Block | Expander;

export function render(ctx: DrawerContext, box: Box, items: Item[]) {
  const blockWidth = items.reduce((acc, ele) => acc + (ele.kind === "block" ? ele.width : 0), 0);
  const totalWeight = items.reduce((acc, ele) => acc + (ele.kind === "expander" ? ele.weight : 0), 0);
  const extraWeight = (Math.max(0, b.width(box) - blockWidth)) / totalWeight;
  let x = 0;
  items.forEach(item => {
    switch(item.kind){
      case "block": {
        item.render(ctx, b.modify(box, b.shrinkHoriz(x, 0), b.setWidth(item.width, "left")));
        x += item.width;
        break;
      }
      case "expander": {
        x += extraWeight * item.weight;
        break;
      }
    }
  });
}
