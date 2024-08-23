import type { Box } from "../../compiler/box";
import * as b from "../../compiler/box";
import * as c from "../../compiler/compiler";
import type { DrawerContext } from "../../compiler/context";

export function drawChouzai1(ctx: DrawerContext, box: Box) {
  const layout = b.withSplitColumns(box, b.splitAt(14.5, 82, 95.5), cs => {
    return { chouzaiLabel: cs[0], chouzai: cs[1], kouhiLabel: cs[2], kouhi: cs[3] }
  });
  c.rect(ctx, box);
  [layout.chouzaiLabel, layout.chouzai, layout.kouhiLabel].forEach(box => c.frameRight(ctx, box));
  c.setFont(ctx, "mincho-2");
  c.drawTextJustified(ctx, "調剤年月日", b.modify(layout.chouzaiLabel, b.inset(1, 0)), "center");
  drawChoizaiDate(ctx, layout.chouzai);
  c.setFont(ctx, "mincho-1.5");
  c.drawTextJustified(ctx, "公費負担者番号", b.modify(layout.kouhiLabel, b.inset(0.5, 0)), "center");
  c.drawVertLines(ctx, layout.kouhi, b.evenSplitter(8));
  c.mark(ctx, "futanshaBangou2Box", layout.kouhi);
}

function drawChoizaiDate(ctx: DrawerContext, box: Box) {
  c.drawComposite(ctx, box, [
    { kind: "gap-to", at: 28 },
    { kind: "gap", width: 1},
    { kind: "text", text: "年"},
    { kind: "gap-to", at: 41 },
    { kind: "gap", width: 1},
    { kind: "text", text: "月"},
    { kind: "gap-to", at: 53 },
    { kind: "gap", width: 1},
    { kind: "text", text: "日"},
  ]);
}
