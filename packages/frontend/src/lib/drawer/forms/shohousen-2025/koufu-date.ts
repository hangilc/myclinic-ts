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
import { drawElement, stackedTexts } from "./element";
import { black, nenMonthDayElement, nenMonthDayRenderer } from "./helper";
import { DateWrapper, pad } from "myclinic-util";

export function drawKoufuDate(ctx: DrawerContext,  frame: Box, data: ShohousenData2025) {
  c.frame(ctx, frame);
  let [issueDate, issueDateLimit] = b.splitToColumns(frame, b.evenSplitter(2));
  c.frameRight(ctx, issueDate);
  drawIssueDate(ctx, issueDate, data);
}

function drawIssueDate(ctx: DrawerContext, box: Box, data: ShohousenData2025) {
  let [label, body] = b.splitToColumns(box, b.splitAt(25));
  c.frameRight(ctx, label);
  c.drawText(ctx, "交付年月日", label, "center", "center");
  let dateOpt = data.koufuDate;
  if( dateOpt ){
    let date = DateWrapper.from(dateOpt);
    let ele = nenMonthDayElement(ctx, body, date, {
      gengou: date.getGengou(),
    });
    drawElement(ctx, body, ele);
  }
}

