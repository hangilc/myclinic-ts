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
import { colOfElements, drawElement, fixedElement, stackedTexts, textElement } from "./element";
import { black, brackettedElement, eightDigits, flowTextIn, lightRed, nenMonthDayElement, nenMonthDayRenderer } from "./helper";
import { DateWrapper, pad } from "myclinic-util";

export function drawKouhi2(ctx: DrawerContext, box: Box, data: ShohousenData2025) {
  c.frame(ctx, box);
  const [left, right] = b.splitToColumns(box, b.evenSplitter(2));
  c.frameRight(ctx, left);
  drawChouzaiDate(ctx, left);
  drawKouhi2Box(ctx, right, data);
}

function drawChouzaiDate(ctx: DrawerContext, box: Box) {
  const [label, body] = b.splitToColumns(box, b.splitAt(25));
  c.frameRight(ctx, label);
  c.drawText(ctx, "調剤年月日", label, "center", "center");
  let ele = nenMonthDayElement(ctx, undefined, {
    gengou: "令和"
  });
  drawElement(ctx, body, ele);
}

function drawKouhi2Box(ctx: DrawerContext, box: Box, data: ShohousenData2025) {
  let digitWidth = 5;
  const [label, body] = b.splitToColumns(box, x.split(x.gap(), x.fixed(digitWidth * 8)));
  c.frameRight(ctx, label);
  c.drawText(ctx, "公費負担者番号", label, "center", "center");
  eightDigits(ctx, body, data.futansha2);
}




 
 
