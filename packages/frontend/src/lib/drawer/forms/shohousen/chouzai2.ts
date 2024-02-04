import type { Box } from "../../compiler/box";
import * as b from "../../compiler/box";
import * as c from "../../compiler/compiler";
import type { DrawerContext } from "../../compiler/context";

export function drawChouzai2(ctx: DrawerContext, box: Box) {
  const layout = b.withSplitColumns(box, b.splitAt(14.5, 82, 95.5), cs => {
    return { chouzaiLabel: cs[0], chouzai: cs[1], kouhiLabel: cs[2], 
      kouhi: b.modify(cs[3], b.shrinkHoriz(0, b.width(cs[3])/8)) }
  });
  [layout.chouzaiLabel, layout.chouzai, layout.kouhiLabel, layout.kouhi].forEach(box => c.rect(ctx, box));
  c.setFont(ctx, "mincho-1.5");
  b.withSplitRows(b.modify(layout.chouzaiLabel, b.inset(0.5, 0)), b.evenSplitter(3), rs => {
    c.drawTextJustified(ctx, "保険薬局の所在", rs[0], "center");
    c.drawTextJustified(ctx, "地及び名称", rs[1], "center");
    c.drawTextJustified(ctx, "保険薬剤師氏名", rs[2], "center");
  });
  c.setFont(ctx, "mincho-2");
  c.drawText(ctx, "印", b.modify(layout.chouzai, b.shrinkHoriz(59, 0)), "left", "center");
  c.setFont(ctx, "mincho-1.5");
  b.withSplitRows(b.modify(layout.kouhiLabel, b.inset(0.5, 0)), b.evenSplitter(2), rs => {
    c.drawTextJustified(ctx, "公費負担医療", rs[0], "center");
    c.drawTextJustified(ctx, "の受給者番号", rs[1], "center");
  });
  c.drawVertLines(ctx, layout.kouhi, b.evenSplitter(7));
  c.mark(ctx, "jukyuushaBangou2Box", layout.kouhi);
}