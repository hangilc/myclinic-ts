import { pad } from "@/lib/pad";
import type { HAlign } from "../../compiler/align";
import * as blk from "../../compiler/block";
import {
  ColumnBuilder,
  Container,
  RowBuilder,
  alignedItem,
  emptyItem,
  flexRow,
  insetExtent,
  insetOffsetExtent,
  textItem,
  type Extent,
  type Item,
  type Renderer,
  type Position,
  shiftPosition
} from "../../compiler/block";
import * as b from "../../compiler/box";
import type { Color } from "../../compiler/compiler";
import * as c from "../../compiler/compiler";
import { mkDrawerContext, type DrawerContext } from "../../compiler/context";
import type { Op } from "../../compiler/op";
import { A5 } from "../../compiler/paper-size";
import type { Shohousen2024Data } from "./shohousenData2024";
import { DateWrapper } from "myclinic-util";

export function drawShohousen2024NoRefill(data?: Shohousen2024Data): Op[][] {
  const ctx = prepareDrawerContext();
  const paper = b.mkBox(0, 0, A5.width, A5.height);
  const outerBounds = b.modify(paper, b.inset(3));
  c.frame(ctx, outerBounds);
  const bounds = b.modify(outerBounds, b.inset(2));
  const main = mainBlock(ctx, blk.extentOfBox(bounds), data);
  main.renderAt(ctx, blk.leftTopOfBox(bounds));
  return [c.getOps(ctx)];
}

function mainBlock(ctx: DrawerContext, extent: Extent, data?: Shohousen2024Data): Renderer {
  const container = new Container();
  const rb = new RowBuilder(extent);
  const mainTitleRow = rb.getRow(6);
  container.add(mainTitle(ctx, mainTitleRow.extent), mainTitleRow.offset);
  const subTitleRow = rb.getRow(2);
  container.add(subTitle(ctx, subTitleRow.extent), subTitleRow.offset);
  const mainRow = rb.getRemaining();
  const inner = blk.insetExtent(mainRow.extent, 2, 3, 2, 3);
  const mainAreaRenderer = mainArea(ctx, inner.extent, data);
  container.add(mainAreaRenderer, blk.addOffsets(mainRow.offset, inner.offset));
  return container;
}

function mainTitle(ctx: DrawerContext, extent: Extent): Item {
  const item = textItem(ctx, "処方箋", { font: "f4", color: green });
  return alignedItem(item, extent, "center", "center");
}

function subTitle(ctx: DrawerContext, extent: Extent): Item {
  let item = textItem(ctx, "(この処方箋は、どの保険薬局でも有効です。)");
  return alignedItem(item, extent, "center", "center");
}

//     b.splitToRows(box, blk.splitByExtent(33, 10, "*", 20, 10, 10));

function mainArea(ctx: DrawerContext, extent: Extent, data?: Shohousen2024Data): Renderer {
  const con: Container = new Container();
  const rb = new RowBuilder(extent);
  const upperRow = rb.getRow(20);
  {
    let { offset, extent } = upperRow;
    const cb = new ColumnBuilder(extent);
    const [kouhiBox, hokenBox] = cb.splitEven(2);
    con.add(kouhiRenderer(ctx, kouhiBox.extent, data), offset, kouhiBox.offset);
    con.add(hokenRenderer(ctx, hokenBox.extent, data), offset, hokenBox.offset);
  }
  rb.getRow(3);
  const kanjaRow = rb.getRow(33);
  const koufuDateRow = rb.getRow(10);
  const pharmaRow = rb.getRowFromBottom(10);
  const shohouDateRow = rb.getRowFromBottom(10);
  const bikouRow = rb.getRowFromBottom(20);
  const drugsRow = rb.getRemaining();
  con.add(kanjaRowRenderer(ctx, kanjaRow.extent, data), kanjaRow.offset);
  return con;
}

function kanjaRowRenderer(ctx: DrawerContext, extent: Extent, data?: Shohousen2024Data): Renderer {
  const cb = new ColumnBuilder(extent);
  const [patientArea, clinicArea] = cb.splitEven(2);
  const con = new Container();
  con.add(kanjaAreaRenderer(ctx, patientArea.extent, data), patientArea.offset);
  con.add(clinicAreaRenderer(ctx, clinicArea.extent, data), clinicArea.offset);
  return con;
}

// function drawPatientBox(ctx: DrawerContext, box: Box, data: Shohousen2024Data) {
//   const [mark, body] = b.splitToColumns(box, b.splitAt(5));
//   c.frameRight(ctx, mark);
//   c.drawTextVertically(ctx, "患　者", mark, "center", "center");
//   const rows = b.splitToRows(body, b.splitAt(10, 23));
//   [rows[0], rows[1]].forEach(box => c.frameBottom(ctx, box));
//   { // rows[0]
//     const [c1, c2] = b.splitToColumns(rows[0], b.splitAt(20));
//     c.frameRight(ctx, c1);
//     c.drawText(ctx, "氏　名", c1, "center", "center");
//     blk.putIn(ctx,
//       blk.textPackBlock(ctx, data.shimei ?? "", c2, [
//         { textBlockOpt: { font: "d5", color: black }, stackedBlockOpt: { halign: "left" } },
//         { textBlockOpt: { font: "d4", color: black }, stackedBlockOpt: { halign: "left" } },
//         { textBlockOpt: { font: "d3", color: black }, stackedBlockOpt: { halign: "left" } },
//         { textBlockOpt: { font: "d2.5", color: black }, stackedBlockOpt: { halign: "left" } },
//       ]),
//       c2, alignCenter);
//   }
//   { // rows[1]
//     const [c1, c2] = b.splitToColumns(rows[1], b.splitAt(20));
//     c.frameRight(ctx, c1);
//     c.drawText(ctx, "生年月日", c1, "center", "center");
//     const [col1, col2, col3] = b.splitToColumns(c2, b.splitAt(4, 30));
//     c.frameRight(ctx, col2);
//     const bdate = data.birthdate ? DateWrapper.from(data.birthdate) : undefined;
//     { // col1
//       const box = b.modify(col1, b.shrinkVert(1, 1), b.setWidth(2.5, "center"));
//       const [meiji, taisho, shouwa, heisei, reiwa] = b.splitToRows(box, b.evenSplitter(5));
//       const gengou = bdate?.getGengou();
//       function drawGengou(label: string, box: Box, value: string) {
//         blk.drawText(ctx, label, box, {
//           halign: "center",
//           valign: "center",
//           textBlockOpt: {
//             font: "f1.5",
//             color: green,
//             blockOpt: {
//               modifiers: [dataCirc(gengou === value)]
//             }
//           }
//         });
//       }
//       drawGengou("明", meiji, "明治");
//       drawGengou("大", taisho, "大正");
//       drawGengou("昭", shouwa, "昭和");
//       drawGengou("平", heisei, "平成");
//       drawGengou("令", reiwa, "令和");
//     }
//     { // col2
//       const box = b.modify(col2, b.setHeight(2.5, "center"), b.shrinkHoriz(0, 2.5));
//       const line = blk.rowBlock(c.currentFontSize(ctx), [
//         blk.gapItem(2.5, {
//           block: blk.textBlock(ctx, bdate?.getNen().toString() ?? "", {
//             font: "d2.5", color: black
//           }),
//           containerItemOpt: { putInOpt: { halign: "right", valign: "center" } }
//         }),
//         blk.gapItem(1),
//         blk.textItem(ctx, "年"),
//         blk.gapItem(1),
//         blk.gapItem(2.5, {
//           block: blk.textBlock(ctx, bdate?.getMonth().toString() ?? "", { font: "d2.5", color: black }),
//           containerItemOpt: { putInOpt: { halign: "right", valign: "center" } }
//         }),
//         blk.gapItem(1),
//         blk.textItem(ctx, "月"),
//         blk.gapItem(1),
//         blk.gapItem(2.5, {
//           block: blk.textBlock(ctx, bdate?.getDay().toString() ?? "", { font: "d2.5", color: black }),
//           containerItemOpt: { putInOpt: { halign: "right", valign: "center" } }
//         }),
//         blk.gapItem(1),
//         blk.textItem(ctx, "日"),
//       ]);
//       blk.putIn(ctx, line, box, { halign: "right", valign: "center" });
//     }
//     { // col3
//       const box = b.modify(col3, b.setHeight(2.5, "center"));
//       const line = blk.rowBlock(c.currentFontSize(ctx), [
//         blk.textItem(ctx, "男"),
//         blk.textItem(ctx, "・"),
//         blk.textItem(ctx, "女"),
//       ]);
//       blk.putIn(ctx, line, box, alignCenter);
//     }
//   }
//   { // rows[2]
//     const [c1, c2] = b.splitToColumns(rows[2], b.splitAt(20));
//     c.frameRight(ctx, c1);
//     c.drawText(ctx, "区　分", c1, "center", "center");
//     const [left, right] = b.splitToColumns(c2, b.evenSplitter(2));
//     c.frameRight(ctx, left);
//     let tb = blk.drawText(ctx, "被保険者", left, alignCenter);
//     if (data.hokenKubun === "hihokensha") {
//       c.withPen(ctx, "data-thin", () => {
//         c.circle(ctx, b.cx(tb), b.cy(tb), c.currentFontSize(ctx) * 0.6);
//       });
//     }
//     blk.drawText(ctx, "被扶養者", right, alignCenter);
//   }
// }

function kanjaAreaRenderer(ctx: DrawerContext, extent: Extent, data?: Shohousen2024Data): Renderer {
  const con = new Container();
  con.add(blk.frame(extent));
  const cb = new ColumnBuilder(extent);
  const mark = cb.getColumn(5);
  const body = cb.getRemaining();
  con.add(blk.frameRight(mark.extent));
  con.add(blk.boxItem(mark.extent, (ctx, box) => {
    box = b.modify(box, b.shrinkVert(10, 10));
    c.drawTextJustifiedVertically(ctx, "患　者", box, "center");
  }), mark.offset);
  {
    const rb = new RowBuilder(body.extent, body.offset);
    const [name, birthdateAndSex, kubun] = rb.splitEven(3);
    con.add(blk.frameBottom(name.extent), name.offset);
    con.add(blk.frameBottom(birthdateAndSex.extent), birthdateAndSex.offset);
    {
      const cb = new ColumnBuilder(name.extent, name.offset);
      const [label, body] = cb.splitByFlexSizes([
        { kind: "fixed", value: 20 },
        { kind: "expand" },
      ])
      con.add(blk.frameRight(label.extent), label.offset);
      con.addAligned(textItem(ctx, "氏　名"), label, "center", "center");
      con.addCreated((ext) => shimeiRenderer(ctx, ext, data?.shimei), insetOffsetExtent(body, 1));
    }
    {
      const cb = new ColumnBuilder(birthdateAndSex.extent, birthdateAndSex.offset);
      const [label, birthdate, sex] = cb.splitByFlexSizes([
        { kind: "fixed", value: 20 },
        { kind: "expand" },
        { kind: "fixed", value: 10 }
      ]);
      con.add(blk.frameRight(label.extent), label.offset);
      con.frameRight(birthdate);
      con.addAligned(textItem(ctx, "生年月日"), label, "center", "center");
      con.addCreated((ext) => birthdateRenderer(ctx, ext, data?.birthdate), birthdate);
      con.addCreated((ext) => sexRenderer(ctx, ext, data?.sex), sex);
    }
    {
      const cb = new ColumnBuilder(kubun.extent, kubun.offset);
      const [label, body] = cb.splitByFlexSizes([
        { kind: "fixed", value: 20 },
        { kind: "expand" },
      ]);
      con.add(blk.frameRight(label.extent), label.offset);
      con.add(blk.frameRight(label.extent), label.offset);
      con.addAligned(textItem(ctx, "区　分"), label, "center", "center");
    }
  }
  return con;
}

function shimeiRenderer(ctx: DrawerContext, extent: Extent, shimei: string | undefined): Renderer {
  function singleLineSpec(font: string): blk.StuffedItemSpec {
    return {
      innerItemCreator: (ctx, text) => {
        return textItem(ctx, text, { font, color: black });
      },
      innerItemAligner: (item) => {
        return alignedItem(item, extent, "center", "center");
      }
    }
  }
  if (shimei === undefined) {
    return emptyItem();
  } else {
    return blk.stuffedTextItem(ctx, shimei, extent, [
      singleLineSpec("d5"),
      singleLineSpec("d4"),
      singleLineSpec("d3"),
    ],
      {
        innerItemCreator: (ctx: DrawerContext, text: string, width: number): Item => {
          return blk.wrappedTextItem(ctx, text, width, { font: "d2.5", color: black, halign: "left" })
        },
        innerItemAligner: (item: Item): Item => {
          return blk.alignedItem(item, extent, "left", "top");
        }
      }
    );
  }
}

function circleRenderer(radius: number, pen?: string): Renderer {
  return {
    renderAt(ctx: DrawerContext, pos: Position) {
      c.withPen(ctx, pen, () => {
        c.circle(ctx, pos.x, pos.y, radius);
      })
    }
  }
}

function nenMonthDateRenderer(ctx: DrawerContext, date?: DateWrapper,
  opt?: { nenWidth: number; monthWidth: number; dayWidth: number; gap?: number })
  : Item {
  const nenWidth = opt?.nenWidth ?? 2.5;
  const monthWidth = opt?.monthWidth ?? 2.5;
  const dayWidth = opt?.dayWidth ?? 2.5;
  const gap = opt?.gap ?? 1;
  function content(value: number | undefined): () => Item {
    return () => value !== undefined ? 
      textItem(ctx, value.toString(), { font: "d2.5", color: black }) : 
      emptyItem();
  }
  const nenContent = content(date?.getNen());
  const monthContent = content(date?.getMonth());
  const dayContent = content(date?.getDay());
  return flexRow(2.5, [
    { kind: "gap", width: nenWidth, halign: "right", valign: "center", content: nenContent },
    { kind: "gap", width: gap },
    { kind: "item", item: textItem(ctx, "年") },
    { kind: "gap", width: gap },
    { kind: "gap", width: monthWidth, halign: "right", valign: "center", content: monthContent },
    { kind: "gap", width: gap },
    { kind: "item", item: textItem(ctx, "月") },
    { kind: "gap", width: gap },
    { kind: "gap", width: dayWidth, halign: "right", valign: "center", content: dayContent },
    { kind: "gap", width: gap },
    { kind: "item", item: textItem(ctx, "日") },
  ]);
}

function birthdateRenderer(ctx: DrawerContext, extent: Extent, birthdate: string | undefined): Renderer {
  function gengouRenderer(extent: Extent, gengou: string | undefined): Renderer {
    const con = new Container();
    const innerExtent = insetExtent(extent, 0, 0.5);
    const rb = new RowBuilder(innerExtent.extent, innerExtent.offset);
    const [meiji, taisho, shouwa, heisei, reiwa] = rb.splitEven(5);
    const textOpt = { font: "f1.5" };
    const radius = 0.9
    con.addAligned(textItem(ctx, "明", textOpt), meiji, "center", "center");
    con.addAligned(textItem(ctx, "大", textOpt), taisho, "center", "center");
    con.addAligned(textItem(ctx, "昭", textOpt), shouwa, "center", "center");
    con.addAligned(textItem(ctx, "平", textOpt), heisei, "center", "center");
    con.addAligned(textItem(ctx, "令", textOpt), reiwa, "center", "center");
    switch (gengou) {
      case "明治": con.add(circleRenderer(radius, "data-thin"), blk.centerOfOffsetExtent(meiji)); break;
      case "大正": con.add(circleRenderer(radius, "data-thin"), blk.centerOfOffsetExtent(taisho)); break;
      case "昭和": con.add(circleRenderer(radius, "data-thin"), blk.centerOfOffsetExtent(shouwa)); break;
      case "平成": con.add(circleRenderer(radius, "data-thin"), blk.centerOfOffsetExtent(heisei)); break;
      case "令和": con.add(circleRenderer(radius, "data-thin"), blk.centerOfOffsetExtent(reiwa)); break;
    }
    return con;
  }
  function bodyRenderer(extent: Extent, date?: DateWrapper): Renderer {
    const con = new Container();
    const innerBox = insetExtent(extent, 0, 0, 3, 0);
    const item = nenMonthDateRenderer(ctx, date);
    con.addAligned(item, innerBox, "right", "center");
    return con;
  }
  const bdate = birthdate ? DateWrapper.from(birthdate) : undefined;
  const con = new Container();
  const cb = new ColumnBuilder(extent);
  const [gengou, body] = cb.splitByFlexSizes([
    { kind: "fixed", value: 4 },
    { kind: "expand" },
  ])
  con.addCreated((ext) => gengouRenderer(ext, bdate?.getGengou()), gengou);
  con.addCreated((ext) => bodyRenderer(ext, bdate), body);
  return con;
}

function circleDecorator(draw: boolean, radius: number): (ext: Extent) => Renderer {
  if( draw ) {
    return (ext: Extent) => ({
      renderAt(ctx: DrawerContext, pos: Position){
         const center = shiftPosition(pos, blk.centerOfExtent(ext));
         c.withPen(ctx, "data-thin", () => {
          c.circle(ctx, center.x, center.y, radius);
         });
      }
    })
  } else {
    return () => emptyItem();
  }
}

function sexRenderer(ctx: DrawerContext, extent: Extent, sex: string | undefined): Renderer {
  const fontSize = c.currentFontSize(ctx);
  const row = flexRow(fontSize, [
    { kind: "item", item: textItem(ctx, "男"), decorator: circleDecorator(sex === "M", 1.5)},
    { kind: "item", item: textItem(ctx, "・")},
    { kind: "item", item: textItem(ctx, "女"), decorator: circleDecorator(sex === "F", 1.5)},
  ]);
  return alignedItem(row, extent, "center", "center");
}

function clinicAreaRenderer(ctx: DrawerContext, extent: Extent, data?: Shohousen2024Data): Renderer {
  const con = new Container();

  return con;
}

function kouhiRenderer(ctx: DrawerContext, extent: Extent, data?: Shohousen2024Data): Renderer {
  const con = new Container();
  con.add(blk.frame(extent));
  const rb = new RowBuilder(extent);
  const [upper, lower] = rb.splitEven(2);
  con.add(blk.frameBottom(upper.extent), upper.offset);
  const digitWidth = 5;
  {
    const { offset, extent } = upper;
    const cb = new ColumnBuilder(extent);
    const digits = cb.getColumnFromRight(digitWidth * 8);
    const label = cb.getRemaining();
    con.add(blk.frameRight(label.extent), offset, label.offset);
    con.add(blk.alignedText(ctx, "公費負担者番号", label.extent, "center", "center"), offset, label.offset);
    con.add(eightDigits(ctx, digits.extent, data?.futansha), offset, digits.offset);
  }
  {
    const { offset, extent } = lower;
    const cb = new ColumnBuilder(extent);
    const digits = cb.getColumnFromRight(digitWidth * 7);
    const label = cb.getRemaining();
    con.add(blk.frameRight(label.extent), offset, label.offset);
    let labelItem = stackedTexts(ctx, ["公費負担医療", "の受給者番号"]);
    labelItem = alignedItem(labelItem, label.extent, "center", "center");
    con.add(labelItem, offset, label.offset);
    con.add(sevenDigits(ctx, digits.extent, data?.jukyuusha), offset, digits.offset);
  }
  return con;
}

function hokenRenderer(ctx: DrawerContext, extent: Extent, data?: Shohousen2024Data): Renderer {
  const con = new Container();
  con.add(blk.frame(extent));
  const rb = new RowBuilder(extent);
  const [upper, lower] = rb.splitEven(2);
  con.add(blk.frameBottom(upper.extent), upper.offset);
  const digitWidth = 5;
  {
    const { offset, extent } = upper;
    const cb = new ColumnBuilder(extent);
    const digits = cb.getColumnFromRight(digitWidth * 8);
    const label = cb.getRemaining();
    con.add(blk.frameRight(label.extent), offset, label.offset);
    con.add(blk.alignedText(ctx, "保険者番号", label.extent, "center", "center"), offset, label.offset);
    con.add(eightDigits(ctx, digits.extent, data?.hokenshaBangou), offset, digits.offset);
  }
  {
    const { offset, extent } = lower;
    const cb = new ColumnBuilder(extent);
    const kigouBangou = cb.getColumnFromRight(digitWidth * 8);
    const label = cb.getRemaining();
    con.add(blk.frameRight(label.extent), offset, label.offset);
    let labelItem = stackedTexts(ctx, ["被保険者証・被保険", "者手帳の記号・番号"]);
    labelItem = alignedItem(labelItem, label.extent, "center", "center");
    con.add(labelItem, offset, label.offset);
    con.add(kigouBangouRenderer(ctx, kigouBangou.extent, data), offset, kigouBangou.offset);
  }
  return con;
}

function kigouBangouRenderer(ctx: DrawerContext, extent: Extent, data?: Shohousen2024Data): Renderer {
  const itemAlign = { halign: "center", valign: "center" } as const;
  const textOpt = { font: "d2.5", color: black };
  let item = flexRow(c.resolveFontHeight(ctx, undefined), [
    {
      kind: "gap", width: 1, ...itemAlign
    },
    {
      kind: "expand", content: (): Item => {
        const kigou = data?.hihokenshaKigou;
        if (kigou !== undefined) {
          return textItem(ctx, kigou, textOpt);
        } else {
          return emptyItem();
        }
      },
      ...itemAlign
    },
    {
      kind: "item", item: textItem(ctx, "・"), ...itemAlign
    },
    {
      kind: "expand", content: (): Item => {
        const bangou = data?.hihokenshaBangou;
        if (bangou !== undefined) {
          return textItem(ctx, bangou, textOpt);
        } else {
          return emptyItem();
        }
      },
      ...itemAlign
    },
    {
      kind: "item", item: textItem(ctx, "(枝番)"), ...itemAlign
    },
    {
      kind: "gap",
      width: 3,
      content: () => {
        const edaban = data?.edaban;
        if (edaban) {
          return textItem(ctx, edaban, textOpt);
        } else {
          return emptyItem();
        }
      }, ...itemAlign
    },
    {
      kind: "gap", width: 1, ...itemAlign
    },
  ], extent.width);
  return alignedItem(item, extent, "center", "center");
}

function stackedTexts(ctx: DrawerContext, texts: string[], opt?: { font?: string, halign?: HAlign }): Item {
  const font = opt?.font;
  const halign = opt?.halign ?? "left";
  const items = texts.map(text => blk.textItem(ctx, text, { font: opt?.font }));
  const width = Math.max(...items.map(item => item.extent.width));
  const height = c.resolveFontHeight(ctx, opt?.font);
  return blk.stackedItems(...items.map(item => ({ item, halign })));
}

function eightDigits(ctx: DrawerContext, extent: Extent, digits?: string): Renderer {
  const con = new Container();
  const cb = new ColumnBuilder(extent);
  const cols = cb.splitEven(8);
  [1, 3, 6].forEach(i => {
    const col = cols[i];
    con.add(blk.frameRight(cols[i].extent), col.offset);
  });
  [0, 2, 4, 5].forEach(i => {
    const col = cols[i];
    con.add(blk.frameRight(cols[i].extent, "thin"), col.offset);
  });
  if (digits) {
    const str = pad(digits, 8, " ");
    Array.from(str).forEach(((ch, i) => {
      const col = cols[i];
      con.add(blk.alignedText(ctx, ch, col.extent, "center", "center", { font: "d6", color: black }), col.offset);
    }));
  }
  return con;
}

function sevenDigits(ctx: DrawerContext, extent: Extent, digits?: string): Renderer {
  const con = new Container();
  const cb = new ColumnBuilder(extent);
  const cols = cb.splitEven(7);
  [2, 5].forEach(i => {
    const col = cols[i];
    con.add(blk.frameRight(cols[i].extent), col.offset);
  });
  [0, 1, 3, 4].forEach(i => {
    const col = cols[i];
    con.add(blk.frameRight(cols[i].extent, "thin"), col.offset);
  });
  if (digits) {
    const str = pad(digits, 7, " ");
    Array.from(str).forEach(((ch, i) => {
      const col = cols[i];
      con.add(blk.alignedText(ctx, ch, col.extent, "center", "center", { font: "d6", color: black }), col.offset);
    }));
  }
  return con;
}

// export function drawShohousen2024NoRefill(data: Shohousen2024Data): Op[][] {
//   const paper = b.mkBox(0, 0, A5.width, A5.height);
//   const bounds = b.modify(paper, b.inset(3));
//   if (data.drugs === undefined) {
//     const ctx = prepareDrawerContext();
//     drawPage(ctx, bounds, data);
//     return [c.getOps(ctx)];
//   } else {
//     let iter = 0;
//     const pages: { ctx: DrawerContext, lastLineBox: Box, font: string }[] = [];
//     let shohouData: PrepareShohouData = initPrepareShohouData("d3", data.drugs);
//     while (true) {
//       const ctx = prepareDrawerContext();
//       const layout = drawPage(ctx, bounds, data);
//       const result = drawShohou(ctx, layout, shohouData);
//       if (result.error) {
//         throw new Error(result.error);
//       }
//       pages.push({ ctx, lastLineBox: result.lastLineBox, font: result.font });
//       if (result.rest === undefined) {
//         break;
//       }
//       shohouData = result.rest;
//       if (iter++ > 10) {
//         throw new Error("too many iteration");
//       }
//     }
//     if (pages.length === 1) {
//       const page = pages[0];
//       const block = mkLastLineBlock(page.ctx, page.font);
//       blk.putIn(page.ctx, block, page.lastLineBox, { halign: "left", valign: "center" });
//     } else if (pages.length > 1) {
//       for(let i=0;i<pages.length;i++){
//         const page = pages[i];
//         const block = mkContinueLineBlock(page.ctx, page.font, i+1, pages.length);
//         blk.putIn(page.ctx, block, page.lastLineBox, { halign: "left", valign: "center" });
//       }
//     }
//     return pages.map(page => c.getOps(page.ctx));
//   }
// }

function prepareDrawerContext(): DrawerContext {
  const ctx = mkDrawerContext();
  initFont(ctx);
  initPen(ctx);
  c.setFont(ctx, "f2.5");
  c.setTextColor(ctx, 0, 255, 0);
  c.setPen(ctx, "default");
  return ctx;
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
  c.createFont(ctx, "d3", "MS Gothic", 3);
  c.createFont(ctx, "d2.5", "MS Gothic", 2.5);
}

function initPen(ctx: DrawerContext) {
  c.createPen(ctx, "default", 0, 255, 0, 0.25);
  c.createPen(ctx, "thin", 0, 255, 0, 0.1);
  c.createPen(ctx, "data-thin", 0, 0, 0, 0.1);
}

// function drawPage(ctx: DrawerContext, box: Box, data: Shohousen2024Data): {
//   henkoufuka: Box, kanjakibou: Box; shohouBox: Box;
// } {
//   c.frame(ctx, box);
//   let bb = b.withSlice(box, 6, box => drawTitle(ctx, b.modify(box, b.setWidth(30, "center"))));
//   bb = b.withSlice(bb, 2.5, (box) => {
//     c.drawText(ctx, "(この処方箋は、どの保険薬局でも有効です。)", box, "center", "center");
//   });
//   box = b.modify(box, b.inset(2, 11, 2, 3));
//   const [upperBox, _, lowerBox] = b.splitToRows(box, b.splitAt(20, 22));
//   drawUpperBox(ctx, upperBox, data);
//   const lowerInfo = drawLowerBox(ctx, lowerBox, data);
//   return { ...lowerInfo };
// }

// function mkLastLineBlock(ctx: DrawerContext, font: string): Block {
//   return blk.modify(blk.textBlock(ctx, "--- 以下余白 ---", {
//     font: font,
//     color: black,
//   }), blk.extendLeft(20));
// }

// function mkContinueLineBlock(ctx: DrawerContext, font: string, page: number, totalPages: number): Block {
//   const text = page < totalPages
//     ? `--- 次ページに続く　（${page} / ${totalPages}） ---`
//     : `--- 以下余白　（${page} / ${totalPages}） ---`;
//   return blk.modify(blk.textBlock(ctx, text, {
//     font: font,
//     color: red,
//   }), blk.extendLeft(20));
// }

// const alignCenter = {
//   halign: "center",
//   valign: "center",
// } as const;

// function drawTitle(ctx: DrawerContext, box: Box) {
//   const block = blk.justifiedTextBlock(ctx, "処方箋", b.width(box), { textBlockOpt: { font: "f4" } });
//   blk.putIn(ctx, block, box, alignCenter);
// }


// function withDataContext(ctx: DrawerContext, font: string, f: () => void) {
//   c.withFont(ctx, font, () => {
//     c.withTextColor(ctx, { r: 0, g: 0, b: 0 }, f);
//   });
// }

// function dataTextBlock(ctx: DrawerContext, text: string | undefined, font: string): Block {
//   if (text === undefined) {
//     return blk.emptyBlock();
//   } else {
//     return blk.textBlock(ctx, text, { font: font, color: { r: 0, g: 0, b: 0 } });
//   }
// }

// function drawUpperBox(ctx: DrawerContext, box: Box, data: Shohousen2024Data) {
//   c.frame(ctx, box);
//   let [row1, row2] = b.splitToRows(box, b.evenSplitter(2));
//   c.frameBottom(ctx, row1);
//   const cellSize = 5;
//   { // upper row
//     const [cell1, cell2] = b.splitToColumns(row1, b.evenSplitter(2));
//     c.frameRight(ctx, cell1);
//     { // cell1
//       const [c1, c2] = b.splitToColumns(cell1, blk.splitByExtent("*", cellSize * 8));
//       c.frameRight(ctx, c1);
//       c.drawText(ctx, "公費負担者番号", c1, "center", "center");
//       drawEightDigits(ctx, c2, data.futansha);
//     }
//     { // cell2
//       const [c1, c2] = b.splitToColumns(cell2, blk.splitByExtent("*", cellSize * 8));
//       c.frameRight(ctx, c1);
//       c.drawText(ctx, "保険者番号", c1, "center", "center");
//       drawEightDigits(ctx, c2, data.hokenshaBangou);
//     }
//   }
//   { // lower row
//     const [cell3, cell4] = b.splitToColumns(row2, b.evenSplitter(2));
//     c.frameRight(ctx, cell3);
//     { // cell3
//       const [c1, c2] = b.splitToColumns(cell3, blk.splitByExtent("*", cellSize * 7));
//       c.frameRight(ctx, c1);
//       const block = blk.stackedBlock([
//         blk.textBlock(ctx, "公費負担医療",),
//         blk.textBlock(ctx, "の受給者番号",),
//       ], { halign: "left" });
//       blk.putIn(ctx, block, c1, alignCenter);
//       drawSevenDigits(ctx, c2, data.jukyuusha);
//     }
//     { // cell4
//       const [c1, c2] = b.splitToColumns(cell4, blk.splitByExtent("*", cellSize * 8));
//       c.frameRight(ctx, c1);
//       const block = blk.stackedBlock([
//         blk.textBlock(ctx, "被保険者証・被保険"),
//         blk.textBlock(ctx, "者手帳の記号・番号"),
//       ], { halign: "left" });
//       blk.putIn(ctx, block, c1, alignCenter);
//       const hihokensha = blk.rowBlock(c.currentFontSize(ctx), [
//         blk.gapItem(1),
//         blk.expanderItem({
//           block: dataTextBlock(ctx, data.hihokenshaKigou, "d2.5"),
//           containerItemOpt: {
//             putInOpt: alignCenter
//           }
//         }),
//         blk.textItem(ctx, "・"),
//         blk.expanderItem({
//           block: dataTextBlock(ctx, data.hihokenshaBangou, "d2.5"),
//           containerItemOpt: { putInOpt: { halign: "center", valign: "center" } }
//         }),
//         blk.textItem(ctx, "(枝番)"),
//         blk.gapItem(3, {
//           block: dataTextBlock(ctx, data.edaban, "d2.5"),
//           containerItemOpt: { putInOpt: { halign: "center", valign: "center" } }
//         }),
//         blk.gapItem(1),
//       ], { maxWidth: b.width(c2) });
//       blk.putIn(ctx, hihokensha, c2, alignCenter);
//     }
//   }
// }


// function drawLowerBox(ctx: DrawerContext, box: Box, data: Shohousen2024Data): {
//   henkoufuka: Box, kanjakibou: Box; shohouBox: Box;
// } {
//   const [block1, block2, drugs, bikou, issueDate, pharma] =
//     b.splitToRows(box, blk.splitByExtent(33, 10, "*", 20, 10, 10));
//   { // block1
//     const [col1, col2] = b.splitToColumns(block1, b.evenSplitter(2));
//     c.frame(ctx, col1);
//     [col1, block2, drugs, bikou, issueDate, pharma].forEach(box => c.frame(ctx, box));
//     drawPatientBox(ctx, col1, data);
//     drawClinicBox(ctx, col2, data);
//   }
//   drawIssueBox(ctx, block2, data);
//   let layout = drawDrugs(ctx, drugs);
//   drawBikou(ctx, bikou, data);
//   drawIssueDate(ctx, issueDate, data);
//   drawPharma(ctx, pharma, data);
//   return layout;
// }

const black: Color = { r: 0, g: 0, b: 0 };
const green: Color = { r: 0, g: 255, b: 0 };
const red: Color = { r: 255, g: 0, b: 0 };

// function dataCirc(draw: boolean): BlockModifier {
//   return blk.extendRender((ctx: DrawerContext, box: Box, orig: Renderer) => {
//     orig(ctx, box);
//     if (draw) {
//       c.withPen(ctx, "data-thin", () => {
//         c.circle(ctx, b.cx(box), b.cy(box), b.height(box) * 0.6);
//       })
//     }
//   });
// }

// function drawPatientBox(ctx: DrawerContext, box: Box, data: Shohousen2024Data) {
//   const [mark, body] = b.splitToColumns(box, b.splitAt(5));
//   c.frameRight(ctx, mark);
//   c.drawTextVertically(ctx, "患　者", mark, "center", "center");
//   const rows = b.splitToRows(body, b.splitAt(10, 23));
//   [rows[0], rows[1]].forEach(box => c.frameBottom(ctx, box));
//   { // rows[0]
//     const [c1, c2] = b.splitToColumns(rows[0], b.splitAt(20));
//     c.frameRight(ctx, c1);
//     c.drawText(ctx, "氏　名", c1, "center", "center");
//     blk.putIn(ctx,
//       blk.textPackBlock(ctx, data.shimei ?? "", c2, [
//         { textBlockOpt: { font: "d5", color: black }, stackedBlockOpt: { halign: "left" } },
//         { textBlockOpt: { font: "d4", color: black }, stackedBlockOpt: { halign: "left" } },
//         { textBlockOpt: { font: "d3", color: black }, stackedBlockOpt: { halign: "left" } },
//         { textBlockOpt: { font: "d2.5", color: black }, stackedBlockOpt: { halign: "left" } },
//       ]),
//       c2, alignCenter);
//   }
//   { // rows[1]
//     const [c1, c2] = b.splitToColumns(rows[1], b.splitAt(20));
//     c.frameRight(ctx, c1);
//     c.drawText(ctx, "生年月日", c1, "center", "center");
//     const [col1, col2, col3] = b.splitToColumns(c2, b.splitAt(4, 30));
//     c.frameRight(ctx, col2);
//     const bdate = data.birthdate ? DateWrapper.from(data.birthdate) : undefined;
//     { // col1
//       const box = b.modify(col1, b.shrinkVert(1, 1), b.setWidth(2.5, "center"));
//       const [meiji, taisho, shouwa, heisei, reiwa] = b.splitToRows(box, b.evenSplitter(5));
//       const gengou = bdate?.getGengou();
//       function drawGengou(label: string, box: Box, value: string) {
//         blk.drawText(ctx, label, box, {
//           halign: "center",
//           valign: "center",
//           textBlockOpt: {
//             font: "f1.5",
//             color: green,
//             blockOpt: {
//               modifiers: [dataCirc(gengou === value)]
//             }
//           }
//         });
//       }
//       drawGengou("明", meiji, "明治");
//       drawGengou("大", taisho, "大正");
//       drawGengou("昭", shouwa, "昭和");
//       drawGengou("平", heisei, "平成");
//       drawGengou("令", reiwa, "令和");
//     }
//     { // col2
//       const box = b.modify(col2, b.setHeight(2.5, "center"), b.shrinkHoriz(0, 2.5));
//       const line = blk.rowBlock(c.currentFontSize(ctx), [
//         blk.gapItem(2.5, {
//           block: blk.textBlock(ctx, bdate?.getNen().toString() ?? "", {
//             font: "d2.5", color: black
//           }),
//           containerItemOpt: { putInOpt: { halign: "right", valign: "center" } }
//         }),
//         blk.gapItem(1),
//         blk.textItem(ctx, "年"),
//         blk.gapItem(1),
//         blk.gapItem(2.5, {
//           block: blk.textBlock(ctx, bdate?.getMonth().toString() ?? "", { font: "d2.5", color: black }),
//           containerItemOpt: { putInOpt: { halign: "right", valign: "center" } }
//         }),
//         blk.gapItem(1),
//         blk.textItem(ctx, "月"),
//         blk.gapItem(1),
//         blk.gapItem(2.5, {
//           block: blk.textBlock(ctx, bdate?.getDay().toString() ?? "", { font: "d2.5", color: black }),
//           containerItemOpt: { putInOpt: { halign: "right", valign: "center" } }
//         }),
//         blk.gapItem(1),
//         blk.textItem(ctx, "日"),
//       ]);
//       blk.putIn(ctx, line, box, { halign: "right", valign: "center" });
//     }
//     { // col3
//       const box = b.modify(col3, b.setHeight(2.5, "center"));
//       const line = blk.rowBlock(c.currentFontSize(ctx), [
//         blk.textItem(ctx, "男"),
//         blk.textItem(ctx, "・"),
//         blk.textItem(ctx, "女"),
//       ]);
//       blk.putIn(ctx, line, box, alignCenter);
//     }
//   }
//   { // rows[2]
//     const [c1, c2] = b.splitToColumns(rows[2], b.splitAt(20));
//     c.frameRight(ctx, c1);
//     c.drawText(ctx, "区　分", c1, "center", "center");
//     const [left, right] = b.splitToColumns(c2, b.evenSplitter(2));
//     c.frameRight(ctx, left);
//     let tb = blk.drawText(ctx, "被保険者", left, alignCenter);
//     if (data.hokenKubun === "hihokensha") {
//       c.withPen(ctx, "data-thin", () => {
//         c.circle(ctx, b.cx(tb), b.cy(tb), c.currentFontSize(ctx) * 0.6);
//       });
//     }
//     blk.drawText(ctx, "被扶養者", right, alignCenter);
//   }
// }

// function inkan(sizeOpt?: number, opt?: { font?: string, pen?: string }): blk.Block {
//   const size = sizeOpt ?? 2.5;
//   const font = opt?.font ?? "f1.5";
//   const pen = opt?.pen ?? "thin";
//   return {
//     width: size,
//     height: size,
//     render: (ctx: DrawerContext, box: Box) => {
//       c.withFont(ctx, font, () => {
//         c.drawText(ctx, "印", box, "center", "center");
//       });
//       c.withPen(ctx, pen, () => {
//         c.circle(ctx, b.cx(box), b.cy(box), size * 0.5);
//       });
//     }
//   }
// }

// function drawClinicBox(ctx: DrawerContext, box: Box, data: Shohousen2024Data) {
//   box = b.modify(box, b.shrinkHoriz(2, 0));
//   const [address, name, kikancode] = b.splitToRows(box, b.splitAt(10, 23));
//   { // address
//     let [left, right] = b.splitToColumns(address, b.splitAt(22));
//     const para = blk.stackedBlock([
//       blk.textBlock(ctx, "保険医療機関の"),
//       blk.textBlock(ctx, "所在地及び名称"),
//     ], { halign: "left" });
//     blk.putIn(ctx, para, left, alignCenter);
//     {
//       let [addr, name] = b.splitToRows(b.modify(right, b.shrinkHoriz(2, 2)), b.evenSplitter(2));
//       blk.drawText(ctx, data.clinicAddress ?? "", addr, {
//         halign: "left",
//         valign: "center",
//         textBlockOpt: {
//           font: "d2.5",
//           color: black,
//         }
//       });
//       blk.drawText(ctx, data.clinicName ?? "", name, {
//         halign: "left",
//         valign: "center",
//         textBlockOpt: {
//           font: "d2.5",
//           color: black,
//         }
//       });
//     }
//     b.withSplitRows(name, b.evenSplitter(2), ([upper, lower]) => {
//       {
//         [left, right] = b.splitToColumns(upper, b.splitAt(22));
//         const labelBox = b.modify(left, b.setHeight(2.5, "center"), b.setWidth(para.width, "center"));
//         let label = blk.justifiedTextBlock(ctx, "電話番号", b.width(labelBox));
//         blk.putIn(ctx, label, left, alignCenter);
//         blk.drawText(ctx, data.clinicPhone ?? "", b.modify(right, b.shrinkHoriz(2, 2)), {
//           halign: "left",
//           valign: "center",
//           textBlockOpt: {
//             font: "d3",
//             color: black,
//           }
//         });
//       }
//       {
//         [left, right] = b.splitToColumns(lower, b.splitAt(22));
//         const labelBox = b.modify(left, b.setHeight(2.5, "center"), b.setWidth(para.width, "center"));
//         let label = blk.justifiedTextBlock(ctx, "保険医氏名", b.width(labelBox));
//         blk.putIn(ctx, label, left, alignCenter);
//         const stampBox = b.modify(right, b.setHeight(2.5, "bottom"), b.setWidth(2.5, "right"), b.shift(-3.5, -2.5));
//         blk.putIn(ctx, inkan(), stampBox, alignCenter);
//         blk.drawText(ctx, data.doctorName ?? "", b.modify(right, b.shrinkHoriz(2, 2)), {
//           halign: "left",
//           valign: "center",
//           textBlockOpt: {
//             font: "d3",
//             color: black,
//           }
//         });
//       }
//     });
//   }
//   drawKikanBox(ctx, kikancode, data);
// }

// function drawKikanBox(ctx: DrawerContext, box: Box, data: Shohousen2024Data) {
//   box = b.modify(box, b.setHeight(6, "top"))
//   c.frame(ctx, box);
//   const [fukenLabel, fuken, tensuuLabel, tensuu, kikanLabel, kikancode] = b.splitToColumns(box, b.splitAt(23, 28, 38.5, 44, 51));
//   [fukenLabel, fuken, tensuuLabel, tensuu, kikanLabel].forEach(box => c.frameRight(ctx, box));
//   c.drawText(ctx, "都道府県番号", fukenLabel, "center", "center");
//   blk.drawText(ctx, data.clinicTodoufuken ?? "", fuken, {
//     textBlockOpt: { font: "d2.5", color: black },
//     ...alignCenter,
//   });
//   {
//     const para = blk.stackedBlock([
//       blk.textBlock(ctx, "点数表"),
//       blk.textBlock(ctx, "番号"),
//     ], { halign: "center" });
//     blk.putIn(ctx, para, tensuuLabel, alignCenter);
//     blk.drawText(ctx, "1", tensuu, {
//       textBlockOpt: { font: "d2.5", color: black },
//       ...alignCenter,
//     });
//   }
//   {
//     const para = blk.stackedBlock([
//       blk.textBlock(ctx, "医療機関", { font: "f1.5" }),
//       blk.textBlock(ctx, "コード", { font: "f1.5" }),
//     ], { halign: "center" });
//     blk.putIn(ctx, para, kikanLabel, alignCenter);
//   }
//   {
//     const cols = b.splitToColumns(kikancode, b.evenSplitter(7));
//     [1, 5].forEach(i => c.frameRight(ctx, cols[i]));
//     c.withPen(ctx, "thin", () => {
//       [0, 2, 3, 4].forEach(i => c.frameRight(ctx, cols[i]));
//     })
//     if (data.clinicKikancode) {
//       const chars = Array.from(data.clinicKikancode);
//       for (let i = 0; i < chars.length; i++) {
//         const chr = chars[i];
//         blk.drawText(ctx, chr, cols[i], {
//           textBlockOpt: { font: "d2.5", color: black },
//           ...alignCenter,
//         });
//       }
//     }
//   }
// }

// function drawIssueBox(ctx: DrawerContext, box: Box, data: Shohousen2024Data) {
//   c.frame(ctx, box);
//   const [left, right] = b.splitToColumns(box, b.evenSplitter(2));
//   {
//     c.frameRight(ctx, left);
//     const [label, body] = b.splitToColumns(left, b.splitAt(25));
//     c.frameRight(ctx, label);
//     c.drawText(ctx, "交付年月日", label, "center", "center");
//     const date = data.koufuDate ? DateWrapper.from(data.koufuDate) : undefined;
//     const line = blk.rowBlock(c.currentFontSize(ctx), [
//       blk.textItem(ctx, "令和"),
//       blk.gapItem(1),
//       blk.gapItem(3, {
//         block: blk.textBlock(ctx, date ? date.getNen().toString() : "", {
//           font: "d3", color: black,
//         }),
//         containerItemOpt: {
//           putInOpt: alignCenter,
//         }
//       }),
//       blk.gapItem(1),
//       blk.textItem(ctx, "年"),
//       blk.gapItem(1),
//       blk.gapItem(3, {
//         block: blk.textBlock(ctx, date ? date.getMonth().toString() : "", {
//           font: "d3", color: black,
//         }),
//         containerItemOpt: {
//           putInOpt: alignCenter,
//         }
//       }),
//       blk.gapItem(1),
//       blk.textItem(ctx, "月"),
//       blk.gapItem(1),
//       blk.gapItem(3, {
//         block: blk.textBlock(ctx, date ? date.getDay().toString() : "", {
//           font: "d3", color: black,
//         }),
//         containerItemOpt: {
//           putInOpt: alignCenter,
//         }
//       }),
//       blk.gapItem(1),
//       blk.textItem(ctx, "日"),
//     ]);
//     blk.putIn(ctx, line, body, alignCenter);
//   }
//   {
//     const [label, body] = b.splitToColumns(right, b.splitAt(25));
//     c.frameRight(ctx, label);
//     blk.putIn(ctx, blk.stackedBlock([
//       blk.textBlock(ctx, "処方箋の"),
//       blk.textBlock(ctx, "使用期間"),
//     ], { halign: "left" }), label, alignCenter);
//     const [issueLimit, comment] = b.splitToColumns(body, b.splitAt(24));
//     const date = data.validUptoDate ? DateWrapper.from(data.validUptoDate) : undefined;
//     const line = blk.rowBlock(c.currentFontSize(ctx), [
//       blk.textItem(ctx, "令和"),
//       blk.gapItem(0.5),
//       blk.gapItem(2.5, {
//         block: blk.textBlock(ctx, date ? date.getNen().toString() : "", {
//           font: "d2.5", color: black,
//         }),
//         containerItemOpt: {
//           putInOpt: alignCenter,
//         }
//       }),
//       blk.gapItem(0.5),
//       blk.textItem(ctx, "年"),
//       blk.gapItem(0.5),
//       blk.gapItem(2.5, {
//         block: blk.textBlock(ctx, date ? date.getMonth().toString() : "", {
//           font: "d2.5", color: black,
//         }),
//         containerItemOpt: {
//           putInOpt: alignCenter,
//         }
//       }),
//       blk.gapItem(0.5),
//       blk.textItem(ctx, "月"),
//       blk.gapItem(0.5),
//       blk.gapItem(2.5, {
//         block: blk.textBlock(ctx, date ? date.getDay().toString() : "", {
//           font: "d2.5", color: black,
//         }),
//         containerItemOpt: {
//           putInOpt: alignCenter,
//         }
//       }),
//       blk.gapItem(0.5),
//       blk.textItem(ctx, "日"),
//     ]);
//     blk.putIn(ctx, line, issueLimit, alignCenter);
//     const [cLeft, cBody, cRight] = b.splitToColumns(comment, blk.splitByExtent(1.5, "*", 1.5));
//     drawLeftSquareBracket(ctx, b.modify(cLeft, b.shrinkHoriz(0.75, 0), b.shrinkVert(1.5, 1.5), b.shift(0.25, 0)), { pen: "thin" });
//     c.withFont(ctx, "f1.5", () => {
//       const para = blk.stackedBlock([
//         blk.textBlock(ctx, "特に記載のある場合"),
//         blk.textBlock(ctx, "を除き、交付の日を含"),
//         blk.textBlock(ctx, "めて４日以内に保険薬"),
//         blk.textBlock(ctx, "局に提出すること。"),
//       ], { halign: "left", leading: 0.4 });
//       blk.putIn(ctx, para, cBody, alignCenter);
//     });
//     drawRightSquareBracket(ctx, b.modify(cRight, b.shrinkHoriz(0, 0.75), b.shrinkVert(1.5, 1.5), b.shift(-0.5, 0)), { pen: "thin" });
//   }
// }

// function drawDrugs(ctx: DrawerContext, box: Box): {
//   henkoufuka: Box; kanjakibou: Box; shohouBox: Box;
// } {
//   const [mark, col1, col2, body] = b.splitToColumns(box, b.splitAt(5, 18, 31));
//   [mark, col1, col2].forEach(box => c.frameRight(ctx, box))
//   {
//     c.drawTextJustifiedVertically(ctx, "処方", b.modify(mark, b.shrinkVert(14, 14)), "center");
//   }
//   let yupper = 0;
//   let henkoufuka: Box = col1;
//   let kanjakibou: Box = col2;
//   let shohouBox: Box = body;
//   {
//     const [label, _] = b.splitToRows(col1, b.splitAt(6));
//     c.frameBottom(ctx, label);
//     const para = blk.stackedBlock([
//       blk.textBlock(ctx, "変更不可"),
//       blk.setHeight(blk.textBlock(ctx, "(医療上必要)", { font: "f1.5" }), c.currentFontSize(ctx), { valign: "center" }),
//     ], { halign: "center" });
//     blk.putIn(ctx, para, label, alignCenter);
//     yupper = Math.max(yupper, b.height(label));
//   }
//   {
//     const [label, _] = b.splitToRows(col2, b.splitAt(6));
//     c.frameBottom(ctx, label);
//     c.drawText(ctx, "患者希望", label, "center", "center");
//     yupper = Math.max(yupper, b.height(label));
//   }
//   {
//     const [upper, lower] = b.splitToRows(body, b.splitAt(12.5));
//     const [cLeft, cBody, cRight] = b.splitToColumns(upper, blk.splitByExtent(1.5, "*", 1.5));
//     drawLeftSquareBracket(ctx, b.modify(cLeft, b.shrinkHoriz(0.75, 0), b.shrinkVert(1.5, 1.5), b.shift(0.3, 0)));
//     blk.putIn(ctx, blk.stackedBlock([
//       blk.textBlock(ctx, "個々の処方薬について、医療上の必要性があるため、後発医薬品（ジェネリック医薬品）"),
//       blk.textBlock(ctx, "への変更に差し支えがあると判断した場合には、「変更不可」欄に 「レ」又は「×」を記"),
//       blk.textBlock(ctx, "載し、「保険医署名」 欄に署名又は記名・押印すること。また、患者の希望を踏まえ、先"),
//       blk.textBlock(ctx, "発医薬品を処方した場合には、「患者希望」欄に「レ」又は「×」を記載すること。"),
//     ], { halign: "left" }), b.modify(cBody, b.shrinkHoriz(1, 0)), { halign: "left", valign: "center" })
//     drawRightSquareBracket(ctx, b.modify(cRight, b.shrinkHoriz(0, 0.75), b.shrinkVert(1.5, 1.5), b.shift(-0.5, 0)));
//     yupper = Math.max(yupper, b.height(upper));
//   }
//   henkoufuka = b.modify(henkoufuka, b.shrinkVert(yupper, 0));
//   kanjakibou = b.modify(kanjakibou, b.shrinkVert(yupper, 0));
//   shohouBox = b.modify(shohouBox, b.shrinkVert(yupper, 0));
//   return { henkoufuka, kanjakibou, shohouBox };
// }

// function drawBikou(ctx: DrawerContext, box: Box, data: Shohousen2024Data) {
//   const [mark, body] = b.splitToColumns(box, b.splitAt(5));
//   c.frameRight(ctx, mark);
//   c.drawTextJustifiedVertically(ctx, "備考", b.modify(mark, b.setHeight(10, "center")), "center");
//   const rows = b.splitToRows(body, b.splitAt(13));
//   const [upperLeft, upperRight] = b.splitToColumns(rows[0], b.splitAt(70));
//   { // rows[0]
//     const bb = upperLeft;
//     c.frame(ctx, bb);
//     const [label, doctorName] = b.splitToRows(bb, b.splitAt(7));
//     {
//       const [left, right] = b.splitToColumns(label, b.splitAt(21));
//       c.drawText(ctx, "保険医署名", left, "center", "center");
//       const center = blk.stackedBlock([
//         blk.textBlock(ctx, "「変更不可」蘭に「レ」又は「×」を記載", { font: "f2.3" }),
//         blk.textBlock(ctx, "した場合は、署名又は記名・押印すること。", { font: "f2.3" }),
//       ], { halign: "left" });
//       const row = blk.rowBlock(center.height, [
//         {
//           width: blk.fixedExtent(0.75),
//           render: (ctx, box) => { drawLeftSquareBracket(ctx, b.modify(box, b.shrinkVert(0, 0)), { pen: "thin" }) }
//         },
//         {
//           width: blk.fixedExtent(center.width),
//           render: (ctx, box) => center.render(ctx, box),
//         },
//         {
//           width: blk.fixedExtent(0.75),
//           render: (ctx, box) => { drawRightSquareBracket(ctx, b.modify(box, b.shrinkVert(0, 0)), { pen: "thin" }) }
//         }
//       ])
//       blk.putIn(ctx, row, b.modify(right, b.inset(1.5)), { halign: "right", valign: "top" });
//     }
//     { // doctorName
//       let showSecondDoctorName = false;
//       if (showSecondDoctorName) {
//         const bb = b.modify(doctorName, b.shrinkHoriz(15, 0));
//         blk.drawText(ctx, data.doctorName ?? "", bb, {
//           textBlockOpt: {
//             font: "d3",
//             color: black,
//           },
//           halign: "left",
//           valign: "top",
//         })
//       }

//     }
//   }
//   {
//     let [bikou1, bikou2] = [upperRight, rows[1]];
//     bikou1 = b.modify(bikou1, b.shrinkHoriz(1, 1), b.shrinkVert(1, 0));
//     bikou2 = b.modify(bikou2, b.shrinkHoriz(1, 1), b.shrinkVert(1, 1));
//     let text = data.bikou ?? "";
//     if (text !== "") {
//       const bikouBox = bikou1;
//       c.withTextColor(ctx, black, () => {
//         c.withFont(ctx, "d3", () => {
//           let para1 = blk.paragraph(ctx, text, b.width(bikouBox), b.height(bikouBox));
//           para1.block.render(ctx, bikouBox);
//           text = para1.rest;
//         });
//       })
//     }
//     if (text !== "") {
//       const bikouBox = bikou2;
//       c.withTextColor(ctx, black, () => {
//         c.withFont(ctx, "d3", () => {
//           let para1 = blk.paragraph(ctx, text, b.width(bikouBox), b.height(bikouBox));
//           para1.block.render(ctx, bikouBox);
//           text = para1.rest;
//         });
//       })
//     }
//     if (text !== "") {
//       alert("too long bikou");
//     }
//   }
// }

// function drawIssueDate(ctx: DrawerContext, box: Box, data: Shohousen2024Data) {
//   const cols = b.splitToColumns(box, b.splitAt(25, 67, 98));
//   cols.forEach(col => c.frame(ctx, col));
//   c.drawText(ctx, "調剤炭年月日", cols[0], "center", "center");
//   { // cols[1]
//     const block = blk.rowBlock(c.currentFontSize(ctx), [
//       blk.textItem(ctx, "令和"),
//       blk.expanderItem(),
//       blk.textItem(ctx, "年"),
//       blk.expanderItem(),
//       blk.textItem(ctx, "月"),
//       blk.expanderItem(),
//       blk.textItem(ctx, "日"),
//     ], { maxWidth: 27 });
//     blk.putIn(ctx, block, cols[1], alignCenter);
//   }
//   c.drawText(ctx, "公費負担者番号", cols[2], "center", "center");
//   drawEightDigits(ctx, cols[3], data.futansha2);
// }

// function drawPharma(ctx: DrawerContext, box: Box, data: Shohousen2024Data) {
//   let [c1, c2, c3, c4] = b.splitToColumns(box, b.splitAt(25, 67, 98));
//   {
//     const cw = b.width(c4) / 8;
//     c3 = b.modify(c3, b.shrinkHoriz(0, -cw));
//     c4 = b.modify(c4, b.shrinkHoriz(cw, 0));
//   }
//   [c1, c2, c3].forEach(col => c.frameRight(ctx, col));
//   {
//     const font = "f2.3";
//     const top = blk.textBlock(ctx, "保険薬局の所在地", { font });
//     const label = blk.stackedBlock([
//       top,
//       blk.justifiedTextBlock(ctx, "及び名称", top.width, { textBlockOpt: { font } }),
//       blk.justifiedTextBlock(ctx, "保険薬剤師氏名", top.width, { textBlockOpt: { font } }),
//     ], { halign: "center" });
//     blk.putIn(ctx, label, c1, alignCenter);
//   }
//   blk.putIn(ctx, inkan(), b.modify(c2, b.shrinkHoriz(0, 4)), { halign: "right", valign: "center" });
//   {
//     const upper = blk.spacedTextBlock(ctx, "公費負担医療の", 0.8);
//     const lower = blk.justifiedTextBlock(ctx, "受給者番号", upper.width);
//     const block = blk.stackedBlock([upper, lower], { halign: "left", leading: 0.5 });
//     blk.putIn(ctx, block, c3, alignCenter);
//   }
//   drawSevenDigits(ctx, c4, data.jukyuusha2);
// }

// // shohou /////////////////////////////////////////////////////////////////////////////////////////////

// interface PrepareShohouData {
//   font: string;
//   leading: number;
//   totalGroups: number;
//   groupIndex: number;
//   groups: DrugGroup[];
//   commands: string[];
// }

// function initPrepareShohouData(font: string, shohou: Shohou): PrepareShohouData {
//   return {
//     font,
//     leading: 0,
//     totalGroups: shohou.groups.length,
//     groupIndex: 1,
//     ...shohou,
//   }
// }

// function calcLastLineHeight(ctx: DrawerContext, data: PrepareShohouData): number {
//   let fontSize = c.getFontSizeOf(ctx, data.font);
//   let leading = data.leading;
//   return leading + fontSize;
// }

// function drawShohou(ctx: DrawerContext, layout: { henkoufuka: Box, kanjakibou: Box, shohouBox: Box },
//   data: PrepareShohouData): {
//     error?: string;
//     rest?: PrepareShohouData;
//     lastLineBox: Box;
//     font: string;
//   } {
//   let font = data.font;
//   let fontSize = c.getFontSizeOf(ctx, font);
//   let leading = data.leading;
//   const indexWidth = data.totalGroups < 10 ? fontSize * 2 : fontSize * 3;
//   const shohouBox = layout.shohouBox;
//   const indexBox = b.modify(shohouBox, b.setWidth(indexWidth, "left"));
//   const mainBox = b.modify(shohouBox, b.shrinkHoriz(b.width(indexBox) + 1, 1));
//   let mainCol = new ColumnBlockBuilder(b.width(mainBox));
//   let error: string | undefined = undefined;
//   let rest: PrepareShohouData | undefined = undefined;
//   let groupIndex = data.groupIndex;
//   const textBlockOpt: TextBlockOpt = { font, color: black };
//   const lastLineHeight = calcLastLineHeight(ctx, data);
//   data.groups.forEach((group, localGroupIndex) => {
//     const gi = groupIndex;
//     const groupCol = new ColumnBlockBuilder(b.width(mainBox));
//     group.drugs.forEach((drug, drugIndex) => {
//       groupCol.addBlock(
//         blk.modify(blk.textBlock(ctx, drugNameAndAmountLine(drug), textBlockOpt), blk.boxCallback(box => {
//           if (drugIndex === 0) {
//             const top = box.top - mainBox.top;
//             const bottom = box.bottom - mainBox.top;
//             const ibox = b.mkBox(indexBox.left, indexBox.top + top, indexBox.right, indexBox.top + bottom);
//             blk.drawText(ctx, indexLabel(gi), ibox, { halign: "right", valign: "center", textBlockOpt, });
//           }
//         }))
//       );
//     });
//     groupCol.addBlock(blk.textBlock(ctx, drugUsageLine(group.usage), textBlockOpt));
//     const groupBlock = groupCol.build();
//     if (mainCol.currentHeight() + leading + groupBlock.height + leading + lastLineHeight <= b.height(layout.shohouBox)) {
//       mainCol.addBlock(groupBlock);
//     } else {
//       if (mainCol.isEmpty()) {
//         error = "薬剤グループ表示の高さが高すぎます";
//         return;
//       } else {
//         rest = Object.assign({}, data, {
//           groupIndex,
//           groups: data.groups.slice(localGroupIndex),
//         });
//       }
//     }
//     groupIndex += 1;
//   });
//   if (error === undefined) {
//     mainCol.build().render(ctx, mainBox);
//   }
//   const lastLineBox = b.modify(mainBox, b.shrinkVert(mainCol.currentHeight() + leading, 0), b.setHeight(fontSize, "top"));
//   return { error, rest, lastLineBox, font };
// }

// function indexLabel(index: number): string {
//   return toZenkaku(`${index})`);
// }

// function drugNameAndAmountLine(drug: Drug): string {
//   return `${drug.name}　${drug.amount}${drug.unit}`
// }

// function drugUsageLine(usage: Usage): string {
//   switch (usage.kind) {
//     case "days": {
//       return `${usage.usage}　${usage.days}日分`;
//     }
//     case "times": {
//       return `${usage.usage}　${usage.times}回分`;
//     }
//     case "other": {
//       return `${usage.usage}`;
//     }
//   }
// }