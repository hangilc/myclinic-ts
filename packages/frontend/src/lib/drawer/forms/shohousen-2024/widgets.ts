import type { Block } from "../../compiler/render";
import * as c from "../../compiler/compiler";
import * as b from "../../compiler/box";
import * as r from "../../compiler/render";
import type { DrawerContext } from "../../compiler/context";
import type { Box } from "../../compiler/box";

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
