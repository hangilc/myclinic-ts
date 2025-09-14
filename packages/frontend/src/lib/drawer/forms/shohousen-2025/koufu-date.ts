import type { Box } from "@/lib/drawer/compiler/box";
import * as b from "@/lib/drawer/compiler/box";
import * as c from "@/lib/drawer/compiler/compiler";
import { type DrawerContext } from "@/lib/drawer/compiler/context";
import type { ShohousenData2025 } from "./data2025";
import { drawElement, stackedTexts } from "./element";
import { brackettedElement, nenMonthDayElement } from "./helper";
import { DateWrapper } from "myclinic-util";

export function drawKoufuDate(ctx: DrawerContext,  frame: Box, data: ShohousenData2025) {
  c.frame(ctx, frame);
  let [issueDate, issueDateLimit] = b.splitToColumns(frame, b.evenSplitter(2));
  c.frameRight(ctx, issueDate);
  drawIssueDate(ctx, issueDate, data);
  drawIssueDateLimit(ctx, issueDateLimit, data);
}

function drawIssueDate(ctx: DrawerContext, box: Box, data: ShohousenData2025) {
  let [label, body] = b.splitToColumns(box, b.splitAt(25));
  c.frameRight(ctx, label);
  c.drawText(ctx, "交付年月日", label, "center", "center");
  let dateOpt = data.koufuDate;
  if( dateOpt ){
    let date = DateWrapper.from(dateOpt);
    let ele = nenMonthDayElement(ctx, date, {
      gengou: date.getGengou(),
    });
    drawElement(ctx, body, ele);
  }
}

function drawIssueDateLimit(ctx: DrawerContext, box: Box, data: ShohousenData2025) {
  let [label, body, append] = b.splitToColumns(box, b.splitAt(25, 48));
  c.frameRight(ctx, label);
  drawIssueDateLimitLabel(ctx, label);
  drawIssueDateLimitDate(ctx, body, data);
  drawIssueDateLimitAppend(ctx, append);
  // let dateOpt = data.shohou?.kigen;
  // if( dateOpt ){
  //   let date = DateWrapper.from(dateOpt);
  //   let [label, body ] = b.splitToColumns(box, b.splitAt(25));
  //   c.frameRight(ctx, label);
  //   c.drawText(ctx, "交付年月日", label, "center", "center");
  //   let ele = nenMonthDayElement(ctx, date, { gengou: date.getGengou() });
  //   drawElement(ctx, box, ele);
  // }
}

function drawIssueDateLimitLabel(ctx: DrawerContext, box: Box) {
  let ele = stackedTexts(["処方箋の", "使用期間"]);
  drawElement(ctx, box, ele);
}

function drawIssueDateLimitDate(ctx: DrawerContext, box: Box, data: ShohousenData2025) {
  let date = data.shohou?.kigen ? DateWrapper.from(data.shohou.kigen) : undefined;
  let ele = nenMonthDayElement(
    ctx,
    date,
    {
      gengou: date ? date.getGengou() : "令和",
      gap: 0.3,
    }
  )
  drawElement(ctx, box, ele, { halign: "right" });
}

function drawIssueDateLimitAppend(ctx: DrawerContext, box: Box) {
  let texts = stackedTexts([
    "特に記載のある場合",
    "を除き、交付の日を含",
    "めて４日以内に保険薬",
    "局に提出すること。",
  ], { font: "f1.5", leading: 0.5 });
  let ele = brackettedElement(texts, { size: 0.75, pen: "thin" });
  drawElement(ctx, box, ele, { halign: "center", valign: "center"})
}








