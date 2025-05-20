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
import { black, brackettedElement, flowTextIn, lightRed, nenMonthDayElement, nenMonthDayRenderer } from "./helper";
import { DateWrapper, pad } from "myclinic-util";

export function drawBikou(ctx: DrawerContext, box: Box, data: ShohousenData2025) {
  c.frame(ctx, box);
  let [mark, body] = b.splitToColumns(box, b.splitAt(5));
  c.frameRight(ctx, mark);
  drawMark(ctx, mark);
  let [upper, lower] = b.splitToRows(body, b.splitAt(13));
  const [upperLeft, upperRight] = b.splitToColumns(upper, b.splitAt(70));
  drawUpperLeft(ctx, upperLeft, data)
  let upperRightInner = b.modify(upperRight, b.inset(1, 1, 1, 0));
  let lowerInner = b.modify(lower, b.inset(1));
  drawBikouTexts(ctx, upperRightInner, lowerInner, data);
}

function drawMark(ctx: DrawerContext, box: Box) {
  let innerBox = b.modify(box, b.setHeight(11, "center"));
  c.drawTextJustifiedVertically(ctx, "備考", innerBox, "center");
}

function drawUpperLeft(ctx: DrawerContext, box: Box, data: ShohousenData2025) {
  c.frame(ctx, box);
  let [label, doctorName] = b.splitToRows(box, b.splitAt(7));
  drawUpperLeftLabel(ctx, label);
  if( isDoctorNameRequired(data) ){
    drawUpperLeftDoctorName(ctx, doctorName, data);
  }
}

function drawUpperLeftLabel(ctx: DrawerContext, box: Box) {
  let innerBox = b.modify(box, b.shrinkHoriz(0, 2))
  let [left, right] = b.splitToColumns(innerBox, b.splitAt(21))
  c.drawText(ctx, "保険医署名", left, "center", "center");
  let texts = stackedTexts([
            "「変更不可」欄に「✓」又は「×」を記載",
        "した場合は、署名又は記名・押印すること。"
  ], { font: "f2.3", halign: "left" });
  let bra = brackettedElement(texts, { pen: "thin" });
  drawElement(ctx, right, bra);
}

function isDoctorNameRequired(data: ShohousenData2025): boolean {
  for(let g of (data.shohou?.groups ?? [])){
    for(let d of g.drugs){
      let ippan = d.senpatsu;
      if( ippan !== undefined ){
        return true;
      }
    }
  }
  return false;
}

function drawUpperLeftDoctorName(ctx: DrawerContext, box: Box, data: ShohousenData2025) {
  let innerBox = b.modify(box, b.shrinkHoriz(15, 6));
  let [area, inkan] = b.splitToColumns(innerBox, x.split(x.gap(), x.fixed(2.5)));
  c.withFontAndColor(ctx, "d3", black, () => {
    c.drawText(ctx, data.doctorName ?? "", area, "left", "center");
  });
  c.withFontAndColor(ctx, "f2.5", lightRed, () => {
    c.drawText(ctx, "㊞", inkan, "center", "center");
  })
}

function drawBikouTexts(ctx: DrawerContext, box1: Box, box2: Box, data: ShohousenData2025) {
  let bikou = (data.shohou?.bikou ?? []).join("\n");
  let rest = flowTextIn(ctx, box1, bikou, { font: "d3", color: black });
  
}









