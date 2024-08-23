import type { Box } from "../../compiler/box";
import * as b from "../../compiler/box";
import * as c from "../../compiler/compiler";
import type { DrawerContext } from "../../compiler/context";

export function drawPharmacy(ctx: DrawerContext, box: Box) {
  const layout = b.withSplitColumns(box, b.splitAt(85), cs => {
    return { left: cs[0], right: cs[1] };
  });
  c.rect(ctx, layout.left);
  c.rect(ctx, layout.right);
  c.setFont(ctx, "mincho-2");
  drawLeft(ctx, layout.left);
  drawRight(ctx, layout.right);
}

function drawLeft(ctx: DrawerContext, box: Box) {
  const layout = b.withSplitRows(box, b.splitAt(3, 10, 17), rs => {
    return { r1: rs[0], r2: rs[1], r3: rs[2], r4: rs[3] };
  });
  [layout.r1, layout.r2, layout.r3].forEach(box => c.frameBottom(ctx, box));
  c.drawVertLines(ctx, box, b.splitAt(11.5, 27.8, 47, 57.3, 76.5));
  b.withSplitColumns(layout.r1, b.splitAt(11.5, 27.8, 47, 57.3, 76.5), cs => {
    c.drawTextJustified(ctx, "調剤料", b.modify(cs[0], b.inset(1, 0)), "center");
    c.drawTextJustified(ctx, "薬剤料", b.modify(cs[1], b.inset(3, 0)), "center");
    c.drawText(ctx, "計", cs[2], "center", "center");
    c.drawTextJustified(ctx, "調剤数量", b.modify(cs[3], b.inset(0.5, 0)), "center");
    c.drawTextJustified(ctx, "合計", b.modify(cs[4], b.inset(4, 0)), "center");
    c.drawTextJustified(ctx, "加算", b.modify(cs[5], b.inset(1.5, 0)), "center");
  })
}

function drawRight(ctx: DrawerContext, box: Box) {
  const layout = b.withSplitRows(box, b.splitAt(3, 10, 13), rs => {
    return { label1: rs[0], r1: rs[1], label2: rs[2], r2: rs[3] };
  });
  [layout.r1, layout.label2, layout.r2].forEach(box => c.frameTop(ctx, box));
  c.drawVertLines(ctx, box, b.splitAt(19.5, 39));
  c.setFont(ctx, "mincho-2");
  b.withSplitColumns(layout.label1, b.splitAt(19.5, 39), cs => {
    c.drawTextJustified(ctx, "調剤基本料", b.modify(cs[0], b.inset(2, 0)), "center");
    c.drawTextJustified(ctx, "管理指導料", b.modify(cs[1], b.inset(2, 0)), "center");
    c.drawTextJustified(ctx, "総合計", b.modify(cs[2], b.inset(2, 0)), "center");
  });
  b.withSplitColumns(layout.label2, b.splitAt(19.5, 39), cs => {
    c.drawTextJustified(ctx, "患者負担金", b.modify(cs[0], b.inset(2, 0)), "center");
    c.drawTextJustified(ctx, "請求金額", b.modify(cs[1], b.inset(2, 0)), "center");
    c.drawTextJustified(ctx, "調剤済印", b.modify(cs[2], b.inset(2, 0)), "center");
  })
}