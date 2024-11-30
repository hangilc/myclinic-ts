import { mkDrawerContext, type DrawerContext } from "../../compiler/context";
import type { Op } from "../../compiler/op";
import type { ShohousenData2024 } from "./shohousenData2024";
import * as c from "../../compiler/compiler";
import * as b from "../../compiler/box";
import { A5 } from "../../compiler/paper-size";
import type { Box } from "../../compiler/box";
import * as blk from "../../compiler/block";
import { drawLeftSquareBracket, drawRightSquareBracket } from "../../compiler/drawing";

export function drawShohousen2024(data: ShohousenData2024): Op[] {
  const ctx = mkDrawerContext();
  initFont(ctx);
  initPen(ctx);
  c.setFont(ctx, "f2.5");
  c.setPen(ctx, "default");
  const paper = b.mkBox(0, 0, A5.width, A5.height);
  const bounds = b.modify(paper, b.inset(3));
  c.frame(ctx, bounds);
  let box = b.withSlice(bounds, 6, box => drawTitle(ctx, b.modify(box, b.setWidth(30, "center"))));
  box = b.withSlice(box, 2.5, (box) => {
    c.drawText(ctx, "(この処方箋は、どの保険薬局でも有効です。)", box, "center", "center");
  });
  box = b.modify(bounds, b.inset(2, 13, 2, 13));
  const [upperBox, _, lowerBox] = b.splitToRows(box, b.splitAt(20, 22));
  drawUpperBox(ctx, upperBox);
  drawLowerBox(ctx, lowerBox);
  return c.getOps(ctx);
}

function initFont(ctx: DrawerContext) {
  c.createFont(ctx, "f4", "MS Mincho", 4);
  c.createFont(ctx, "f2.5", "MS Mincho", 2.5);
  c.createFont(ctx, "f2.3", "MS Mincho", 2.3);
  c.createFont(ctx, "f1.5", "MS Mincho", 1.5);
}

function initPen(ctx: DrawerContext) {
  c.createPen(ctx, "default", 0, 0, 0, 0.25);
  c.createPen(ctx, "thin", 40, 40, 40, 0.1);
}

function drawTitle(ctx: DrawerContext, box: Box) {
  const block = blk.justifiedText(ctx, "処方箋", b.width(box), "f4");
  blk.putIn(ctx, block, box, "center", "center");
}

function drawUpperBox(ctx: DrawerContext, box: Box) {
  c.frame(ctx, box);
  let [row1, row2] = b.splitToRows(box, b.evenSplitter(2));
  c.frameBottom(ctx, row1);
  const cellSize = 5;
  { // upper row
    const [cell1, cell2] = b.splitToColumns(row1, b.evenSplitter(2));
    c.frameRight(ctx, cell1);
    { // cell1
      const [c1, c2] = b.splitToColumns(cell1, blk.splitByExtent(["*", cellSize * 8]));
      c.frameRight(ctx, c1);
      c.drawText(ctx, "公費負担者番号", c1, "center", "center");
      let rows = b.splitToColumns(c2, b.evenSplitter(8));
      [1, 3, 6].forEach(i => c.frameRight(ctx, rows[i]));
      c.withPen(ctx, "thin", () => {
        [0, 2, 4, 5].forEach(i => c.frameRight(ctx, rows[i]));
      })
    }
    { // cell2
      const [c1, c2] = b.splitToColumns(cell2, blk.splitByExtent(["*", cellSize * 8]));
      c.frameRight(ctx, c1);
      c.drawText(ctx, "保険者番号", c1, "center", "center");
      let rows = b.splitToColumns(c2, b.evenSplitter(8));
      [1, 3, 6].forEach(i => c.frameRight(ctx, rows[i]));
      c.withPen(ctx, "thin", () => {
        [0, 2, 4, 5].forEach(i => c.frameRight(ctx, rows[i]));
      })
    }
  }
  { // lower row
    const [cell3, cell4] = b.splitToColumns(row2, b.evenSplitter(2));
    c.frameRight(ctx, cell3);
    { // cell3
      const [c1, c2] = b.splitToColumns(cell3, blk.splitByExtent(["*", cellSize * 7]));
      c.frameRight(ctx, c1);
      const block = blk.stackedBlock([
        blk.textBlock(ctx, "公費負担医療",),
        blk.textBlock(ctx, "の受給者番号",),
      ], "left");
      blk.putIn(ctx, block, c1, "center", "center");
      let rows = b.splitToColumns(c2, b.evenSplitter(7));
      [2, 5].forEach(i => c.frameRight(ctx, rows[i]));
      c.withPen(ctx, "thin", () => {
        [0, 1, 3, 4].forEach(i => c.frameRight(ctx, rows[i]));
      })
    }
    { // cell4
      const [c1, c2] = b.splitToColumns(cell4, blk.splitByExtent(["*", cellSize * 8]));
      c.frameRight(ctx, c1);
      const block = blk.stackedBlock([
        blk.textBlock(ctx, "被保険者証・被保険"),
        blk.textBlock(ctx, "者手帳の記号・番号"),
      ], "left");
      blk.putIn(ctx, block, c1, "center", "center");
      let rows = b.splitToColumns(c2, b.evenSplitter(8));
      [1, 3, 6].forEach(i => c.frameRight(ctx, rows[i]));
      c.withPen(ctx, "thin", () => {
        [0, 2, 4, 5].forEach(i => c.frameRight(ctx, rows[i]));
      })
    }
  }
}

function drawLowerBox(ctx: DrawerContext, box: Box) {
  const [block1, block2, drugs, bikou, kaisuu, issueDate, pharma] = b.splitToRows(box, blk.splitByExtent([33, 10, "*", 29, 13, 10, 10]));
  { // block1
    const [col1, col2] = b.splitToColumns(block1, b.evenSplitter(2));
    c.frame(ctx, col1);
    [col1, block2, drugs, bikou, kaisuu, issueDate, pharma].forEach(box => c.frame(ctx, box));
    drawPatientBox(ctx, col1);
    drawClinicBox(ctx, col2);
  }
  drawIssueBox(ctx, block2);
  drawDrugs(ctx, drugs);
  drawBikou(ctx, bikou);
}

function drawPatientBox(ctx: DrawerContext, box: Box) {
  const [mark, body] = b.splitToColumns(box, b.splitAt(5));
  c.frameRight(ctx, mark);
  c.drawTextVertically(ctx, "患　者", mark, "center", "center");
  const rows = b.splitToRows(body, b.splitAt(10, 23));
  [rows[0], rows[1]].forEach(box => c.frameBottom(ctx, box));
  {
    const [c1, c2] = b.splitToColumns(rows[0], b.splitAt(20));
    c.frameRight(ctx, c1);
    c.drawText(ctx, "氏　名", c1, "center", "center");
  }
  { // rows[1]
    const [c1, c2] = b.splitToColumns(rows[1], b.splitAt(20));
    c.frameRight(ctx, c1);
    c.drawText(ctx, "生年月日", c1, "center", "center");
    const [col1, col2, col3] = b.splitToColumns(c2, b.splitAt(4, 30));
    c.frameRight(ctx, col2);
    {
      { // cpl1
        const box = b.modify(col1, b.shrinkVert(1, 1), b.setWidth(2.5, "center"));
        const [meiji, taisho, shouwa, heisei, reiwa] = b.splitToRows(box, b.evenSplitter(5));
        c.withFont(ctx, "f1.5", () => {
          c.drawText(ctx, "明", meiji, "center", "center");
          c.drawText(ctx, "大", taisho, "center", "center");
          c.drawText(ctx, "昭", shouwa, "center", "center");
          c.drawText(ctx, "平", heisei, "center", "center");
          c.drawText(ctx, "令", reiwa, "center", "center");
        })
      }
      { // col2
        const box = b.modify(col2, b.setHeight(2.5, "center"), b.shrinkHoriz(0, 2.5));
        const line = blk.rowBlock(c.currentFontSize(ctx), [
          blk.gapItem(2.5),
          blk.gapItem(1),
          blk.textItem(ctx, "年"),
          blk.gapItem(1), blk.gapItem(2.5), blk.gapItem(1), blk.textItem(ctx, "月"),
          blk.gapItem(1), blk.gapItem(2.5), blk.gapItem(1), blk.textItem(ctx, "日"),
        ]);
        blk.putIn(ctx, line, box, "right", "center");
      }
      { // col3
        const box = b.modify(col3, b.setHeight(2.5, "center"));
        const line = blk.rowBlock(c.currentFontSize(ctx), [
          blk.textItem(ctx, "男"),
          blk.textItem(ctx, "・"),
          blk.textItem(ctx, "女"),
        ]);
        blk.putIn(ctx, line, box, "center", "center");
      }
    }
  }
  { // rows[2]
    const [c1, c2] = b.splitToColumns(rows[2], b.splitAt(20));
    c.frameRight(ctx, c1);
    c.drawText(ctx, "区　分", c1, "center", "center");
    const [left, right] = b.splitToColumns(c2, b.evenSplitter(2));
    c.frameRight(ctx, left);
    c.drawText(ctx, "被保険者", left, "center", "center");
    c.drawText(ctx, "被扶養者", right, "center", "center");
  }
}

function inkan(size: number, opt?: { font?: string, pen?: string }): blk.Block {
  const font = opt?.font ?? "f1.5";
  const pen = opt?.pen ?? "thin";
  return {
    width: size,
    height: size,
    render: (ctx: DrawerContext, box: Box) => {
      c.withFont(ctx, font, () => {
        c.drawText(ctx, "印", box, "center", "center");
      });
      c.withPen(ctx, pen, () => {
        c.circle(ctx, b.cx(box), b.cy(box), size * 0.5);
      });
    }
  }
}

function drawClinicBox(ctx: DrawerContext, box: Box) {
  box = b.modify(box, b.shrinkHoriz(2, 0));
  const [address, name, kikancode] = b.splitToRows(box, b.splitAt(10, 23));
  { // address
    let [left, right] = b.splitToColumns(address, b.splitAt(22));
    const para = blk.stackedBlock([
      blk.textBlock(ctx, "保険医療機関の"),
      blk.textBlock(ctx, "所在地及び名称"),
    ], "left");
    blk.putIn(ctx, para, left, "center", "center");
    b.withSplitRows(name, b.evenSplitter(2), ([upper, lower]) => {
      {
        [left, right] = b.splitToColumns(upper, b.splitAt(22));
        const labelBox = b.modify(left, b.setHeight(2.5, "center"), b.setWidth(para.width, "center"));
        let label = blk.justifiedText(ctx, "電話番号", b.width(labelBox));
        blk.putIn(ctx, label, left, "center", "center");
      }
      {
        [left, right] = b.splitToColumns(lower, b.splitAt(22));
        const labelBox = b.modify(left, b.setHeight(2.5, "center"), b.setWidth(para.width, "center"));
        let label = blk.justifiedText(ctx, "保険医氏名", b.width(labelBox));
        blk.putIn(ctx, label, left, "center", "center");
        const stampBox = b.modify(right, b.setHeight(2.5, "bottom"), b.setWidth(2.5, "right"), b.shift(-3.5, -2.5));
        blk.putIn(ctx, inkan(2.5), stampBox, "center", "center");
      }
    });
  }
  drawKikanBox(ctx, kikancode);
}

function drawKikanBox(ctx: DrawerContext, box: Box) {
  box = b.modify(box, b.setHeight(6, "top"))
  c.frame(ctx, box);
  const [fukenLabel, fuken, tensuuLabel, tensuu, kikanLabel, kikancode] = b.splitToColumns(box, b.splitAt(23, 28, 38.5, 44, 51));
  [fukenLabel, fuken, tensuuLabel, tensuu, kikanLabel].forEach(box => c.frameRight(ctx, box));
  c.drawText(ctx, "都道府県番号", fukenLabel, "center", "center");
  {
    const para = blk.stackedBlock([
      blk.textBlock(ctx, "点数表"),
      blk.textBlock(ctx, "番号"),
    ], "center");
    blk.putIn(ctx, para, tensuuLabel, "center", "center");
  }
  {
    const para = blk.stackedBlock([
      blk.textBlock(ctx, "医療機関", "f1.5"),
      blk.textBlock(ctx, "コード", "f1.5"),
    ], "center");
    blk.putIn(ctx, para, kikanLabel, "center", "center");
  }
  {
    const cols = b.splitToColumns(kikancode, b.evenSplitter(7));
    [1, 5].forEach(i => c.frameRight(ctx, cols[i]));
    c.withPen(ctx, "thin", () => {
      [0, 2, 3, 4].forEach(i => c.frameRight(ctx, cols[i]));
    })
  }
}

function drawIssueBox(ctx: DrawerContext, box: Box) {
  c.frame(ctx, box);
  const [left, right] = b.splitToColumns(box, b.evenSplitter(2));
  {
    c.frameRight(ctx, left);
    const [label, body] = b.splitToColumns(left, b.splitAt(25));
    c.frameRight(ctx, label);
    c.drawText(ctx, "交付年月日", label, "center", "center");
    const line = blk.rowBlock(c.currentFontSize(ctx), [
      blk.textItem(ctx, "令和"), blk.gapItem(1), blk.gapItem(3), blk.gapItem(1), blk.textItem(ctx, "年"),
      blk.gapItem(1), blk.gapItem(3), blk.gapItem(1), blk.textItem(ctx, "月"),
      blk.gapItem(1), blk.gapItem(3), blk.gapItem(1), blk.textItem(ctx, "日"),
    ]);
    blk.putIn(ctx, line, body, "center", "center");
  }
  {
    const [label, body] = b.splitToColumns(right, b.splitAt(25));
    c.frameRight(ctx, label);
    blk.putIn(ctx, blk.stackedBlock([
      blk.textBlock(ctx, "処方箋の"),
      blk.textBlock(ctx, "使用期間"),
    ], "left"), label, "center", "center");
    const [issueLimit, comment] = b.splitToColumns(body, b.splitAt(24));
    const line = blk.rowBlock(c.currentFontSize(ctx), [
      blk.textItem(ctx, "令和"), blk.gapItem(0.5), blk.gapItem(2.5), blk.gapItem(0.5), blk.textItem(ctx, "年"),
      blk.gapItem(0.5), blk.gapItem(2.5), blk.gapItem(0.5), blk.textItem(ctx, "月"),
      blk.gapItem(0.5), blk.gapItem(2.5), blk.gapItem(0.5), blk.textItem(ctx, "日"),
    ]);
    blk.putIn(ctx, line, issueLimit, "center", "center");
    const [cLeft, cBody, cRight] = b.splitToColumns(comment, blk.splitByExtent([1.5, "*", 1.5]));
    drawLeftSquareBracket(ctx, b.modify(cLeft, b.shrinkHoriz(0.75, 0), b.shrinkVert(1.5, 1.5), b.shift(0.25, 0)), { pen: "thin" });
    c.withFont(ctx, "f1.5", () => {
      const para = blk.stackedBlock([
        blk.textBlock(ctx, "特に記載のある場合"),
        blk.textBlock(ctx, "を除き、交付の日を含"),
        blk.textBlock(ctx, "めて４日以内に保険薬"),
        blk.textBlock(ctx, "局に提出すること。"),
      ], "left", { leading: 0.4 });
      blk.putIn(ctx, para, cBody, "center", "center");
    });
    drawRightSquareBracket(ctx, b.modify(cRight, b.shrinkHoriz(0, 0.75), b.shrinkVert(1.5, 1.5), b.shift(-0.5, 0)), { pen: "thin" });
  }
}

function drawDrugs(ctx: DrawerContext, box: Box) {
  const [mark, col1, col2, body] = b.splitToColumns(box, b.splitAt(5, 18, 31));
  [mark, col1, col2].forEach(box => c.frameRight(ctx, box))
  {
    c.drawTextJustifiedVertically(ctx, "処方", b.modify(mark, b.shrinkVert(14, 14)), "center");
  }
  {
    const [label, body] = b.splitToRows(col1, b.splitAt(6));
    c.frameBottom(ctx, label);
    const para = blk.stackedBlock([
      blk.textBlock(ctx, "変更不可"),
      blk.setHeight(blk.textBlock(ctx, "(医療上必要)", "f1.5"), c.currentFontSize(ctx), "center"),
    ], "center");
    blk.putIn(ctx, para, label, "center", "center");
  }
  {
    const [label, body] = b.splitToRows(col2, b.splitAt(6));
    c.frameBottom(ctx, label);
    c.drawText(ctx, "患者希望", label, "center", "center");
  }
  {
    const [upper, lower] = b.splitToRows(body, b.splitAt(12.5));
    const [cLeft, cBody, cRight] = b.splitToColumns(upper, blk.splitByExtent([1.5, "*", 1.5]));
    drawLeftSquareBracket(ctx, b.modify(cLeft, b.shrinkHoriz(0.75, 0), b.shrinkVert(1.5, 1.5), b.shift(0.3, 0)));
    blk.putIn(ctx, blk.stackedBlock([
      blk.textBlock(ctx, "個々の処方薬について、医療上の必要性があるため、後発医薬品（ジェネリック医薬品）"),
      blk.textBlock(ctx, "への変更に差し支えがあると判断した場合には、「変更不可」欄に 「レ」又は「×」を記"),
      blk.textBlock(ctx, "載し、「保険医署名」 欄に署名又は記名・押印すること。また、患者の希望を踏まえ、先"),
      blk.textBlock(ctx, "発医薬品を処方した場合には、「患者希望」欄に「レ」又は「×」を記載すること。"),
    ], "left"), b.modify(cBody, b.shrinkHoriz(1, 0)), "left", "center")
    drawRightSquareBracket(ctx, b.modify(cRight, b.shrinkHoriz(0, 0.75), b.shrinkVert(1.5, 1.5), b.shift(-0.5, 0)));
  }
  {
    const bb = b.modify(body, b.shrinkHoriz(3, 0), b.shrinkVert(0, 2), b.setHeight(2.5, "bottom"));
    const line = blk.rowBlock(c.currentFontSize(ctx), [
      blk.textItem(ctx, "リフィル可"),
      blk.gapItem(2),
      blk.containerItem(blk.fixedExtent(2), blk.squareBlock(2, { pen: "thin" }), "center", "center"),
      blk.gapItem(3),
      blk.textItem(ctx, "("),
      blk.gapItem(5),
      blk.textItem(ctx, "回）"),
    ]);
    line.render(ctx, bb);
  }
}

function drawBikou(ctx: DrawerContext, box: Box) {
  const [mark, body] = b.splitToColumns(box, b.splitAt(5));
  c.frameRight(ctx, mark);
  c.drawTextJustifiedVertically(ctx, "備考", b.modify(mark, b.setHeight(10, "center")), "center");
  const rows = b.splitToRows(body, b.splitAt(13, 22));
  { // rows[0]
    const bb = b.modify(rows[0], b.setWidth(70, "left"));
    c.frame(ctx, bb);
    const [label, doctorName] = b.splitToRows(bb, b.splitAt(7));
    {
      const [left, right] = b.splitToColumns(label, b.splitAt(21));
      c.drawText(ctx, "保険医署名", left, "center", "center");
      const center = blk.stackedBlock([
        blk.textBlock(ctx, "「変更不可」蘭に「レ」又は「×」を記載", "f2.3"),
        blk.textBlock(ctx, "した場合は、署名又は記名・押印すること。", "f2.3"),
      ], "left");
      const row = blk.rowBlock(center.height, [
        {
          width: blk.fixedExtent(0.75),
          render: (ctx, box) => { drawLeftSquareBracket(ctx, b.modify(box, b.shrinkVert(0, 0)), { pen: "thin" }) }
        },
        {
          width: blk.fixedExtent(center.width),
          render: (ctx, box) => center.render(ctx, box),
        },
        {
          width: blk.fixedExtent(0.75),
          render: (ctx, box) => { drawRightSquareBracket(ctx, b.modify(box, b.shrinkVert(0, 0)), { pen: "thin" }) }
        }
      ])
      blk.putIn(ctx, row, b.modify(right, b.inset(1.5)), "right", "top");
    }
  }
  { // rows[2]
    const [upper, lower] = b.splitToRows(rows[2], b.evenSplitter(2));
    c.drawText(ctx, "保険薬局が調剤時に残薬を確認した場合の対応（特に指示がある場合は「レ」又は「×」を記載すること。）", 
      b.modify(upper, b.shrinkHoriz(8, 0)), "left", "center");
    const lowerBlock = blk.rowBlock(c.currentFontSize(ctx), [
      blk.squareItem(2, { pen: "thin" }),
      blk.gapItem(1),
      blk.textItem(ctx, "保険医療機関へ疑義照会した上で調剤"),
      blk.gapItem(10),
      blk.squareItem(2, { pen: "thin" }),
      blk.gapItem(1),
      blk.textItem(ctx, "保険医療機関へ情報提供"),
    ]);
    blk.putIn(ctx, lowerBlock, b.modify(lower, b.shrinkHoriz(24, 0)), "left", "center");
  }
}