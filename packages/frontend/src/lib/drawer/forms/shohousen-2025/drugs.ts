import type { Box } from "@/lib/drawer/compiler/box";
import * as b from "@/lib/drawer/compiler/box";
import * as c from "@/lib/drawer/compiler/compiler";
import { type DrawerContext } from "@/lib/drawer/compiler/context";
import type { ShohousenData2025 } from "./data2025";
import { colOfElements, drawElement, fixedElement, stackedTexts, textElement } from "./element";
import { brackettedElement, } from "./helper";

export interface DrugBoxes {
  col1: Box;
  col2: Box;
  drugs: Box;
}

export function drawDrugs(ctx: DrawerContext, box: Box, _data: ShohousenData2025): DrugBoxes {
  c.frame(ctx, box);
  const [mark, col1, col2, body] = b.splitToColumns(box, b.splitAt(5, 18, 31));
  c.frameRight(ctx, mark);
  c.frameRight(ctx, col1);
  c.frameRight(ctx, col2);
  drawMark(ctx, mark);
  let [col1Label, col1Body] = b.splitToRows(col1, b.splitAt(6));
  let [col2Label, col2Body] = b.splitToRows(col2, b.splitAt(6));
  drawCol1Label(ctx, col1Label);
  drawCol2Label(ctx, col2Label);
  let h = drawBodyLabel(ctx, body);
  let labelHeight = Math.max(b.height(col1Label), b.height(col2Label), h);
  let workHeight = b.height(box) - labelHeight - 0.5;
  return {
    col1: b.modify(col1Body, b.setHeight(workHeight, "bottom")),
    col2: b.modify(col2Body, b.setHeight(workHeight, "bottom")),
    drugs: b.modify(body, b.setHeight(workHeight, "bottom")),
  }
}

function drawMark(ctx: DrawerContext, box: Box) {
  const innerBox = b.modify(box, b.setHeight(28, "center"))
  c.drawTextJustifiedVertically(ctx, "処方", innerBox, "center");
}

function drawCol1Label(ctx: DrawerContext, box: Box) {
  c.frameBottom(ctx, box);
  let ele = colOfElements([
    textElement("変更不可"),
    textElement("(医療上必要)", { font: "f1.5" }),
  ]);
  drawElement(ctx, box, ele);
}

function drawCol2Label(ctx: DrawerContext, box: Box) {
  c.frameBottom(ctx, box);
  c.drawText(ctx, "患者希望", box, "center", "center");
}

function drawBodyLabel(ctx: DrawerContext, box: Box): number {
  const texts = stackedTexts([
    "個々の処方薬について、医療上の必要性があるため、後発医薬品（ジェネリック医薬品）",
    "への変更に差し支えがあると判断した場合には、「変更不可」欄に 「✓」又は「×」を記",
    "載し、「保険医署名」 欄に署名又は記名・押印すること。また、患者の希望を踏まえ、先",
    "発医薬品を処方した場合には、「患者希望」欄に「✓」又は「×」を記載すること。",
  ], { font: "f2.3" });
  let bra = brackettedElement(texts, { pen: "thin" });
  let content = colOfElements([
    fixedElement(0, 0.4),
    bra,
    fixedElement(0, 0.4),
  ]);
  let rendered = drawElement(ctx, box, content, { valign: "top" });
  return b.height(rendered);
}




