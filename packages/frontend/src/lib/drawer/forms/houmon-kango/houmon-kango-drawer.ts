import { mkDrawerContext, type DrawerContext } from "../../compiler/context";
import type { Op } from "../../compiler/op";
import { extendData, type HoumonKangoData } from "./houmon-kango-data";
import * as c from "../../compiler/compiler";
import * as b from "../../compiler/box";
import { mkBox, type Box } from "../../compiler/box";
import { A4 } from "../../compiler/paper-size";
import { createRenderer, createRendererData } from "../../compiler/create-renderer";

export function drawHoumonKango(data: HoumonKangoData): Op[] {
  extendData(data);
  const ctx = mkDrawerContext();
  const paper: Box = b.paperSizeToBox(A4);
  setupFonts(ctx);
  c.createPen(ctx, "regular", 0, 0, 0, 0.2);
  c.setPen(ctx, "regular");
  drawTitle(ctx, paper, data);
  c.setFont(ctx, "regular");
  drawSubtitle(ctx, paper, data);
  const mainBox = b.modify(paper, b.inset(16, 33, 19, 56));
  c.rect(ctx, mainBox);
  const rows: Box[] = b.splitToRows(mainBox, b.splitAt(
    8.5, 17, 27.5, 117.5, -75, -52, -42, -32.5, -18.5
  ));
  rows.forEach(row => c.rect(ctx, row));
  renderRow0(ctx, rows[0], data);
  renderRow1(ctx, rows[1], data);
  renderRow2(ctx, rows[2], data);
  renderRow3(ctx, rows[3], data);
  renderRow4(ctx, rows[4], data);
  renderRow5(ctx, rows[5], data);
  renderRow6(ctx, rows[6], data);
  renderRow7(ctx, rows[7], data);
  renderRow8(ctx, rows[8], data);
  renderRow9(ctx, rows[9], data);
  c.drawTextAt(ctx, "上記のとおり、指定訪問看護の実施を指示する。", mainBox.left, mainBox.bottom + 3,
    { halign: "left", valign: "top" });
  const addrBox = mkBox(
    mainBox.left + 75, mainBox.bottom + 10, mainBox.right, mainBox.bottom + 35
  );
  renderAddr(ctx, addrBox, data);
  const recipientBox = mkBox(
    mainBox.left, addrBox.bottom + 2, mainBox.right, addrBox.bottom + 6
  )
  c.drawComposite(ctx, recipientBox, [
    { kind: "gap", width: 70, mark: "提出先（訪問看護ステーション）" },
    { kind: "text", text: "殿" },
  ]);
  c.renderData(ctx, "提出先（訪問看護ステーション）", data["提出先（訪問看護ステーション）"], ropt({}));
  c.setFont(ctx, "input-regular");
  // console.log(createRendererData(ctx));
  // console.log(createRenderer(ctx));
  return c.getOps(ctx);
}

function setupFonts(ctx: DrawerContext) {
  c.createFont(ctx, "title", "MS Mincho", 5, "bold");
  c.createFont(ctx, "regular", "MS Mincho", 3.5);
  c.createFont(ctx, "small", "MS Mincho", 3);
  c.createFont(ctx, "input-regular", "MS Gothic", 3.5);
  c.createFont(ctx, "input-small", "MS Gothic", 3.0);
  c.createFont(ctx, "input-very-small", "MS Gothic", 2.5);
}

function drawTitle(ctx: DrawerContext, paper: Box, data: HoumonKangoData) {
  c.setFont(ctx, "title");
  const fontSize = c.currentFontSize(ctx);
  c.mark(ctx, "タイトル", b.modify(paper, b.setHeight(fontSize, "top"), b.shiftDown(13)));
  c.renderData(ctx, "タイトル", data["タイトル"], { font: "title", halign: "center", valign: "top" })
}

function drawSubtitle(ctx: DrawerContext, paper: Box, data: HoumonKangoData) {
  const fontSize = c.currentFontSize(ctx);
  let box = b.modify(paper, b.setTop(24), b.setHeight(fontSize, "top"), b.setRight(113));
  c.mark(ctx, "サブタイトル", box);
  c.renderData(ctx, "サブタイトル", data["サブタイトル"], { halign: "right" });
  box = b.modify(box, b.flipRight(), b.setRight(paper.right));
  c.drawComposite(ctx, box, [
    { kind: "text", text: "（" },
    { kind: "gap", width: fontSize * 2, mark: "訪問看護指示期間開始（元号）" },
    { kind: "gap", width: 7, mark: "訪問看護指示期間開始（年）" },
    { kind: "text", text: "年" },
    { kind: "gap", width: 4.5, mark: "訪問看護指示期間開始（月）" },
    { kind: "text", text: "月" },
    { kind: "gap", width: 4.5, mark: "訪問看護指示期間開始（日）" },
    { kind: "text", text: "日～" },
    { kind: "gap", width: fontSize * 2, mark: "訪問看護指示期間期限（元号）" },
    { kind: "gap", width: 7, mark: "訪問看護指示期間期限（年）" },
    { kind: "text", text: "年" },
    { kind: "gap", width: 4.5, mark: "訪問看護指示期間期限（月）" },
    { kind: "text", text: "月" },
    { kind: "gap", width: 4.5, mark: "訪問看護指示期間期限（日）" },
    { kind: "text", text: "日）" },
  ], { halign: "left", valign: "top" });
  c.renderData(ctx, "訪問看護指示期間開始（元号）", data["訪問看護指示期間開始（元号）"]);
  c.renderData(ctx, "訪問看護指示期間開始（年）", data["訪問看護指示期間開始（年）"], {
    font: "input-regular",
    halign: "right",
    modifiers: [b.shrinkHoriz(0, 0.5)]
  });
  c.renderData(ctx, "訪問看護指示期間開始（月）", data["訪問看護指示期間開始（月）"], {
    font: "input-regular",
    halign: "right",
    modifiers: [b.shrinkHoriz(0, 0.5)]
  });
  c.renderData(ctx, "訪問看護指示期間開始（日）", data["訪問看護指示期間開始（日）"], {
    font: "input-regular",
    halign: "right",
    modifiers: [b.shrinkHoriz(0, 0.5)]
  });
  c.renderData(ctx, "訪問看護指示期間期限（元号）", data["訪問看護指示期間期限（元号）"]);
  c.renderData(ctx, "訪問看護指示期間期限（年）", data["訪問看護指示期間期限（年）"], {
    font: "input-regular",
    halign: "right",
    modifiers: [b.shrinkHoriz(0, 0.5)]
  });
  c.renderData(ctx, "訪問看護指示期間期限（月）", data["訪問看護指示期間期限（月）"], {
    font: "input-regular",
    halign: "right",
    modifiers: [b.shrinkHoriz(0, 0.5)]
  });
  c.renderData(ctx, "訪問看護指示期間期限（日）", data["訪問看護指示期間期限（日）"], {
    font: "input-regular",
    halign: "right",
    modifiers: [b.shrinkHoriz(0, 0.5)]
  });
}

function ropt(opt: c.DataRendererOpt): c.DataRendererOpt {
  return Object.assign({ font: "input-regular" }, opt);
}

function renderRow0(ctx: DrawerContext, box: Box, data: HoumonKangoData) {
  const cols: Box[] = b.splitToColumns(box, b.splitAt(20, 83.5));
  cols.forEach(col => c.rect(ctx, col));
  {
    c.drawText(ctx, "患者氏名", cols[0], "left", "center", {
      modifiers: [b.shrinkHoriz(1.5, 0)]
    });
    const cc: Box[] = b.splitToColumns(cols[1], b.splitAt(55.5));
    c.mark(ctx, "患者氏名", cc[0]);
    c.drawText(ctx, "様", cc[1], "left", "center");
  }
  {
    const rr: Box[] = b.splitToRows(cols[2], b.evenSplitter(2));
    c.drawComposite(ctx, b.modify(rr[0], b.shrinkHoriz(1.5, 0)), [
      { kind: "text", text: "生年月日" },
      { kind: "gap", width: 3 },
      { kind: "text", text: "明", mark: "生年月日（元号：明治）" },
      { kind: "text", text: "・" },
      { kind: "text", text: "大", mark: "生年月日（元号：大正）" },
      { kind: "text", text: "・" },
      { kind: "text", text: "昭", mark: "生年月日（元号：昭和）" },
      { kind: "text", text: "・" },
      { kind: "text", text: "平", mark: "生年月日（元号：平成）" },
      { kind: "gap", width: 8, mark: "生年月日（年）" },
      { kind: "text", text: "年" },
      { kind: "gap", width: 8, mark: "生年月日（月）" },
      { kind: "text", text: "月" },
      { kind: "gap", width: 8, mark: "生年月日（日）" },
      { kind: "text", text: "日" },
    ], { valign: "center" });
    c.drawComposite(ctx, b.modify(rr[1], b.shrinkHoriz(62, 0)), [
      { kind: "text", text: "（" },
      { kind: "gap", width: 7, mark: "年齢" },
      { kind: "text", text: "歳）" },
    ], { valign: "center" })
  }
  c.renderData(ctx, "患者氏名", data["患者氏名"], ropt({ halign: "center" }));
  c.renderData(ctx, "生年月日（元号：明治）", data["生年月日（元号：明治）"], ropt({ circle: true }));
  c.renderData(ctx, "生年月日（元号：大正）", data["生年月日（元号：大正）"], ropt({ circle: true }));
  c.renderData(ctx, "生年月日（元号：昭和）", data["生年月日（元号：昭和）"], ropt({ circle: true }));
  c.renderData(ctx, "生年月日（元号：平成）", data["生年月日（元号：平成）"], ropt({ circle: true }));
  c.renderData(ctx, "生年月日（年）", data["生年月日（年）"],
    ropt({ halign: "right", modifiers: [b.shrinkHoriz(0, 0.5)] }));
  c.renderData(ctx, "生年月日（月）", data["生年月日（月）"],
    ropt({ halign: "right", modifiers: [b.shrinkHoriz(0, 0.5)] }));
  c.renderData(ctx, "生年月日（日）", data["生年月日（日）"],
    ropt({ halign: "right", modifiers: [b.shrinkHoriz(0, 0.5)] }));
  c.renderData(ctx, "年齢", data["年齢"],
    ropt({ halign: "right", modifiers: [b.shrinkHoriz(0, 0.5)] }));
}

function renderRow1(ctx: DrawerContext, box: Box, data: HoumonKangoData) {
  const cols: Box[] = b.splitToColumns(box, b.splitAt(20));
  c.rectAll(ctx, cols);
  c.drawText(ctx, "患者住所", cols[0], "left", "center", {
    modifiers: [b.shrinkHoriz(1.5, 0)]
  });
  c.mark(ctx, "患者住所", cols[1]);
  c.renderData(ctx, "患者住所", data["患者住所"], ropt({ modifiers: [b.shrinkHoriz(2, 0)] }));
}

function renderRow2(ctx: DrawerContext, box: Box, data: HoumonKangoData) {
  const cols: Box[] = b.splitToColumns(box, b.splitAt(29));
  c.rectAll(ctx, cols);
  c.drawText(ctx, "主たる傷病名", cols[0], "left", "center", {
    modifiers: [b.shrinkHoriz(1.5, 0)]
  });
  c.mark(ctx, "主たる傷病名", cols[1]);
  c.renderData(ctx, "主たる傷病名", data["主たる傷病名"], ropt({
    tryFonts: ["input-regular", "input-small"],
    modifiers: [b.inset(2, 1, 1, 1)],
    leading: 0.5,
  }))
}

function renderRow3(ctx: DrawerContext, box: Box, data: HoumonKangoData) {
  const cols: Box[] = b.splitToColumns(box, b.splitAt(8.5));
  c.rectAll(ctx, cols);
  c.drawTextVertically(ctx, "現在の状況・該当項目に〇等", cols[0], "center", "center", {
    interCharsSpace: 1.5
  });
  const rows: Box[] = b.splitToRows(cols[1], b.splitAt(12, 28, 42.5, 49.5, 56.5));
  renderRow3_0(ctx, rows[0], data);
  renderRow3_1(ctx, rows[1], data);
  renderRow3_2(ctx, rows[2], data);
  renderRow3_3(ctx, rows[3], data);
  renderRow3_4(ctx, rows[4], data);
  renderRow3_5(ctx, rows[5], data);
}

function renderRow3_0(ctx: DrawerContext, box: Box, data: HoumonKangoData) {
  const cols: Box[] = b.splitToColumns(box, b.splitAt(20.5));
  c.rectAll(ctx, cols);
  b.withSplitRows(b.modify(cols[0], b.inset(2)), b.evenSplitter(2), ([row0, row1]) => {
    c.drawText(ctx, "病状・治療", row0, "left", "center");
    c.drawText(ctx, "状態", row1, "left", "center");
  });
  c.mark(ctx, "病状", cols[1]);
  c.renderData(ctx, "病状", data["病状"], ropt({
    tryFonts: ["input-regular", "input-small"],
    modifiers: [b.inset(2, 1, 1, 1)],
    leading: 0.5,
  }))
}

function renderRow3_1(ctx: DrawerContext, box: Box, data: HoumonKangoData) {
  const cols: Box[] = b.splitToColumns(box, b.splitAt(20.5));
  c.rectAll(ctx, cols);
  b.withSplitRows(b.modify(cols[0], b.inset(2)), b.evenSplitter(3), (rows) => {
    c.drawText(ctx, "投与中の", rows[0], "left", "center");
    c.drawText(ctx, "薬剤の用", rows[1], "left", "center");
    c.drawText(ctx, "量・用法", rows[2], "left", "center");
  });
  c.mark(ctx, "薬剤", cols[1]);
  c.renderData(ctx, "薬剤", data["薬剤"], ropt({
    tryFonts: ["input-regular", "input-small"],
    modifiers: [b.inset(2, 1, 1, 1)],
    leading: 0.5,
  }))
}

function renderRow3_2(ctx: DrawerContext, box: Box, data: HoumonKangoData) {
  const cols: Box[] = b.splitToColumns(box, b.splitAt(20.5));
  c.rectAll(ctx, cols);
  b.withSplitRows(b.modify(cols[0], b.inset(2, 2, 2, 3)), b.evenSplitter(2), ([row0, row1]) => {
    c.drawText(ctx, "日常生活", row0, "left", "center");
    c.drawText(ctx, "自立度", row1, "left", "center");
  });
  b.withSplitRows(cols[1], b.evenSplitter(2), rows => {
    renderRow3_2_0(ctx, rows[0], data);
    renderRow3_2_1(ctx, rows[1], data);
  })
}

function renderRow3_2_0(ctx: DrawerContext, box: Box, data: HoumonKangoData) {
  const cols: Box[] = b.splitToColumns(box, b.splitAt(27.5));
  c.rectAll(ctx, cols);
  c.drawText(ctx, "寝たきり度", cols[0], "left", "center", {
    modifiers: [b.shrinkHoriz(1.5, 0)]
  });
  c.drawComposite(ctx, b.modify(cols[1], b.shrinkHoriz(5, 0)), [
    { kind: "text", text: "J1", mark: "寝たきり度(J1)" },
    { kind: "gap", width: 6 },
    { kind: "text", text: "J2", mark: "寝たきり度(J2)" },
    { kind: "gap", width: 6 },
    { kind: "text", text: "A1", mark: "寝たきり度(A1)" },
    { kind: "gap", width: 6 },
    { kind: "text", text: "A2", mark: "寝たきり度(A2)" },
    { kind: "gap", width: 6 },
    { kind: "text", text: "B1", mark: "寝たきり度(B1)" },
    { kind: "gap", width: 6 },
    { kind: "text", text: "B2", mark: "寝たきり度(B2)" },
    { kind: "gap", width: 6 },
    { kind: "text", text: "C1", mark: "寝たきり度(C1)" },
    { kind: "gap", width: 6 },
    { kind: "text", text: "C2", mark: "寝たきり度(C2)" },
  ]);
  c.renderData(ctx, "寝たきり度(J1)", data["寝たきり度(J1)"], ropt({ circle: true }));
  c.renderData(ctx, "寝たきり度(J2)", data["寝たきり度(J2)"], ropt({ circle: true }));
  c.renderData(ctx, "寝たきり度(A1)", data["寝たきり度(A1)"], ropt({ circle: true }));
  c.renderData(ctx, "寝たきり度(A2)", data["寝たきり度(A2)"], ropt({ circle: true }));
  c.renderData(ctx, "寝たきり度(B1)", data["寝たきり度(B1)"], ropt({ circle: true }));
  c.renderData(ctx, "寝たきり度(B2)", data["寝たきり度(B2)"], ropt({ circle: true }));
  c.renderData(ctx, "寝たきり度(C1)", data["寝たきり度(C1)"], ropt({ circle: true }));
  c.renderData(ctx, "寝たきり度(C2)", data["寝たきり度(C2)"], ropt({ circle: true }));
}

function renderRow3_2_1(ctx: DrawerContext, box: Box, data: HoumonKangoData) {
  const cols: Box[] = b.splitToColumns(box, b.splitAt(27.5));
  c.rectAll(ctx, cols);
  c.drawText(ctx, "認知症の状況", cols[0], "left", "center", {
    modifiers: [b.shrinkHoriz(1.5, 0)]
  });
  c.drawComposite(ctx, b.modify(cols[1], b.shrinkHoriz(5, 0)), [
    { kind: "text", text: "Ｉ", mark: "認知症の状況(Ｉ)" },
    { kind: "gap", width: 6 },
    { kind: "text", text: "IIa", mark: "認知症の状況(IIa)" },
    { kind: "gap", width: 6 },
    { kind: "text", text: "IIb", mark: "認知症の状況(IIb)" },
    { kind: "gap", width: 6 },
    { kind: "text", text: "IIIa", mark: "認知症の状況(IIIa)" },
    { kind: "gap", width: 6 },
    { kind: "text", text: "IIIb", mark: "認知症の状況(IIIb)" },
    { kind: "gap", width: 6 },
    { kind: "text", text: "IV", mark: "認知症の状況(IV)" },
    { kind: "gap", width: 6 },
    { kind: "text", text: "Ｍ", mark: "認知症の状況(Ｍ)" },
  ]);
  c.renderData(ctx, "認知症の状況(Ｉ)", data["認知症の状況(Ｉ)"], ropt({ circle: true }));
  c.renderData(ctx, "認知症の状況(IIa)", data["認知症の状況(IIa)"], ropt({ circle: true }));
  c.renderData(ctx, "認知症の状況(IIb)", data["認知症の状況(IIb)"], ropt({ circle: true }));
  c.renderData(ctx, "認知症の状況(IIIa)", data["認知症の状況(IIIa)"], ropt({ circle: true }));
  c.renderData(ctx, "認知症の状況(IIIb)", data["認知症の状況(IIIb)"], ropt({ circle: true }));
  c.renderData(ctx, "認知症の状況(IV)", data["認知症の状況(IV)"], ropt({ circle: true }));
  c.renderData(ctx, "認知症の状況(Ｍ)", data["認知症の状況(Ｍ)"], ropt({ circle: true }));
}

function renderRow3_3(ctx: DrawerContext, box: Box, data: HoumonKangoData) {
  const cols: Box[] = b.splitToColumns(box, b.splitAt(48));
  c.rectAll(ctx, cols);
  c.drawText(ctx, "要介護認定の状況", cols[0], "left", "center", {
    modifiers: [b.shrinkHoriz(2, 0)],
    interCharsSpace: 1.5,
  });
  c.drawComposite(ctx, b.modify(cols[1], b.shrinkHoriz(3.5, 0)), [
    { kind: "text", text: "自立", mark: "要介護認定の状況（自立）" },
    { kind: "gap", width: 6 },
    { kind: "text", text: "要支援（" },
    { kind: "text", text: "１", mark: "要介護認定の状況（要支援1）" },
    { kind: "gap", width: 3.5 },
    { kind: "text", text: "２", mark: "要介護認定の状況（要支援2）" },
    { kind: "text", text: "）" },
    { kind: "gap", width: 7.5 },
    { kind: "text", text: "要介護（" },
    { kind: "text", text: "１", mark: "要介護認定の状況（要介護1）" },
    { kind: "gap", width: 3 },
    { kind: "text", text: "２", mark: "要介護認定の状況（要介護2）" },
    { kind: "gap", width: 3 },
    { kind: "text", text: "３", mark: "要介護認定の状況（要介護3）" },
    { kind: "gap", width: 3 },
    { kind: "text", text: "４", mark: "要介護認定の状況（要介護4）" },
    { kind: "gap", width: 3 },
    { kind: "text", text: "５", mark: "要介護認定の状況（要介護5）" },
    { kind: "text", text: "）" },
  ]);
  c.renderData(ctx, "要介護認定の状況（自立）", data["要介護認定の状況（自立）"], ropt({ circle: true }));
  c.renderData(ctx, "要介護認定の状況（要支援1）", data["要介護認定の状況（要支援1）"], ropt({ circle: true }));
  c.renderData(ctx, "要介護認定の状況（要支援2）", data["要介護認定の状況（要支援2）"], ropt({ circle: true }));
  c.renderData(ctx, "要介護認定の状況（要介護1）", data["要介護認定の状況（要介護1）"], ropt({ circle: true }));
  c.renderData(ctx, "要介護認定の状況（要介護2）", data["要介護認定の状況（要介護2）"], ropt({ circle: true }));
  c.renderData(ctx, "要介護認定の状況（要介護3）", data["要介護認定の状況（要介護3）"], ropt({ circle: true }));
  c.renderData(ctx, "要介護認定の状況（要介護4）", data["要介護認定の状況（要介護4）"], ropt({ circle: true }));
  c.renderData(ctx, "要介護認定の状況（要介護5）", data["要介護認定の状況（要介護5）"], ropt({ circle: true }));
}

function renderRow3_4(ctx: DrawerContext, box: Box, data: HoumonKangoData) {
  const cols = b.splitToColumns(box, b.splitAt(48));
  c.rectAll(ctx, cols);
  c.drawText(ctx, "褥瘡の深さ", cols[0], "left", "center", {
    modifiers: [b.shrinkHoriz(2, 0)],
    interCharsSpace: 1.5,
  });
  c.drawComposite(ctx, b.modify(cols[1], b.shrinkHoriz(3.5, 0)), [
    { kind: "text", text: "NPUAP分類" },
    { kind: "gap", width: 6 },
    { kind: "text", text: "III度", mark: "褥瘡の深さ(3)" },
    { kind: "gap", width: 2 },
    { kind: "text", text: "IV度", mark: "褥瘡の深さ(4)" },
    { kind: "gap", width: 6 },
    { kind: "text", text: "DESIGN分類" },
    { kind: "gap", width: 2 },
    { kind: "text", text: "D3", mark: "褥瘡の深さ(D3)" },
    { kind: "gap", width: 3 },
    { kind: "text", text: "D4", mark: "褥瘡の深さ(D4)" },
    { kind: "gap", width: 3 },
    { kind: "text", text: "D5", mark: "褥瘡の深さ(D5)" },
  ]);
  c.renderData(ctx, "褥瘡の深さ(3)", data["褥瘡の深さ(3)"], ropt({ circle: true }));
  c.renderData(ctx, "褥瘡の深さ(4)", data["褥瘡の深さ(4)"], ropt({ circle: true }));
  c.renderData(ctx, "褥瘡の深さ(D3)", data["褥瘡の深さ(D3)"], ropt({ circle: true }));
  c.renderData(ctx, "褥瘡の深さ(D4)", data["褥瘡の深さ(D4)"], ropt({ circle: true }));
  c.renderData(ctx, "褥瘡の深さ(D5)", data["褥瘡の深さ(D5)"], ropt({ circle: true }));
}

function renderRow3_5(ctx: DrawerContext, box: Box, data: HoumonKangoData) {
  const cols = b.splitToColumns(box, b.splitAt(23.5));
  c.rectAll(ctx, cols);
  c.drawTexts(ctx, ["装着・使用", "医療機器等"], b.modify(cols[0], b.inset(2)),
    { halign: "left", valign: "center", valignChunk: "center", leading: 2 });
  const rows = b.splitToRows(b.modify(cols[1], b.inset(2)), b.evenSplitter(7));
  c.drawComposite(ctx, rows[0], [
    { kind: "text", text: "１", mark: "自動腹膜灌流装置" },
    { kind: "text", text: "．自動腹膜灌流装置" },
    { kind: "gap-to", at: 46 },
    { kind: "text", text: "２", mark: "透析液供給装置" },
    { kind: "text", text: "．透析液供給装置" },
    { kind: "gap-to", at: 90 },
    { kind: "text", text: "３", mark: "酸素療法" },
    { kind: "text", text: "．酸素療法（" },
    { kind: "gap", width: 12, mark: "酸素療法流速" },
    { kind: "text", text: "/min）" },
  ]);
  c.renderData(ctx, "自動腹膜灌流装置", data["自動腹膜灌流装置"], ropt({ circle: true }));
  c.renderData(ctx, "透析液供給装置", data["透析液供給装置"], ropt({ circle: true }));
  c.renderData(ctx, "酸素療法", data["酸素療法"], ropt({ circle: true }));
  c.renderData(ctx, "酸素療法流速", data["酸素療法流速"], ropt({
    halign: "right", modifiers: [b.shrinkHoriz(0, 0.5)]
  }));

  c.drawComposite(ctx, rows[1], [
    { kind: "text", text: "４", mark: "吸引器" },
    { kind: "text", text: "．吸引器" },
    { kind: "gap-to", at: 46 },
    { kind: "text", text: "５", mark: "中心静脈栄養" },
    { kind: "text", text: "．中心静脈栄養" },
    { kind: "gap-to", at: 90 },
    { kind: "text", text: "６", mark: "輸液ポンプ" },
    { kind: "text", text: "．輸液ポンプ" },
  ]);
  c.renderData(ctx, "吸引器", data["吸引器"], ropt({ circle: true }));
  c.renderData(ctx, "中心静脈栄養", data["中心静脈栄養"], ropt({ circle: true }));
  c.renderData(ctx, "輸液ポンプ", data["輸液ポンプ"], ropt({ circle: true }));

  const row2 = rows[2];
  let pos1: number = 0;
  let pos2: number = 0;
  let pos3: number = 0;
  c.drawComposite(ctx, row2, [
    { kind: "text", text: "７", mark: "経管栄養" },
    { kind: "text", text: "．経管栄養（" },
    { kind: "text", text: "経鼻", mark: "経管栄養経鼻" },
    { kind: "text", text: "・" },
    { kind: "text", text: "胃ろう", mark: "経管栄養胃ろう" },
    { kind: "text", text: "：チューブサイズ" },
    { kind: "gap", width: 21, callback: (box) => { pos1 = box.right - row2.left }, mark: "経管栄養チューブサイズ" },
    { kind: "text", text: "、" },
    { kind: "gap", width: 15, callback: (box) => { pos2 = box.right - row2.left }, mark: "経管栄養交換日" },
    { kind: "text", text: "日に１回交換" },
    { kind: "gap", width: 0, callback: (box) => { pos3 = box.right - row2.left } },
    { kind: "text", text: "）" },
  ]);
  c.renderData(ctx, "経管栄養", data["経管栄養"], ropt({ circle: true }));
  c.renderData(ctx, "経管栄養経鼻", data["経管栄養経鼻"], ropt({ circle: true }));
  c.renderData(ctx, "経管栄養胃ろう", data["経管栄養胃ろう"], ropt({ circle: true }));
  c.renderData(ctx, "経管栄養チューブサイズ", data["経管栄養チューブサイズ"], ropt({
    halign: "right", modifiers: [b.shrinkHoriz(0, 0.5)]
  }));
  c.renderData(ctx, "経管栄養交換日", data["経管栄養交換日"], ropt({
    halign: "right", modifiers: [b.shrinkHoriz(0, 0.5)]
  }));

  c.drawComposite(ctx, rows[3], [
    { kind: "text", text: "８", mark: "留置カテーテル" },
    { kind: "text", text: "．留置カテーテル（サイズ" },
    { kind: "gap-to", at: pos1, mark: "留置カテーテルサイズ" },
    { kind: "text", text: "、" },
    { kind: "gap-to", at: pos2, mark: "留置カテーテル交換日" },
    { kind: "text", text: "日に１回交換）" },
  ]);
  c.renderData(ctx, "留置カテーテル", data["留置カテーテル"], ropt({ circle: true }));
  c.renderData(ctx, "留置カテーテルサイズ", data["留置カテーテルサイズ"], ropt({
    halign: "right", modifiers: [b.shrinkHoriz(0, 0.5)]
  }));
  c.renderData(ctx, "留置カテーテル交換日", data["留置カテーテル交換日"], ropt({
    halign: "right", modifiers: [b.shrinkHoriz(0, 0.5)]
  }));


  c.drawComposite(ctx, rows[4], [
    { kind: "text", text: "９", mark: "人工呼吸器" },
    { kind: "text", text: "．人工呼吸器（" },
    { kind: "text", text: "陽圧式", mark: "人工呼吸器陽圧式" },
    { kind: "text", text: "・" },
    { kind: "text", text: "陰圧式", mark: "人工呼吸器陰圧式" },
    { kind: "text", text: "：設定" },
    { kind: "gap-to", at: pos3, mark: "人工呼吸器設定" },
    { kind: "text", text: "）" },
  ]);
  c.renderData(ctx, "人工呼吸器", data["人工呼吸器"], ropt({ circle: true }));
  c.renderData(ctx, "人工呼吸器陽圧式", data["人工呼吸器陽圧式"], ropt({ circle: true }));
  c.renderData(ctx, "人工呼吸器陰圧式", data["人工呼吸器陰圧式"], ropt({ circle: true }));
  c.renderData(ctx, "人工呼吸器設定", data["人工呼吸器設定"], ropt({
    halign: "left", modifiers: [b.shrinkHoriz(0.5, 0.5)]
  }));


  c.drawComposite(ctx, rows[5], [
    { kind: "text", text: "１０", mark: "気管カニューレ" },
    { kind: "text", text: "．気管カニューレ（サイズ" },
    { kind: "gap", width: 11, mark: "気管カニューレサイズ" },
    { kind: "text", text: "）" },
  ]);
  c.renderData(ctx, "気管カニューレ", data["気管カニューレ"], ropt({ circle: true }));
  c.renderData(ctx, "気管カニューレサイズ", data["気管カニューレサイズ"], ropt({
    halign: "left", modifiers: [b.shrinkHoriz(0.5, 0.5)]
  }));

  c.drawComposite(ctx, rows[6], [
    { kind: "text", text: "１１", mark: "人工肛門" },
    { kind: "text", text: "．人工肛門" },
    { kind: "gap", width: 18 },
    { kind: "text", text: "１２", mark: "人工膀胱" },
    { kind: "text", text: "．人工膀胱" },
    { kind: "gap", width: 10 },
    { kind: "text", text: "１３", mark: "装置その他マーク" },
    { kind: "text", text: "．その他（" },
    { kind: "gap-to", at: pos3, mark: "装置その他" },
    { kind: "text", text: "）" },
  ]);
  c.renderData(ctx, "人工肛門", data["人工肛門"], ropt({ circle: true }));
  c.renderData(ctx, "人工膀胱", data["人工膀胱"], ropt({ circle: true }));
  c.renderData(ctx, "装置その他マーク", data["装置その他マーク"], ropt({ circle: true }));
  c.renderData(ctx, "装置その他", data["装置その他"], ropt({
    halign: "left", modifiers: [b.shrinkHoriz(0.5, 0.5)]
  }));
}

function renderRow4(ctx: DrawerContext, box: Box, data: HoumonKangoData) {
  const rows = b.splitToRows(box, b.evenSplitter(2));
  let w1: number = 0;
  let w2: number = 0;
  c.drawComposite(ctx, b.modify(rows[0], b.shrinkHoriz(2, 0)), [
    { kind: "text", text: "留意事項及び指示事項" },
    { kind: "gap", width: 0, callback: (box) => { w1 = box.left } },
  ])
  c.drawComposite(ctx, b.modify(rows[1], b.shrinkHoriz(2, 0)), [
    { kind: "text", text: "Ⅰ療養生活指導上の留意事項" },
    { kind: "gap", width: 0, callback: (box) => { w2 = box.left } },
  ]);
  const m = b.modify(box, b.setLeft(Math.max(w1, w2) + 3));
  c.mark(ctx, "留意事項", m);
  c.renderData(ctx, "留意事項", data["留意事項"], ropt({
    modifiers: [b.inset(2)], paragraph: true, leading: 1
  }))
}

function renderRow5(ctx: DrawerContext, box: Box, data: HoumonKangoData) {
  function labelMark(box: Box, num: string, label: string, markKey: string) {
    c.drawComposite(ctx, box, [
      { kind: "text", text: num, mark: `${markKey}マーク` },
      { kind: "text", text: `．${label}` },
      { kind: "gap-to", at: "end", mark: markKey },
    ])
  }
  const cols = b.splitToColumns(box, b.splitAt(8.5));
  b.withSplitRows(cols[0], b.evenSplitter(4), ([box]) => {
    c.drawText(ctx, "Ⅱ", box, "left", "center", {
      modifiers: [b.shrinkHoriz(2, 0)]
    });
  });
  b.withSplitRows(cols[1], b.evenSplitter(4), rows => {
    labelMark(rows[0], "１", "リハビリテーション", "留意事項：リハビリテーション");
    labelMark(rows[1], "２", "褥瘡の処置など", "留意事項：褥瘡の処置など");
    labelMark(rows[2], "３", "装置・使用機器等の操作援助・管理", "留意事項：装置");
    labelMark(rows[3], "４", "その他", "留意事項：その他");
  });
  c.renderData(ctx, "留意事項：リハビリテーション", data["留意事項：リハビリテーション"], ropt({
    tryFonts: ["input-regular", "input-small", "input-very-samll"],
    valign: "center", modifiers: [b.shrinkHoriz(1, 1)]
  }));
  c.renderData(ctx, "留意事項：褥瘡の処置など", data["留意事項：褥瘡の処置など"], ropt({
    tryFonts: ["input-regular", "input-small", "input-very-samll"],
    valign: "center", modifiers: [b.shrinkHoriz(1, 1)]
  }));
  c.renderData(ctx, "留意事項：装置", data["留意事項：装置"], ropt({
    tryFonts: ["input-regular", "input-small", "input-very-samll"],
    valign: "center", modifiers: [b.shrinkHoriz(1, 1)]
  }));
  c.renderData(ctx, "留意事項：その他", data["留意事項：その他"], ropt({
    tryFonts: ["input-regular", "input-small", "input-very-samll"],
    valign: "center", modifiers: [b.shrinkHoriz(1, 1)]
  }));

}

function renderRow6(ctx: DrawerContext, box: Box, data: HoumonKangoData) {
  b.withSplitRows(box, b.evenSplitter(2), rows => {
    c.drawText(ctx, "在宅患者訪問点滴注射に関する指示（投与薬剤・投与量・投与方法等）", rows[0],
      "left", "center", { modifiers: [b.shrinkHoriz(2, 0)] });
    c.mark(ctx, "点滴指示", rows[1]);
  })
  c.renderData(ctx, "点滴指示", data["点滴指示"], ropt({
    modifiers: [b.shrinkHoriz(2, 1)],
    tryFonts: ["input-regular", "input-small"]
  }))
}

function renderRow7(ctx: DrawerContext, box: Box, data: HoumonKangoData) {
  function labelMark(box: Box, label: string, mark: string) {
    c.drawComposite(ctx, box, [
      { kind: "gap", width: 2 },
      { kind: "text", text: label },
      { kind: "gap", width: 3 },
      { kind: "gap-to", at: "end", mark },
    ])
  }

  b.withSplitRows(box, b.evenSplitter(2), rows => {
    labelMark(rows[0], "緊急時の連絡先", "緊急時の連絡先");
    labelMark(rows[1], "不在時の対応法", "不在時の対応法");
  });
  c.renderData(ctx, "緊急時の連絡先", data["緊急時の連絡先"], ropt({
    modifiers: [b.shrinkHoriz(2, 1)]
  }));
  c.renderData(ctx, "不在時の対応法", data["不在時の対応法"], ropt({
    modifiers: [b.shrinkHoriz(2, 1)]
  }));

}

function renderRow8(ctx: DrawerContext, box: Box, data: HoumonKangoData) {
  b.withSplitRows(b.modify(box, b.shrinkHoriz(2, 0)), b.evenSplitter(3), rows => {
    const fontSave = c.getCurrentFont(ctx);
    let pos: number = 0;
    c.drawComposite(ctx, rows[0], [
      { kind: "text", text: "特記すべき留意事項" },
      { kind: "gap", width: 0, callback: (box) => { pos = box.left } },
    ])
    c.setFont(ctx, "small");
    c.drawText(ctx, "（注：薬の相互作用・副作用についての留意点、薬物アレルギーの既往、定期巡回・随時対応型訪問",
      b.modify(rows[0], b.setLeft(pos)), "left", "center");
    c.drawText(ctx, "介護看護及び複合型サービス利用時の留意事項等があれば記載して下さい。）",
      rows[1], "left", "center");
    c.mark(ctx, "特記すべき留意事項", rows[2]);
    c.setFont(ctx, fontSave);
    c.renderData(ctx, "特記すべき留意事項", data["特記すべき留意事項"], ropt({
      modifiers: [b.shrinkHoriz(2, 2)]
    }))
  })
}

function renderRow9(ctx: DrawerContext, box: Box, data: HoumonKangoData) {
  b.withSplitRows(b.modify(box, b.shrinkHoriz(2, 0)), b.evenSplitter(4), rows => {
    const right = b.width(rows[0]) - 15;
    c.drawText(ctx, "他の訪問看護ステーションへの指示", rows[0], "left", "center");
    c.drawComposite(ctx, rows[1], [
      { kind: "gap", width: 10 },
      { kind: "text", text: "（" },
      { kind: "text", text: "無", mark: "他の訪問看護ステーションへの指示：無" },
      { kind: "text", text: "　" },
      { kind: "text", text: "有", mark: "他の訪問看護ステーションへの指示：有" },
      { kind: "text", text: "：指定訪問看護ステーション名" },
      { kind: "gap-to", at: right, mark: "他の訪問看護ステーションへの指示：ステーション名" },
      { kind: "text", text: "）" },
    ])
    c.renderData(ctx, "他の訪問看護ステーションへの指示：無", data["他の訪問看護ステーションへの指示：無"], ropt({ circle: true }));
    c.renderData(ctx, "他の訪問看護ステーションへの指示：有", data["他の訪問看護ステーションへの指示：有"], ropt({ circle: true }));
    c.renderData(ctx, "他の訪問看護ステーションへの指示：ステーション名", data["他の訪問看護ステーションへの指示：ステーション名"], ropt({
      modifiers: [b.shrinkHoriz(2, 1)]
    }));
    c.drawText(ctx, "たんの吸引等実施のための訪問介護事業所への指示", rows[2], "left", "center");
    c.drawComposite(ctx, rows[3], [
      { kind: "gap", width: 10 },
      { kind: "text", text: "（" },
      { kind: "text", text: "無", mark: "たんの吸引等実施のための訪問介護事業所への指示：無" },
      { kind: "text", text: "　" },
      { kind: "text", text: "有", mark: "たんの吸引等実施のための訪問介護事業所への指示：有" },
      { kind: "text", text: "：指定訪問介護事業所名" },
      { kind: "gap-to", at: right, mark: "たんの吸引等実施のための訪問介護事業所への指示：指定訪問介護事業所名" },
      { kind: "text", text: "）" },
    ])
    c.renderData(ctx, "たんの吸引等実施のための訪問介護事業所への指示：無", data["たんの吸引等実施のための訪問介護事業所への指示：無"], ropt({}));
    c.renderData(ctx, "たんの吸引等実施のための訪問介護事業所への指示：有", data["たんの吸引等実施のための訪問介護事業所への指示：有"], ropt({}));
    c.renderData(ctx, "たんの吸引等実施のための訪問介護事業所への指示：指定訪問介護事業所名",
      data["たんの吸引等実施のための訪問介護事業所への指示：指定訪問介護事業所名"],
      ropt({ modifiers: [b.shrinkHoriz(2, 1)] }));
  });
}

function renderAddr(ctx: DrawerContext, box: Box, data: HoumonKangoData) {
  const fontSize = c.currentFontSize(ctx);
  function renderIssueDate(box: Box) {
    c.drawComposite(ctx, box, [
      { kind: "gap", width: fontSize * 4 },
      { kind: "gap", width: fontSize * 2, mark: "発行日（元号）" },
      { kind: "gap", width: 9, mark: "発行日（年）" },
      { kind: "text", text: "年" },
      { kind: "gap", width: 6, mark: "発行日（月）" },
      { kind: "text", text: "月" },
      { kind: "gap", width: 6, mark: "発行日（日）" },
      { kind: "text", text: "日" },
    ])
  }
  function withSplitBox(box: Box, f: (box1: Box, box2: Box) => void) {
    const cols = b.splitToColumns(box, b.splitWidths(fontSize * 5, fontSize));
    f(cols[0], cols[2]);
  }
  b.withSplitRows(box, b.evenSplitter(6), rows => {
    renderIssueDate(rows[0]);
    withSplitBox(rows[1], (label, value) => {
      c.drawText(ctx, "医療機関名", label, "left", "center");
      c.mark(ctx, "医療機関名", value);
    })
    withSplitBox(rows[2], (label, value) => {
      c.drawTextJustified(ctx, "住所", label, "center");
      c.mark(ctx, "医療機関（住所）", value);
    })
    withSplitBox(rows[3], (label, value) => {
      c.drawTextJustified(ctx, "電話", label, "center");
      c.mark(ctx, "医療機関（電話）", value);
    })
    withSplitBox(rows[4], (label, value) => {
      c.drawText(ctx, "（ＦＡＸ）", label, "left", "center");
      c.mark(ctx, "医療機関（ＦＡＸ）", value);
    })
    withSplitBox(rows[5], (label, value) => {
      c.drawTextJustified(ctx, "医師氏名", label, "center");
      c.drawComposite(ctx, value, [
        { kind: "gap", width: 70, mark: "医師氏名" },
        { kind: "text", text: "印" },
      ])
    })
  });
  c.renderData(ctx, "発行日（元号）", data["発行日（元号）"], ropt({
    font: "regular"
  }));
  c.renderData(ctx, "発行日（年）", data["発行日（年）"], ropt({}));
  c.renderData(ctx, "発行日（月）", data["発行日（月）"], ropt({}));
  c.renderData(ctx, "発行日（日）", data["発行日（日）"], ropt({}));
  c.renderData(ctx, "医療機関名", data["医療機関名"], ropt({}));
  c.renderData(ctx, "医療機関（住所）", data["医療機関（住所）"], ropt({}));
  c.renderData(ctx, "医療機関（電話）", data["医療機関（電話）"], ropt({}));
  c.renderData(ctx, "医療機関（ＦＡＸ）", data["医療機関（ＦＡＸ）"], ropt({}));
  c.renderData(ctx, "医師氏名", data["医師氏名"], ropt({}));
}
