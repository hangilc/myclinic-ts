import type { Box } from "@/lib/drawer/compiler/box";
import * as b from "@/lib/drawer/compiler/box";
import * as c from "@/lib/drawer/compiler/compiler";
import * as x from "./xsplit";
import * as cr from "./col-renderer";
import * as r from "./row-renderer";
import { type DrawerContext } from "@/lib/drawer/compiler/context";
import type { ShohousenData2025 } from "./data2025";
import { drawShimei } from "./kanja/shimei";
import { drawBirthdayAndSex } from "./kanja/birthday-and-sex";
import { drawKubun } from "./kanja/kubun";
import { colOfElements, drawElement, fixedElement, justifiedStackedTexts, stackedTexts, textElement } from "./element";
import { black, brackettedElement, flowTextIn, lightRed, nenMonthDayElement, nenMonthDayRenderer, sevenDigits } from "./helper";
import { DateWrapper, pad } from "myclinic-util";

export function drawPharma(ctx: DrawerContext, box: Box, data: ShohousenData2025) {
  c.frame(ctx, box);
  const [left, right] = b.splitToColumns(box, b.evenSplitter(2));
  c.frameRight(ctx, left);
  drawPharmaPart(ctx, left);
  drawKouhi2Part(ctx, right, data);
}

function drawPharmaPart(ctx: DrawerContext, box: Box) {
  const [label, body] = b.splitToColumns(box, b.splitAt(25));
  c.frameRight(ctx, label);
  let st = justifiedStackedTexts(ctx, [
    "保険薬局の所在地",
    "及び名称",
    "保険薬剤師氏名",
  ]);
  drawElement(ctx, label, st);
  let stampBox = b.modify(box, b.shrinkHoriz(0, 5));
  c.drawText(ctx, "㊞", stampBox, "right", "center");
}

function drawKouhi2Part(ctx: DrawerContext, box: Box, data: ShohousenData2025) {
  const digitWidth = 5;
  const [label, body] = b.splitToColumns(box, x.split(x.gap(), x.fixed(digitWidth * 7)));
  c.frameRight(ctx, label);
  let st = justifiedStackedTexts(ctx, [
    "公費負担医療の", "受給者番号"
  ]);
  drawElement(ctx, label, st);
  sevenDigits(ctx, body, data.jukyuusha2);
}



