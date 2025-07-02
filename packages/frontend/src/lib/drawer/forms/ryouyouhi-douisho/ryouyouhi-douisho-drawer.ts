import type { Op } from "../../compiler/op";
import * as c from "../../compiler/compiler";
import * as b from "../../compiler/box";
import type { Box } from "../../compiler/box";
import * as p from "../../compiler/composite-item";
import { A4 } from "../../compiler/paper-size";
import { mkDrawerContext, type DrawerContext } from "../../compiler/context";
import { ConductDrugEx } from "myclinic-model";
import { breakNextLine } from "../../compiler/break-lines";
import { split } from "../shohousen-2025/xsplit";

export interface RyouyouhiDouishoDrawerData {
  "patient-name": string;
  "patient-address": string;
  "birth-date": string;
  "condition-name": string;
  "onset-date": string;
  "consent-type": string;
  "examination-date": string;
  "issue-date": string;
  "clinic-name": string;
  "clinic-address": string;
  "doctor-name": string;
}

export function mkRyouyouhiDouishoDrawerData(): RyouyouhiDouishoDrawerData {
  return {
    "patient-name": "",
    "patient-address": "",
    "birth-date": "",
    "condition-name": "",
    "onset-date": "",
    "consent-type": "",
    "examination-date": "",
    "issue-date": "",
    "clinic-name": "",
    "clinic-address": "",
    "doctor-name": "",
  };
}

const leftColumnWidth = 26.5;

export function ryouyouhiDouishoDrawerContext(): DrawerContext {
  const ctx = mkDrawerContext(initContext);
  c.setPen(ctx, "regular");
  c.setFont(ctx, "regular");
  return ctx;
}

export function drawRyouyouhiDouisho(data: RyouyouhiDouishoDrawerData): Op[] {
  const ctx = ryouyouhiDouishoDrawerContext();
  const paper = b.paperSizeToBox(A4);
  const wrappingBox = b.modify(paper, b.shift(17, 28), b.setWidth(178, "left"), b.setHeight(238, "top"));
  const [titleBox, patientBox, byoumeiBox, hatubyouDateBox, douiKubunBox,
    shinsatubiBox, shoujouBox, sejutuBox, chiyouBox, chuuiBox, bottomBox
  ] = b.splitToRows(wrappingBox, b.splitWidths(9.5, 19, 11, 8, 8, 8, 40, 17, 40, 20));

  c.rect(ctx, wrappingBox);
  c.frameBottom(ctx, titleBox);
  c.frameBottom(ctx, patientBox);
  c.frameBottom(ctx, byoumeiBox);
  c.frameBottom(ctx, hatubyouDateBox);
  c.frameBottom(ctx, douiKubunBox);
  c.frameBottom(ctx, shinsatubiBox);
  c.frameBottom(ctx, shoujouBox);
  c.frameBottom(ctx, sejutuBox);
  c.frameBottom(ctx, chiyouBox);
  c.frameBottom(ctx, chuuiBox);

  drawTitle(ctx, titleBox, data);
  drawPatient(ctx, patientBox, data);
  drawByoumei(ctx, byoumeiBox, data);
  drawHatubyouDate(ctx, hatubyouDateBox, data);
  drawDouiKubun(ctx, douiKubunBox, data);
  drawShinsatuDate(ctx, shinsatubiBox, data);
  drawShoujou(ctx, shoujouBox, data);
  drawSejutu(ctx, sejutuBox, data);
  drawChiyou(ctx, chiyouBox, data);
  drawChuui(ctx, chuuiBox, data);
  drawBottom(ctx, bottomBox, data);
  return c.getOps(ctx);
}

function initContext(ctx: DrawerContext) {
  c.createFont(ctx, "title", "MS Mincho", 7);
  c.createFont(ctx, "regular", "MS Mincho", 4);
  c.createFont(ctx, "large", "MS Mincho", 4.2);
  c.createFont(ctx, "small", "MS Mincho", 3);
  c.createPen(ctx, "regular", 0, 0, 0, 0.1);
}

function drawTitle(ctx: DrawerContext, box: Box, data: RyouyouhiDouishoDrawerData) {
  c.withFont(ctx, "title", () => {
    c.drawText(ctx, "同意書", b.modify(box),
      "center", "top", { interCharsSpace: 13 })
  });
  c.withFont(ctx, "small", () => {
    c.drawText(ctx, "(あん摩マッサージ指圧療養費用)", b.modify(box, b.shrinkHoriz(123, 0), b.shrinkVert(3.5, 0)),
      "left", "top");
  })
}

function drawPatient(ctx: DrawerContext, box: Box, data: RyouyouhiDouishoDrawerData) {
  let [left, right] = b.splitToColumns(box, b.splitAt(leftColumnWidth));
  c.frameRight(ctx, left);
  c.drawTextJustified(ctx, "患者", b.modify(left, b.shrinkHoriz(3, 3)), "center");
}

function drawByoumei(ctx: DrawerContext, box: Box, data: RyouyouhiDouishoDrawerData) {
  let [left, right] = b.splitToColumns(box, b.splitAt(leftColumnWidth));
  c.frameRight(ctx, left);
  c.drawTextJustified(ctx, "傷病名", b.modify(left, b.shrinkHoriz(3, 3)), "center");
}

function drawHatubyouDate(ctx: DrawerContext, box: Box, data: RyouyouhiDouishoDrawerData) {
  let [left, right] = b.splitToColumns(box, b.splitAt(leftColumnWidth));
  c.frameRight(ctx, left);
  c.drawText(ctx, "発病年月日", left, "center", "center");
}

function drawDouiKubun(ctx: DrawerContext, box: Box, data: RyouyouhiDouishoDrawerData) {
  let [left, right] = b.splitToColumns(box, b.splitAt(leftColumnWidth));
  c.frameRight(ctx, left);
  c.drawText(ctx, "同意区分", left, "center", "center");
}

function drawShinsatuDate(ctx: DrawerContext, box: Box, data: RyouyouhiDouishoDrawerData) {
  let [left, right] = b.splitToColumns(box, b.splitAt(leftColumnWidth));
  c.frameRight(ctx, left);
  c.drawTextJustified(ctx, "診察日", b.modify(left, b.shrinkHoriz(3, 3)), "center");
}

function drawShoujou(ctx: DrawerContext, box: Box, data: RyouyouhiDouishoDrawerData) {
  let [left, right] = b.splitToColumns(box, b.splitAt(leftColumnWidth));
  c.frameRight(ctx, left);
  c.drawTextJustified(ctx, "症状", b.modify(left, b.shrinkHoriz(3, 3)), "center");
}

function drawSejutu(ctx: DrawerContext, box: Box, data: RyouyouhiDouishoDrawerData) {
  let [left, right] = b.splitToColumns(box, b.splitAt(leftColumnWidth));
  c.frameRight(ctx, left);
  {
    let dbox = b.modify(left, b.setHeight(10, "center"), b.shrinkHoriz(3, 3));
    c.drawText(ctx, "施術の種類", dbox, "center", "top");
    c.drawText(ctx, "施術部位", dbox, "center", "bottom");
  }
}

function drawChiyou(ctx: DrawerContext, box: Box, data: RyouyouhiDouishoDrawerData) {
  let [left, right] = b.splitToColumns(box, b.splitAt(leftColumnWidth));
  c.frameRight(ctx, left);
}

function drawChuui(ctx: DrawerContext, box: Box, data: RyouyouhiDouishoDrawerData) {
  let [left, right] = b.splitToColumns(box, b.splitAt(leftColumnWidth));
  c.frameRight(ctx, left);
}

function drawBottom(ctx: DrawerContext, box: Box, data: RyouyouhiDouishoDrawerData) {

}

