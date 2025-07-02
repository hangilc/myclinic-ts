import type { Op } from "../../compiler/op";
import * as c from "../../compiler/compiler";
import * as b from "../../compiler/box";
import type { Box } from "../../compiler/box";
import * as r from "./row-renderer";
import { A4 } from "../../compiler/paper-size";
import { mkDrawerContext, type DrawerContext } from "../../compiler/context";
import { ConductDrugEx } from "myclinic-model";
import { breakNextLine } from "../../compiler/break-lines";
import { split } from "../shohousen-2025/xsplit";
import type { join } from "path";


export interface RyouyouhiDouishoDrawerData {
  patientAddress: string;
  "patient-name": string;
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
    patientAddress: "",
    "patient-name": "",
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
    shinsatubiBox, shoujouBox, sejutuBox, ouryouBox, chuuiBox, bottomBox
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
  c.frameBottom(ctx, ouryouBox);
  c.frameBottom(ctx, chuuiBox);

  drawTitle(ctx, titleBox, data);
  drawPatient(ctx, patientBox, data);
  drawByoumei(ctx, byoumeiBox, data);
  drawHatubyouDate(ctx, hatubyouDateBox, data);
  drawDouiKubun(ctx, douiKubunBox, data);
  drawShinsatuDate(ctx, shinsatubiBox, data);
  drawShoujou(ctx, shoujouBox, data);
  drawSejutu(ctx, sejutuBox, data);
  drawOuryou(ctx, ouryouBox, data);
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
  let rows = b.splitToRows(right, b.evenSplitter(3));
  let middleWidth = 37;
  let keyMargin = 7;
  {
    let row = rows[0];
    c.frameBottom(ctx, row);
    let [keyBox, bodyBox] = b.splitToColumns(row, b.splitAt(middleWidth));
    c.frameRight(ctx, keyBox);
    c.drawTextJustified(ctx, "住所", b.modify(keyBox, b.shrinkHoriz(keyMargin, keyMargin)), "center");
  }
  {
    let row = rows[1];
    c.frameBottom(ctx, row);
    let [keyBox, bodyBox] = b.splitToColumns(row, b.splitAt(middleWidth));
    c.frameRight(ctx, keyBox);
    c.drawTextJustified(ctx, "氏名", b.modify(keyBox, b.shrinkHoriz(keyMargin, keyMargin)), "center");
  }
  {
    let row = rows[2];
    c.frameBottom(ctx, row);
    let [keyBox, bodyBox] = b.splitToColumns(row, b.splitAt(middleWidth));
    c.frameRight(ctx, keyBox);
    c.drawTextJustified(ctx, "生年月日", b.modify(keyBox, b.shrinkHoriz(keyMargin, keyMargin)), "center");
    let area: Box = b.modify(bodyBox, b.shrinkHoriz(9, 9));
    r.renderRow(ctx, area, r.t("明"), r.t("・"), r.t("大"), r.t("・"), r.t("昭"), r.t("・"), r.t("平"),
      r.gap(), r.t("年"), r.gap(), r.t("月"), r.gap(), r.t("日"));
  }
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
  r.renderRow(ctx, b.modify(right, b.shrinkHoriz(15, 42)),
    r.t("昭"), r.t("・"), r.t("平"), r.t("・"), r.t("令"), r.gap(), r.t("年"), r.gap(), r.t("月"), r.gap(), r.t("日"));
}

function drawDouiKubun(ctx: DrawerContext, box: Box, data: RyouyouhiDouishoDrawerData) {
  let [left, right] = b.splitToColumns(box, b.splitAt(leftColumnWidth));
  c.frameRight(ctx, left);
  c.drawText(ctx, "同意区分", left, "center", "center");
  r.renderRow(ctx, b.modify(right, b.shrinkHoriz(15, 0)),
    r.t("初回の同意"), r.t("　・　"), r.t("再　同　意"));
}

function drawShinsatuDate(ctx: DrawerContext, box: Box, data: RyouyouhiDouishoDrawerData) {
  let [left, right] = b.splitToColumns(box, b.splitAt(leftColumnWidth));
  c.frameRight(ctx, left);
  c.drawTextJustified(ctx, "診察日", b.modify(left, b.shrinkHoriz(3, 3)), "center");
  r.renderRow(ctx, b.modify(right, b.shrinkHoriz(20, 45)),
    r.t("令和"), r.gap(), r.t("年"), r.gap(), r.t("月"), r.gap(), r.t("日"));
}

function drawShoujou(ctx: DrawerContext, box: Box, data: RyouyouhiDouishoDrawerData) {
  let [left, right] = b.splitToColumns(box, b.splitAt(leftColumnWidth));
  c.frameRight(ctx, left);
  c.drawTextJustified(ctx, "症状", b.modify(left, b.shrinkHoriz(3, 3)), "center");
  let rows = b.splitToRows(right, b.splitWidths(10.5, 16));
  c.frameBottom(ctx, rows[0]);
  c.frameBottom(ctx, rows[1]);
  let middleWidth = 20;
  {
    let row = rows[0];
    let [keyBox, bodyBox] = b.splitToColumns(row, b.splitAt(middleWidth));
    c.frameRight(ctx, keyBox);
    {
      let [upper, lower] = b.splitToRows(b.modify(keyBox, b.shrinkVert(0.5, 0.5)), b.evenSplitter(2));
      c.drawTextJustified(ctx, "筋麻痺", b.modify(upper, b.shrinkHoriz(1.5, 1.5)), "center");
      c.drawTextJustified(ctx, "筋委縮", b.modify(lower, b.shrinkHoriz(1.5, 1.5)), "center");
    }
    r.renderRow(ctx, b.modify(bodyBox, b.shrinkHoriz(7, 18)),
      r.t("躯幹"), r.gap(), r.t("・"), r.gap(),
      r.t("右上肢"), r.gap(), r.t("・"), r.gap(),
      r.t("左上肢"), r.gap(), r.t("・"), r.gap(),
      r.t("右下肢"), r.gap(), r.t("・"), r.gap(),
      r.t("左下肢"));
  }
  {
    let row = rows[1];
    let [keyBox, bodyBox] = b.splitToColumns(row, b.splitAt(middleWidth));
    c.frameRight(ctx, keyBox);
    c.drawText(ctx, "関節拘縮", keyBox, "center", "center");
    let [upper, lower] = b.splitToRows(b.modify(bodyBox, b.shrinkVert(1.5, 1.5), b.shrinkHoriz(7, 0)), b.evenSplitter(2));
    r.renderRow(ctx, upper,
      r.t("右肩"), r.t("・"),
      r.t("右肘"), r.t("・"),
      r.t("右手首"), r.t("・"),
      r.t("右股関節"), r.t("・"),
      r.t("右膝"), r.t("・"),
      r.t("右足首"), r.t("　　"),
      r.t("その他"));
    r.renderRow(ctx, lower,
      r.t("左肩"), r.t("・"),
      r.t("左肘"), r.t("・"),
      r.t("左手首"), r.t("・"),
      r.t("左股関節"), r.t("・"),
      r.t("左膝"), r.t("・"),
      r.t("左足首"), r.t("　"),
      r.t("（　　　　　　）"));
  }
  {
        let row = rows[2];
    let [keyBox, bodyBox] = b.splitToColumns(row, b.splitAt(middleWidth));
    c.frameRight(ctx, keyBox);
    c.drawTextJustified(ctx, "その他", b.modify(keyBox, b.shrinkHoriz(1.5, 1.5)), "center");
  }
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

function drawOuryou(ctx: DrawerContext, box: Box, data: RyouyouhiDouishoDrawerData) {
  let [left, right] = b.splitToColumns(box, b.splitAt(leftColumnWidth));
  c.frameRight(ctx, left);
  c.drawTextJustified(ctx, "往療", b.modify(left, b.shrinkHoriz(3, 3)), "center");
}

function drawChuui(ctx: DrawerContext, box: Box, data: RyouyouhiDouishoDrawerData) {
  let [left, right] = b.splitToColumns(box, b.splitAt(leftColumnWidth));
  c.frameRight(ctx, left);
  c.drawText(ctx, "注意事項等", left, "center", "center");
}

function drawBottom(ctx: DrawerContext, box: Box, data: RyouyouhiDouishoDrawerData) {

}

