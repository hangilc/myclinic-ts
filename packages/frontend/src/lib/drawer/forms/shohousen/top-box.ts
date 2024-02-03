import type { Box } from "../../compiler/box";
import type { DrawerContext } from "../../compiler/context";
import * as c from "../../compiler/compiler";
import * as b from "../../compiler/box";

export function drawTopBox(ctx: DrawerContext, box: Box) {
  c.rect(ctx, box);
  const [col1, col2] = b.splitToColumns(box, (_) => [62]);
  drawKouhi(ctx, col1);
  drawHoken(ctx, col2);
}

function drawKouhi(ctx: DrawerContext, box: Box) {
  box = b.modify(box, b.shrinkHoriz(0, 2));
  let [r1, r2] = b.splitToRows(box, b.evenSplitter(2));
  const leftColWidth = 14.3;
  const [r1c1, r1c2] = b.splitToColumns(r1, (_) => [leftColWidth]);
  r2 = b.modify(r2, b.shrinkHoriz(0, b.width(r1c2)/8));
  let [r2c1, r2c2] = b.splitToColumns(r2, (_) => [leftColWidth]);
  c.rect(ctx, r1);
  c.rect(ctx, r2);
  drawKouhiRow1(ctx, r1c1, r1c2);
  drawKouhiRow2(ctx, r2c1, r2c2);
}

function drawKouhiRow1(ctx: DrawerContext, c1: Box, c2: Box) {
  c.frameRight(ctx, c1);
  c.setFont(ctx, "mincho-2");
  c.drawTextJustified(ctx, "公費負担者番号", c1, "center");
  c.mark(ctx, "futanshaBangouBox", c2);
  c.frameInnerColumnBorders(ctx, c2, b.evenSplitter(8));
}

function drawKouhiRow2(ctx: DrawerContext, c1: Box, c2: Box) {
  c.frameRight(ctx, c1);
  c.setFont(ctx, "mincho-2");
  b.withSplitRows(c1, b.evenSplitter(2), ([r1, r2]) => {
    c.drawTextJustified(ctx, "公費負担医療", r1, "center");
    c.drawTextJustified(ctx, "公の受給者番号", r2, "center");
  });
  c.mark(ctx, "jukyuushaBangouBox", c2);
  c.frameInnerColumnBorders(ctx, c2, b.evenSplitter(7));
}

function drawHoken(ctx: DrawerContext, box: Box) {
  const leftColumnWidth = 13;
  b.withSplitRows(box, b.evenSplitter(2), ([r1, r2]) => {
    r1 = b.modify(r1, b.setWidth(59, "left"));
    c.rect(ctx, r1);
    b.withSplitColumns(r1, b.splitAt(leftColumnWidth), ([c1, c2]) => {
      drawHokenRow1(ctx, c1, c2);
    });
    b.withSplitColumns(r2, b.splitAt(leftColumnWidth), ([c1, c2]) => {
      drawHokenRow2(ctx, c1, c2);
    })
  });
}

function drawHokenRow1(ctx: DrawerContext, c1: Box, c2: Box) {
  c.frameRight(ctx, c1);
  c.setFont(ctx, "mincho-2");
  c.drawTextJustified(ctx, "保険者番号", c1, "center");
  c.mark(ctx, "hokenshaBangouBox", c2);
  c.frameInnerColumnBorders(ctx, c2, b.evenSplitter(8));
}

function drawHokenRow2(ctx: DrawerContext, c1: Box, c2: Box) {

}