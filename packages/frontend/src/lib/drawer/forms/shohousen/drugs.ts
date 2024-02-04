import type { Box } from "../../compiler/box";
import * as b from "../../compiler/box";
import * as c from "../../compiler/compiler";
import type { DrawerContext } from "../../compiler/context";

export function drawDrugs(ctx: DrawerContext, box: Box) {
  const layout = b.withSplitColumns(box, b.splitAt(4), cs => {
    return { label: cs[0], content: cs[1] }
  })
  c.rect(ctx, box);
  c.frameRight(ctx, layout.label);
  c.setFont(ctx, "mincho-2.5");
  c.drawTextJustifiedVertically(ctx, "処方", b.modify(layout.label, b.inset(0, 24)), "center");
  c.mark(ctx, "drugsPaneBox", layout.content);
}