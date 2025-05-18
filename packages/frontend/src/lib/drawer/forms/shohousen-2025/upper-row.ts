import type { Box } from "@/lib/drawer/compiler/box";
import * as b from "@/lib/drawer/compiler/box";
import * as c from "@/lib/drawer/compiler/compiler";
import * as x from "./xsplit";
import { type DrawerContext } from "@/lib/drawer/compiler/context";
import type { ShohousenData2025 } from "./data2025";
import { eightDigits, sevenDigits } from "./helper";

export function drawUpperRow(ctx: DrawerContext,  frame: Box, data: ShohousenData2025) {
  let [kouhiBox, hokenBox] = b.splitToColumns(frame, b.evenSplitter(2));
  drawKouhi(ctx, kouhiBox, data);
  drawHoken(ctx, hokenBox, data);
}

function drawKouhi(ctx: DrawerContext, frame: Box, data: ShohousenData2025) {
  c.frame(ctx, frame);
  let [upperRow, lowerRow] = b.splitToRows(frame, b.evenSplitter(2));
  drawKouhiFutansha(ctx, upperRow, data);
  drawKouhiJukyusha(ctx, lowerRow, data);
}

function drawKouhiFutansha(ctx: DrawerContext, frame: Box, data: ShohousenData2025) {
  c.frame(ctx, frame);
  const digitWidth = 5;
  const [label, digits] = b.splitToColumns(frame, x.split(x.gap(), x.fixed(digitWidth * 8)));
  c.frame(ctx, label);
  c.drawText(ctx, "公費負担者番号", label, "center", "center");
  let futansha: string | undefined = data.futansha;
  eightDigits(ctx, digits, futansha);
}

function drawKouhiJukyusha(ctx: DrawerContext, frame: Box, data: ShohousenData2025) {
  const digitWidth = 5;
  const [label, digits] = b.splitToColumns(frame, x.split(x.gap(), x.fixed(digitWidth * 7)));
  c.frameRight(ctx, label);
  drawCentered(ctx, label, ["公費負担医療", "の受給者番号"]);
  let jukyuusha: string | undefined = data.jukyuusha;
  sevenDigits(ctx, digits, jukyuusha);
}

function drawHoken(ctx: DrawerContext, frame: Box, data: ShohousenData2025) {
  c.frame(ctx, frame);
  let [upper, lower] = b.splitToRows(frame, b.evenSplitter(2));
  c.frameBottom(ctx, upper);
  drawHokensha(ctx, upper, data);
  drawHihokensha(ctx, lower, data);
}

function drawHokensha(ctx: DrawerContext, frame: Box, data: ShohousenData2025) {
  const digitWidth = 5;
  const [label, digits] = b.splitToColumns(frame, x.split(
    x.gap(), x.fixed(digitWidth * 8)
  ));
  c.frameRight(ctx, label);
  c.drawText(ctx, "保険者番号", label, "center", "center");
  let hokensha: string | undefined = data.hokenshaBangou;
  eightDigits(ctx, digits, hokensha);
}

function drawHihokensha(ctx: DrawerContext, frame: Box, data: ShohousenData2025) {
  const digitWidth = 5;
  const [label, digits] = b.splitToColumns(frame, x.split(
    x.gap(), x.fixed(digitWidth * 8)
  ));
  c.frameRight(ctx, label);
  drawCentered(ctx, label, ["被保険者証・被保険", "者手帳の記号・番号"]);
  let hihokensha: string | undefined = data.hihokenshaBangou;
  eightDigits(ctx, digits, hihokensha);
}

function drawCentered(ctx: DrawerContext, outer: Box, texts: string[]) {
  let w = 0;
  for(let t of texts) {
    w = Math.max(w, c.textWidth(ctx, t));
  }
  let h = c.currentFontSize(ctx) * texts.length;
  let box = b.aligned(outer, w, h, "center", "center");
  let rows = b.splitToRows(box, b.evenSplitter(texts.length));
  for(let i=0;i<texts.length;i++){
    c.drawText(ctx, texts[i], rows[i], "center", "center");
  }
}
