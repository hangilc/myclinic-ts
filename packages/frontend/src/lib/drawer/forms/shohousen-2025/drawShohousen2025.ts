import { type Op } from "@/lib/drawer/compiler/op";
import { type ShohousenData2025} from "./data2025";
import { A5 } from "@/lib/drawer/compiler/paper-size";
import * as b from "@/lib/drawer/compiler/box";
import { mkDrawerContext, type DrawerContext } from "@/lib/drawer/compiler/context";
import * as c from "@/lib/drawer/compiler/compiler";
import { mkBox, type Box } from "@/lib/drawer/compiler/box";
import * as x from "./xsplit";
import { drawUpperRow } from "./upper-row";
import { drawKanja } from "./kanja";
import { drawKoufuDate } from "./koufu-date";
import { drawDrugs, type DrugBoxes } from "./drugs";
import { drawBikou } from "./bikou";
import { drawKouhi2 } from "./kouhi2";
import { drawPharma } from "./pharma";
import { breakShohouPages, drawShohouLines, shohouToLines, totalLinesOfShohouLines, type ShohouLinesBoxes } from "./drug-helper";
import { availableLines, black, red } from "./helper";


export function drawShohousen2025(data: ShohousenData2025): Op[][] {
  const ctx = mkDrawerContext(ctx => {
    initFont(ctx);
    initPen(ctx);
  });
  let page = drawPage(ctx, data);
  if( data.shohou){
    let font = "d3.5";
    let leading = 0;
    let fontSize = c.getFontSizeOf(ctx, "d3.5");
    let indexDigits = data.shohou.groups.length < 10 ? 1 : 2;
    let indexWidth = fontSize * (indexDigits + 1);
    let drugWidth = b.width(page.drugs) - indexWidth;
    let lines = shohouToLines(data.shohou, fontSize, drugWidth);
    let drugHeight = b.height(page.drugs);
    let availLines = availableLines(drugHeight, fontSize, leading);
    let totalLines = totalLinesOfShohouLines(lines);
    let [indexCol, drugText] = b.splitToColumns(page.drugs, b.splitAt(indexWidth));
    let boxes: ShohouLinesBoxes = Object.assign({}, page, {
      indexCol, drugText,
    })
    if( totalLines <= availLines) {
      let dy = drawShohouLines(ctx, boxes, lines, font, leading);
      c.withFontAndColor(ctx, font, black, () => {
        c.drawText(ctx, "--- 以下余白 ---", page.drugs, "left", "top", { dy });
      })
    } else {
      let pageHeight = b.height(page.drugs) - (fontSize + leading);
      let shohouPages = breakShohouPages(lines, fontSize, leading, pageHeight);
      for(let i=0;i<shohouPages.length;i++){
        if( i !== 0 ){
          page = drawPage(ctx, data);
          boxes = Object.assign({}, page, {
            indexCol, drugText,
          })
        }
        let dy = drawShohouLines(ctx, boxes, shohouPages[i], font, leading);
        if( i !== (shohouPages.length - 1) ){
          const text = `--- 次ページに続く　（${i+1} / ${shohouPages.length}） ---`;
          c.withFontAndColor(ctx, font, red, () => {
            c.drawText(ctx, text, page.drugs, "left", "top", { dy });
          });
          c.newPage(ctx);
        } else {
          c.withFontAndColor(ctx, font, black, () => {
            c.drawText(ctx, "--- 以下余白 ---", page.drugs, "left", "top", { dy });
          })
        }
      }
    }
  }
  return ctx.pages;
}

export function drawPage(ctx: DrawerContext, data: ShohousenData2025): DrugBoxes {
  const paper: Box = mkBox(0, 0, A5.width, A5.height);
  c.setFont(ctx, "f2.5");
  c.setTextColor(ctx, 0, 255, 0);
  c.setPen(ctx, "default");
  const outerBounds = b.modify(paper, b.inset(3));
  const innerBounds = b.modify(outerBounds, b.inset(1, 0, 1, 1));
  let [title1, title2, main] = b.splitToRows(innerBounds, b.splitWidths(6, 2));
  c.withFont(ctx, "f4", () => c.drawText(ctx, "処方箋", title1, "center", "center"));
  c.drawText(ctx, "(この処方箋は、どの保険薬局でも有効です。)", title2, "center", "center");
  c.frame(ctx, outerBounds);
  main = b.modify(main, b.inset(2, 3, 2, 0))
  let [upperRow, _ignore1, kanjaRow, koufuDateRow, drugsRow,
    bikouRow, kouhi2Row, pharmaRow] =
      b.splitToRows(main, x.split(x.fixed(20), x.skip(3), x.fixed(33), x.fixed(10),
        x.gap(), x.fixed(20), x.fixed(10), x.fixed(10)))
  drawUpperRow(ctx, upperRow, data);
  drawKanja(ctx, kanjaRow, data);
  drawKoufuDate(ctx, koufuDateRow, data);
  let drugBoxes = drawDrugs(ctx, drugsRow, data);
  drawBikou(ctx, bikouRow, data);
  drawKouhi2(ctx, kouhi2Row, data);
  drawPharma(ctx, pharmaRow, data);
  return drugBoxes;
}

function initFont(ctx: DrawerContext) {
  c.createFont(ctx, "f4", "MS Mincho", 4);
  c.createFont(ctx, "f2.5", "MS Mincho", 2.5);
  c.createFont(ctx, "f2.3", "MS Mincho", 2.3);
  c.createFont(ctx, "f1.8", "MS Mincho", 1.8);
  c.createFont(ctx, "f1.5", "MS Mincho", 1.5);
  c.createFont(ctx, "d6", "MS Gothic", 6);
  c.createFont(ctx, "d5", "MS Gothic", 5);
  c.createFont(ctx, "d4", "MS Gothic", 4);
  c.createFont(ctx, "d3.5", "MS Gothic", 3.5);
  c.createFont(ctx, "d3", "MS Gothic", 3);
  c.createFont(ctx, "d2.5", "MS Gothic", 2.5);
}

function initPen(ctx: DrawerContext) {
  c.createPen(ctx, "default", 0, 255, 0, 0.25);
  c.createPen(ctx, "thin", 0, 255, 0, 0.1);
  c.createPen(ctx, "data-thin", 0, 0, 0, 0.1);
}
