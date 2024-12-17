import { pad } from "@/lib/pad";
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
  shiftPosition,
  decorateItem,
  expand,
  fixed,
  stackedItems,
  skip,
  stackedTexts,
  stackedJustifiedTexts,
  breakToTextItems,
  GrowingColumn,
  GrowingColumnGroup,
  type OffsetExtent
} from "../../compiler/block";
import * as b from "../../compiler/box";
import type { Color } from "../../compiler/compiler";
import * as c from "../../compiler/compiler";
import { mkDrawerContext, type DrawerContext } from "../../compiler/context";
import type { Op } from "../../compiler/op";
import { A5 } from "../../compiler/paper-size";
import type { Shohousen2024Data } from "./shohousenData2024";
import { DateWrapper } from "myclinic-util";
import type { Drug, Usage } from "@/lib/parse-shohou";
import { toZenkaku } from "@/lib/zenkaku";

export function drawShohousen2024NoRefill(drawerData?: Shohousen2024Data): Op[][] {
  const data: ShohousenData | undefined = drawerData ? createShohousenData(drawerData) : undefined;
  const paper = { width: A5.width, height: A5.height };
  const outerBounds = insetExtent(paper, 3);
  const innerBounds = insetOffsetExtent(outerBounds, 1, 0, 1, 1);
  const pages: { ctx: DrawerContext, renderer: Renderer, lastLine: OffsetExtent }[] = [];
  let rest: ShohouItemDict[] = [];
  let iter = 0;
  do {
    const con = new Container();
    con.frame(outerBounds);
    const ctx = prepareDrawerContext();
    con.addCreated((ext) => mainBlock(ctx, ext, data), innerBounds);
    pages.push({
      ctx, renderer: con, lastLine: data?.__data.lastLine,
    })
    if( data !== undefined ){
      data.rest = rest;
    }
    if( ++iter > 5 ){
      throw new Error("too amny iteration in drawShohousen2024NoRefill main");
    }
  } while (rest.length > 0);
  const result: Op[][] = [];
  if( pages.length === 1 ){
    const page = pages[0];
    page.renderer.renderAt(page.ctx, shiftPosition({ x: 0, y: 0 }, innerBounds.offset));
    result.push(c.getOps(page.ctx));
  }
  return result;
}

function mainBlock(ctx: DrawerContext, extent: Extent, data?: ShohousenData): { renderer: Renderer; shohouResult: ShohouResult } {
  const container = new Container();
  const rb = new RowBuilder(extent);
  const [mainTitleRow, subTitleRow, mainRow] = rb.split(rb.fixed(6), rb.fixed(2), rb.expand());
  container.add(mainTitle(ctx, mainTitleRow.extent), mainTitleRow.offset);
  container.add(subTitle(ctx, subTitleRow.extent), subTitleRow.offset);
  const inner = blk.insetOffsetExtent(mainRow, 2, 3, 2, 0);
  const result = mainArea(ctx, inner.extent, data);
  const shohouResult = result.shohouResult;
  container.add(result.renderer, inner.offset);
  return { renderer: container, shohouResult };
}

function mainTitle(ctx: DrawerContext, extent: Extent): Item {
  const item = textItem(ctx, "処方箋", { font: "f4", color: green });
  return alignedItem(item, extent, "center", "center");
}

function subTitle(ctx: DrawerContext, extent: Extent): Item {
  let item = textItem(ctx, "(この処方箋は、どの保険薬局でも有効です。)");
  return alignedItem(item, extent, "center", "center");
}

function mainArea(ctx: DrawerContext, extent: Extent, data?: ShohousenData): { renderer: Renderer, shohouResult: ShohouResult } {
  const con: Container = new Container();
  const rb = new RowBuilder(extent);
  const [upperRow, kanjaRow, koufuDateRow, drugsRow, bikouRow, shohouDateRow, pharmaRow] =
    rb.split(rb.fixed(20), rb.skip(3), rb.fixed(33), rb.fixed(10), rb.expand(),
      rb.fixed(20), rb.fixed(10), rb.fixed(10));
  let shohouResult: ShohouResult;
  {
    let { offset, extent } = upperRow;
    const cb = new ColumnBuilder(extent);
    const [kouhiBox, hokenBox] = cb.splitEven(2);
    con.add(kouhiRenderer(ctx, kouhiBox.extent, data), offset, kouhiBox.offset);
    con.add(hokenRenderer(ctx, hokenBox.extent, data), offset, hokenBox.offset);
    con.addCreated((ext) => koufuDateRowRenderer(ctx, ext, data), koufuDateRow);
    {
      const result = drugsRenderer(ctx, drugsRow.extent, data);
      con.add(result.renderer, drugsRow.offset);
      shohouResult = result.shohouResult;
    }
    con.addCreated((ext) => drugsRenderer(ctx, ext, data).renderer, drugsRow);
    con.addCreated((ext) => bikouRowRenderer(ctx, ext, data), bikouRow);
    con.addCreated((ext) => shohouDateRowRenderer(ctx, ext, data), shohouDateRow);
    con.addCreated((ext) => pharmaRowRenderer(ctx, ext, data), pharmaRow);
  }
  con.add(kanjaRowRenderer(ctx, kanjaRow.extent, data), kanjaRow.offset);
  return { renderer: con, shohouResult };
}

function kanjaRowRenderer(ctx: DrawerContext, extent: Extent, data?: ShohousenData): Renderer {
  const cb = new ColumnBuilder(extent);
  const [patientArea, clinicArea] = cb.splitEven(2);
  const con = new Container();
  con.add(kanjaAreaRenderer(ctx, patientArea.extent, data), patientArea.offset);
  con.add(clinicAreaRenderer(ctx, clinicArea.extent, data), clinicArea.offset);
  return con;
}

function kanjaAreaRenderer(ctx: DrawerContext, extent: Extent, data?: ShohousenData): Renderer {
  const con = new Container();
  con.add(blk.frame(extent));
  const cb = new ColumnBuilder(extent);
  const [mark, body] = cb.split(cb.fixed(5), cb.expand());
  con.add(blk.frameRight(mark.extent));
  con.add(blk.boxItem(mark.extent, (ctx, box) => {
    box = b.modify(box, b.shrinkVert(10, 10));
    c.drawTextJustifiedVertically(ctx, "患者", box, "center");
  }), mark.offset);
  {
    const rb = new RowBuilder(body.extent, body.offset);
    const [name, birthdateAndSex, kubun] = rb.splitEven(3);
    con.add(blk.frameBottom(name.extent), name.offset);
    con.add(blk.frameBottom(birthdateAndSex.extent), birthdateAndSex.offset);
    {
      const cb = ColumnBuilder.fromOffsetExtent(name);
      const [label, body] = cb.split(cb.fixed(20), cb.expand());
      con.add(blk.frameRight(label.extent), label.offset);
      con.addAligned(textItem(ctx, "氏　名"), label, "center", "center");
      con.addCreated((ext) => shimeiRenderer(ctx, ext, data?.shimei), insetOffsetExtent(body, 1));
    }
    {
      const cb = new ColumnBuilder(birthdateAndSex.extent, birthdateAndSex.offset);
      const [label, birthdate, sex] = cb.split(cb.fixed(20), cb.expand(), cb.fixed(10));
      con.add(blk.frameRight(label.extent), label.offset);
      con.frameRight(birthdate);
      con.addAligned(textItem(ctx, "生年月日"), label, "center", "center");
      con.addCreated((ext) => birthdateRenderer(ctx, ext, data?.birthdate), birthdate);
      con.addCreated((ext) => sexRenderer(ctx, ext, data?.sex), sex);
    }
    {
      const cb = new ColumnBuilder(kubun.extent, kubun.offset);
      const [label, body] = cb.split(cb.fixed(20), cb.expand());
      con.add(blk.frameRight(label.extent), label.offset);
      con.add(blk.frameRight(label.extent), label.offset);
      con.addAligned(textItem(ctx, "区　分"), label, "center", "center");
      con.addCreated((ext) => kubunRenderer(ctx, ext, data?.hokenKubun), body);
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
  opt?: { gengou?: string, nenWidth?: number; monthWidth?: number; dayWidth?: number; gap?: number })
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
  let gengouItems: blk.FlexRowItem[] = [];
  if (opt?.gengou) {
    gengouItems = [
      { kind: "item", item: textItem(ctx, opt?.gengou) },
      { kind: "gap", width: gap },
    ]
  }
  const nenContent = content(date?.getNen());
  const monthContent = content(date?.getMonth());
  const dayContent = content(date?.getDay());
  return flexRow(2.5, [
    ...gengouItems,
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
  const [gengou, body] = cb.split(cb.fixed(4), cb.expand());
  con.addCreated((ext) => gengouRenderer(ext, bdate?.getGengou()), gengou);
  con.addCreated((ext) => bodyRenderer(ext, bdate), body);
  return con;
}

function circleDecorator(draw: boolean, radius: number): (ext: Extent) => Renderer {
  if (draw) {
    return (ext: Extent) => ({
      renderAt(ctx: DrawerContext, pos: Position) {
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
    { kind: "item", item: textItem(ctx, "男"), decorator: circleDecorator(sex === "M", 1.5) },
    { kind: "item", item: textItem(ctx, "・") },
    { kind: "item", item: textItem(ctx, "女"), decorator: circleDecorator(sex === "F", 1.5) },
  ]);
  return alignedItem(row, extent, "center", "center");
}

function decorateCircle(radius: number): (ext: Extent) => Renderer {
  return (ext) => ({
    renderAt(ctx: DrawerContext, pos: Position) {
      const center = shiftPosition(pos, blk.centerOfExtent(ext));
      c.withPen(ctx, "data-thin", () => {
        c.circle(ctx, center.x, center.y, radius);
      });
    }
  });
}

function kubunRenderer(ctx: DrawerContext, extent: Extent, kubun: "hihokensha" | "hifuyousha" | undefined): Renderer {
  const cb = new ColumnBuilder(extent);
  const [hihokenshaCol, hifuyoushaCol] = cb.splitEven(2);
  let hihokenshaLabel = textItem(ctx, "被保険者");
  let hifuyoushaLabel = textItem(ctx, "被扶養者");
  if (kubun === "hihokensha") {
    hihokenshaLabel = decorateItem(hihokenshaLabel, decorateCircle(1.5));
  } else if (kubun === "hifuyousha") {
    hifuyoushaLabel = decorateItem(hifuyoushaLabel, decorateCircle(1.5));
  }
  const con = new Container();
  con.frameRight(hihokenshaCol);
  con.addAligned(hihokenshaLabel, hihokenshaCol, "center", "center");
  con.addAligned(hifuyoushaLabel, hifuyoushaCol, "center", "center");
  return con;
}

function clinicAreaRenderer(ctx: DrawerContext, extent: Extent, data?: ShohousenData): Renderer {
  const con = new Container();
  const inset = insetExtent(extent, 2, 0, 0, 0);
  const rb = new RowBuilder(inset.extent, inset.offset);
  const [addr, name, kikan] = rb.split(rb.fixed(10), rb.expandTo(23), rb.skip(2), rb.fixed(6)); // rb.splitAt(10, 23);
  let labelWidth = 0;
  con.addCreated((ext) => {
    const result = clinicAddressRenderer(ctx, ext, data);
    labelWidth = result.labelWidth;
    return result;
  }, addr);
  con.addCreated((ext) => clinicNameRenderer(ctx, ext, labelWidth, data), name);
  con.addCreated((ext) => kikanRenderer(ctx, ext, labelWidth, data), kikan);
  return con;
}

function clinicAddressRenderer(ctx: DrawerContext, extent: Extent, data?: ShohousenData): Renderer & { labelWidth: number } {
  const con = new Container();
  const cb = new ColumnBuilder(extent);
  const [left, right] = cb.split(cb.fixed(22), cb.skip(2), cb.expand());
  let labelWidth = 0;
  {
    const labelItem = stackedTexts(ctx, ["保険医療機関の", "所在地及び名称"], { halign: "left" });
    labelWidth = labelItem.extent.width;
    con.addAligned(labelItem, left, "center", "center");
  }
  {
    const rb = new RowBuilder(right.extent, right.offset);
    const [addr, name] = rb.splitEven(2);
    if (data?.clinicAddress) {
      const addrItem = textItem(ctx, data?.clinicAddress, { font: "d2.5", color: black });
      con.addAligned(addrItem, addr, "left", "center");
    }
    if (data?.clinicName) {
      const clinicNameItem = textItem(ctx, data?.clinicName, { font: "d2.5", color: black });
      con.addAligned(clinicNameItem, name, "left", "center");
    }
  }
  return Object.assign(con, { labelWidth });
}

function clinicNameRenderer(ctx: DrawerContext, extent: Extent, labelWidth: number, data?: ShohousenData): Renderer {
  const con = new Container();
  const rb = new RowBuilder(extent);
  const [phone, name] = rb.splitEven(2);
  {
    const cb = new ColumnBuilder(phone.extent, phone.offset);
    const [left, right] = cb.split(cb.fixed(22), cb.skip(2), cb.expand());
    const phoneLabel = blk.justifiedText(ctx, "電話番号", labelWidth);
    const phoneValue = data?.clinicPhone ? textItem(ctx, data?.clinicPhone, { font: "d2.5", color: black }) : emptyItem();
    con.addAligned(phoneLabel, left, "center", "center");
    con.addAligned(phoneValue, right, "left", "center");
  }
  {
    const cb = new ColumnBuilder(name.extent, name.offset);
    const [left, right, stamp] = cb.split(cb.fixed(22), cb.skip(2), cb.expand(), cb.skip(2), cb.fixed(2.5), cb.skip(8));
    const nameLabel = blk.justifiedText(ctx, "保険医氏名", labelWidth);
    const nameValue = data?.doctorName ? textItem(ctx, data?.doctorName, { font: "d2.5", color: black }) : emptyItem();
    con.addAligned(nameLabel, left, "center", "center");
    con.addAligned(nameValue, right, "left", "center");
    con.addAligned(textItem(ctx, "㊞"), stamp, "center", "center");
  }
  return con;
}

function kikanRenderer(ctx: DrawerContext, extent: Extent, labelWidth: number, data?: ShohousenData): Renderer {
  const con = new Container();
  con.frame({ offset: blk.zeroOffset(), extent })
  const cb = new ColumnBuilder(extent);
  const [fukenLabel, fuken, tensuuLabel, tensuu, kikanLabel, kikancode] = cb.splitAt(23, 28, 38.5, 44, 51);
  [fukenLabel, fuken, tensuuLabel, tensuu, kikanLabel].forEach(box => con.frameRight(box));
  con.addAligned(textItem(ctx, "都道府県番号"), fukenLabel, "center", "center");
  {
    const cb = ColumnBuilder.fromOffsetExtent(fuken);
    const cols = cb.splitEven(2);
    con.frameRight(cols[0], "thin");
    if (data?.clinicTodoufuken) {
      const fuken = pad(data?.clinicTodoufuken, 2, "0");
      for (let i = 0; i < 2; i++) {
        con.addAligned(textItem(ctx, fuken.charAt(i), { font: "d2.5", color: black }), cols[i], "center", "center");
      }
    }
  }
  con.addAligned(stackedTexts(ctx, ["点数表", "番号"], { halign: "center" }), tensuuLabel, "center", "center")
  con.addAligned(textItem(ctx, "1", { font: "d2.5", color: black }), tensuu, "center", "center");
  con.addAligned(stackedTexts(ctx, ["医療機関", "コード"], { font: "f1.5", halign: "center" }), kikanLabel, "center", "center");
  {
    const cb = ColumnBuilder.fromOffsetExtent(kikancode);
    const cols = cb.splitEven(7);
    [1, 5].forEach(i => con.frameRight(cols[i]));
    [0, 2, 3, 4].forEach(i => con.frameRight(cols[i], "thin"));
    if (data?.clinicKikancode) {
      const kikancode = data?.clinicKikancode;
      Array.from(kikancode).forEach((ch, i) => {
        con.addAligned(textItem(ctx, ch, { font: "d2.5", color: black }), cols[i], "center", "center");
      })
    }
  }
  return con;
}

function kouhiRenderer(ctx: DrawerContext, extent: Extent, data?: ShohousenData): Renderer {
  const con = new Container();
  con.add(blk.frame(extent));
  const rb = new RowBuilder(extent);
  const [upper, lower] = rb.splitEven(2);
  con.add(blk.frameBottom(upper.extent), upper.offset);
  const digitWidth = 5;
  {
    const { offset, extent } = upper;
    const cb = new ColumnBuilder(extent);
    const [label, digits] = cb.split(cb.expand(), cb.fixed(digitWidth * 8));
    con.add(blk.frameRight(label.extent), offset, label.offset);
    con.add(blk.alignedText(ctx, "公費負担者番号", label.extent, "center", "center"), offset, label.offset);
    con.add(eightDigits(ctx, digits.extent, data?.futansha), offset, digits.offset);
  }
  {
    const { offset, extent } = lower;
    const cb = new ColumnBuilder(extent);
    const [label, digits] = cb.split(cb.expand(), cb.fixed(digitWidth * 7));
    con.add(blk.frameRight(label.extent), offset, label.offset);
    let labelItem = stackedTexts(ctx, ["公費負担医療", "の受給者番号"]);
    labelItem = alignedItem(labelItem, label.extent, "center", "center");
    con.add(labelItem, offset, label.offset);
    con.add(sevenDigits(ctx, digits.extent, data?.jukyuusha), offset, digits.offset);
  }
  return con;
}

function hokenRenderer(ctx: DrawerContext, extent: Extent, data?: ShohousenData): Renderer {
  const con = new Container();
  con.add(blk.frame(extent));
  const rb = new RowBuilder(extent);
  const [upper, lower] = rb.splitEven(2);
  con.add(blk.frameBottom(upper.extent), upper.offset);
  const digitWidth = 5;
  {
    const { offset, extent } = upper;
    const cb = new ColumnBuilder(extent);
    const [label, digits] = cb.split(cb.expand(), cb.fixed(digitWidth * 8));
    con.add(blk.frameRight(label.extent), offset, label.offset);
    con.add(blk.alignedText(ctx, "保険者番号", label.extent, "center", "center"), offset, label.offset);
    con.add(eightDigits(ctx, digits.extent, data?.hokenshaBangou), offset, digits.offset);
  }
  {
    const { offset, extent } = lower;
    const cb = new ColumnBuilder(extent);
    const [label, kigouBangou] = cb.split(cb.expand(), cb.fixed(digitWidth * 8));
    con.add(blk.frameRight(label.extent), offset, label.offset);
    let labelItem = stackedTexts(ctx, ["被保険者証・被保険", "者手帳の記号・番号"]);
    labelItem = alignedItem(labelItem, label.extent, "center", "center");
    con.add(labelItem, offset, label.offset);
    con.add(kigouBangouRenderer(ctx, kigouBangou.extent, data), offset, kigouBangou.offset);
  }
  return con;
}

function kigouBangouRenderer(ctx: DrawerContext, extent: Extent, data?: ShohousenData): Renderer {
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

function koufuDateRowRenderer(ctx: DrawerContext, extent: Extent, data?: ShohousenData): Renderer {
  const con = new Container();
  con.frame({ offset: blk.zeroOffset(), extent });
  const cb = new ColumnBuilder(extent);
  const [issueDate, issueDateLimit] = cb.splitEven(2);
  con.frameRight(issueDate);
  {
    const cb = ColumnBuilder.fromOffsetExtent(issueDate);
    const [label, body] = cb.splitAt(25);
    con.frameRight(label);
    con.addAligned(textItem(ctx, "交付年月日"), label, "center", "center");
    const value = nenMonthDateRenderer(ctx, data?.koufuDate ? DateWrapper.from(data?.koufuDate) : undefined, {
      gengou: "令和",
    });
    con.addAligned(value, body, "center", "center");
  }
  {
    const cb = ColumnBuilder.fromOffsetExtent(issueDateLimit);
    const [label, body, append] = cb.splitAt(25, 48);
    con.frameRight(label);
    con.addAligned(stackedTexts(ctx, ["処方箋の", "試用期間"], { halign: "center" }), label, "center", "center");
    const dateItem = nenMonthDateRenderer(ctx, optionalDateWrapper(data?.validUptoDate), { gengou: "令和", gap: 0.3 });
    con.addAligned(dateItem, body, "right", "center");
    const texts = stackedTexts(ctx, [
      "特に記載のある場合",
      "を除き、交付の日を含",
      "めて４日以内に保険薬",
      "局に提出すること。",
    ], { halign: "left", font: "f1.5", leading: 0.5 });
    con.addAligned(brackettedItem(texts, { size: 0.75, }), append, "center", "center");
  }
  return con;
}

function brackettedItem(content: Item, opt?: {
  size?: number, leftGap?: number, rightGap?: number, pen?: string
}): Item {
  const height = content.extent.height;
  const size = opt?.size ?? 0.75;
  const leftGap = opt?.leftGap ?? 0.2;
  const rightGap = opt?.rightGap ?? 0.2;
  const width = content.extent.width + size * 2 + leftGap + rightGap;
  const pen = opt?.pen ?? "thin";
  const con = new Container();
  const cb = new ColumnBuilder({ width, height });
  const [left, body, right] = cb.split(cb.fixed(size), cb.skip(leftGap), cb.expand(), cb.skip(rightGap), cb.fixed(size));
  const leftBra: Item = blk.boxItem(left.extent, (ctx, box) => {
    c.withPen(ctx, pen, () => {
      c.moveTo(ctx, box.right, box.top);
      c.lineTo(ctx, box.left, box.top);
      c.lineTo(ctx, box.left, box.bottom);
      c.lineTo(ctx, box.right, box.bottom);
    });
  });
  const rightBra: Item = blk.boxItem(left.extent, (ctx, box) => {
    c.withPen(ctx, pen, () => {
      c.moveTo(ctx, box.left, box.top);
      c.lineTo(ctx, box.right, box.top);
      c.lineTo(ctx, box.right, box.bottom);
      c.lineTo(ctx, box.left, box.bottom);
    });
  });
  con.add(leftBra, left.offset);
  con.add(content, body.offset);
  con.add(rightBra, right.offset);
  return Object.assign(con, { extent: { width, height } });
}

function optionalDateWrapper(date: string | undefined): DateWrapper | undefined {
  if (date !== undefined) {
    return DateWrapper.from(date);
  } else {
    return undefined;
  }
}

function bikouRowRenderer(ctx: DrawerContext, extent: Extent, data?: ShohousenData): Renderer {
  const con = new Container();
  con.frame({ offset: blk.zeroOffset(), extent });
  const cb = new ColumnBuilder(extent);
  const [mark, body] = cb.splitAt(5);
  con.frameRight(mark);
  con.addAligned(blk.verticallyJustifiedText(ctx, "備考", 11), mark, "center", "center");
  const rb = RowBuilder.fromOffsetExtent(body);
  const rows = rb.splitAt(13);
  const [upperLeft, upperRight] = ColumnBuilder.fromOffsetExtent(rows[0]).splitAt(70);
  con.frame(upperLeft);
  {
    const [label, doctorName] = RowBuilder.fromOffsetExtent(upperLeft).splitAt(7);
    {
      const [left, right] = ColumnBuilder.fromOffsetExtent(label).split(cb.fixed(21), cb.expand(), cb.fixed(2));
      con.addAligned(textItem(ctx, "保険医署名"), left, "center", "center");
      const texts = stackedTexts(ctx, [
        "「変更不可」蘭に「レ」又は「×」を記載",
        "した場合は、署名又は記名・押印すること。"
      ], { halign: "left", font: "f2.3" });
      const bracket = brackettedItem(texts);
      con.addAligned(bracket, right, "center", "center");
    }
    {
      let showSecondDoctorName = false;
      if (showSecondDoctorName && data?.doctorName) {
        const [area] = ColumnBuilder.fromOffsetExtent(doctorName).split(cb.skip(15), cb.expand());
        con.addAligned(textItem(ctx, data?.doctorName, { font: "d3", color: black }), area, "left", "center");
      }
    }
    {
      let bikou = data?.bikou ?? "";
      const upperRightInner = insetOffsetExtent(upperRight, 1, 1, 1, 0);
      let { renderer, rest: rest1 } = blk.flowTextIn(ctx, upperRightInner.extent, bikou, { font: "d3", color: black });
      con.add(renderer, upperRightInner.offset);
      if (rest1 !== "") {
        const restInner = insetOffsetExtent(rows[1], 1);
        let { renderer, rest: rest2 } = blk.flowTextIn(ctx, restInner.extent, rest1, { font: "d3", color: black });
        con.add(renderer, restInner.offset);
        if (rest2 !== "") {
          throw new Error(`too long bikou: ${rest2}`);
        }
      }
    }
  }
  return con;
}

function shohouDateRowRenderer(ctx: DrawerContext, extent: Extent, data?: ShohousenData): Renderer {
  const con = new Container();
  con.frameExtent(extent);
  const [left, right] = ColumnBuilder.fromExtent(extent).splitEven(2);
  con.frameRight(left);
  {
    const [label, body] = ColumnBuilder.fromOffsetExtent(left).splitAt(25);
    con.frameRight(label);
    con.addAligned(textItem(ctx, "調剤年月日"), label, "center", "center");
    con.addAligned(nenMonthDateRenderer(ctx, undefined, { gengou: "令和" }), body, "center", "center");
  }
  {
    const digitWidth = 5;
    const [label, body] = ColumnBuilder.fromOffsetExtent(right).split(expand(), fixed(digitWidth * 8));
    con.frameRight(label);
    con.addAligned(textItem(ctx, "公費負担者番号"), label, "center", "center");
    con.add(eightDigits(ctx, body.extent, data?.futansha2), body.offset);
  }
  return con;
}

function pharmaRowRenderer(ctx: DrawerContext, extent: Extent, data?: ShohousenData): Renderer {
  const con = new Container();
  con.frameExtent(extent);
  const [left, right] = ColumnBuilder.fromExtent(extent).splitEven(2);
  con.frameRight(left);
  {
    const [label, body] = ColumnBuilder.fromOffsetExtent(left).splitAt(25);
    con.frameRight(label);
    const line1 = textItem(ctx, "保険薬局の所在地");
    const line2 = blk.justifiedText(ctx, "及び名称", line1.extent.width);
    const line3 = blk.justifiedText(ctx, "保険薬剤師氏名", line1.extent.width);
    const labelItem = stackedItems([line1, line2, line3], { halign: "left" });
    con.addAligned(labelItem, label, "center", "center");
    const [area] = ColumnBuilder.fromOffsetExtent(body).split(expand(), skip(5));
    con.addAligned(textItem(ctx, "㊞"), area, "right", "center");
  }
  {
    const digitWidth = 5;
    const [label, body] = ColumnBuilder.fromOffsetExtent(right).split(expand(), fixed(digitWidth * 7));
    con.frameRight(label);
    const labelItem = stackedJustifiedTexts(ctx, ["公費負担医療の", "受給者番号"]);
    con.addAligned(labelItem, label, "center", "center");
    con.add(sevenDigits(ctx, body.extent, data?.jukyuusha2), body.offset);
  }
  return con;
}

function drugsRenderer(ctx: DrawerContext, extent: Extent, data?: ShohousenData): { renderer: Renderer, shohouResult: ShohouResult } {
  const con = new Container();
  con.frameExtent(extent);
  const [mark, col1, col2, body] = ColumnBuilder.fromExtent(extent).splitAt(5, 18, 31);
  con.frameRight(col1);
  con.frameRight(col2);
  const [col1Label] = RowBuilder.fromOffsetExtent(col1).split(fixed(6));
  const [col2Label] = RowBuilder.fromOffsetExtent(col2).split(fixed(6));
  let yoffset = 0;
  {
    con.frameRight(mark);
    const label = blk.verticallyJustifiedText(ctx, "処方", 28);
    con.addAligned(label, mark, "center", "center");
  }
  {
    con.frameBottom(col1Label);
    const line1 = textItem(ctx, "変更不可");
    const line2 = textItem(ctx, "(医療上必要)", { font: "f1.5" });
    const labelItem = stackedItems([line1, line2], { halign: "center" });
    con.addAligned(labelItem, col1Label, "center", "center");
  }
  {
    con.frameBottom(col2Label);
    con.addAligned(textItem(ctx, "患者希望"), col2Label, "center", "center");
  }
  {
    const texts = stackedTexts(ctx, [
      "個々の処方薬について、医療上の必要性があるため、後発医薬品（ジェネリック医薬品）",
      "への変更に差し支えがあると判断した場合には、「変更不可」欄に 「レ」又は「×」を記",
      "載し、「保険医署名」 欄に署名又は記名・押印すること。また、患者の希望を踏まえ、先",
      "発医薬品を処方した場合には、「患者希望」欄に「レ」又は「×」を記載すること。",
    ], { font: "f2.3" });
    const [upper, lower] = RowBuilder.fromOffsetExtent(body).split(skip(0.2), fixed(texts.extent.height), skip(0.2), fixed(0));
    const notice = brackettedItem(texts);
    con.addAligned(notice, upper, "center", "center");
    yoffset = lower.offset.dy;
  }
  let shohouFont = "d3.5";
  const shohouFontSize = c.resolveFontHeight(ctx, shohouFont);
  let rest: ShohouItemDict[] = [];
  if (data?.rest !== undefined) {
    rest = data?.rest;
  } else if (data?.shohouData) {
    const shohouData = data?.shohouData;
    rest = shohouDataToItems(ctx, shohouData, col1.extent.width, col2.extent.width, body.extent.width, shohouFont);
  }
  let dy = 0;
  if (rest.length > 0) {
    const font = shohouFont;
    let [henkoufuka] = RowBuilder.fromOffsetExtent(col1).split(skip(yoffset), expand());
    let [kanjakibou] = RowBuilder.fromOffsetExtent(col2).split(skip(yoffset), expand());
    let [shohou] = RowBuilder.fromOffsetExtent(body).split(skip(yoffset), expand());
    let iter = 0;
    while (rest.length > 0) {
      const itemGroup = rest[0];
      const space = shohou.extent.height - dy;
      if (space >= itemGroup.shohou.extent.height) {
        con.add(itemGroup.shohou, shohou.offset, { dx: 0, dy });
        dy += itemGroup.shohou.extent.height;
        rest.shift();
      } else {
        break;
      }
      if (++iter > 100) {
        throw new Error("too many iteration (shohou)");
      }
    }
  }
  let lastLine = {
    extent: { width: body.extent.width, height: shohouFontSize },
    offset: { dx: body.offset.dx, dy: body.offset.dy + dy }
  };
  return { renderer: con, shohouResult: { rest, lastLine } };
}

interface ShohouResult {
  rest: ShohouItemDict[];
  lastLine: OffsetExtent;
}

interface ShohouItemDict {
  henkoufuka: Item,
  kanjakibou: Item,
  shohou: Item
}

function shohouDataToItems(ctx: DrawerContext, data: ShohouData,
  henkoufukaWidth: number, kanjakibouWidth: number, shohouWidth: number, font: string): ShohouItemDict[] {
  const fontSize = c.resolveFontHeight(ctx, font);
  const indexWidth = data.groups.length < 10 ? fontSize * 2 : fontSize * 3;
  const result: ShohouItemDict[] = [];
  for (let i = 0; i < data.groups.length; i++) {
    const group = data.groups[i];
    const henkoufukaCol = new GrowingColumn(henkoufukaWidth);
    const kanjakibouCol = new GrowingColumn(kanjakibouWidth);
    const indexCol = new GrowingColumn(indexWidth);
    const drugCol = new GrowingColumn(shohouWidth - indexWidth);
    const shohouCol = new GrowingColumnGroup(indexCol, drugCol);
    const indexItem = textItem(ctx, indexLabel(i + 1), { font, color: black });
    indexCol.add(indexItem, "right");
    for (let drug of group.drugs) {
      const nameItems: Item[] = breakToTextItems(ctx, drug.text, drugCol.width, { font, color: black });
      for (let nameItem of nameItems) {
        drugCol.add(nameItem);
      }
    }
    const lines = [group.usage, ...group.trailers];
    lines.forEach(line => {
      const items = breakToTextItems(ctx, line, drugCol.width, { font, color: black });
      items.forEach(item => drugCol.add(item));
    })
    const height = drugCol.top;
    [henkoufukaCol, kanjakibouCol].forEach(col => col.advanceTo(height));
    result.push({
      henkoufuka: henkoufukaCol.toItem(),
      kanjakibou: kanjakibouCol.toItem(),
      shohou: shohouCol.toItem(),
    })
  }
  return result;
}

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
  c.createFont(ctx, "d3.5", "MS Gothic", 3.5);
  c.createFont(ctx, "d3", "MS Gothic", 3);
  c.createFont(ctx, "d2.5", "MS Gothic", 2.5);
}

function initPen(ctx: DrawerContext) {
  c.createPen(ctx, "default", 0, 255, 0, 0.25);
  c.createPen(ctx, "thin", 0, 255, 0, 0.1);
  c.createPen(ctx, "data-thin", 0, 0, 0, 0.1);
}

type ShohouData = {
  groups: ShohouGroup[];
  trailers: string[];
}

type ShohouGroup = {
  drugs: ShohouDrug[];
  usage: string;
  trailers: string[];
}

type Senpatsu = "henkoufuka" | "kanjakibou" | undefined;

type ShohouDrug = {
  text: string;
  senpatsu: Senpatsu;
}

type ShohousenData = Shohousen2024Data & { 
  __data: {
    shohou: {
      kind: "data";
      data: ShohouData;
    } | {
      kind: "rest";
      rest: ShohouItemDict[];
    },
    font: string;
    lastLine: OffsetExtent;
  }
};

function createShohousenData(drawerData: Shohousen2024Data): ShohousenData {
  const groups: ShohouGroup[] = [];
  const trailers: string[] = [];
  const drugs = drawerData.drugs;
  if (drugs !== undefined) {
    drugs.groups.forEach(g => {
      const drugs: ShohouDrug[] = [];
      g.drugs.forEach(d => {
        drugs.push({ text: drugNameAndAmountLine(d), senpatsu: undefined });
      });
      const usage = drugUsageLine(g.usage);
      const trailers: string[] = [];
      groups.push({ drugs, usage, trailers });
    });
  }
  const shohouData: ShohouData = { groups, trailers };
  return Object.assign({}, drawerData, {
    __data: {
      shohou: { kind: "data" as const, data: shohouData },
      font: "d3.5",
      lastLine: { offset: { dx: 0, dy: 0 }, extent: { width: 0, height: 0 }},
    }
  });
}

function indexLabel(index: number): string {
  return toZenkaku(`${index})`);
}

function drugNameAndAmountLine(drug: Drug): string {
  return `${drug.name}　${drug.amount}${drug.unit}`
}

function drugUsageLine(usage: Usage): string {
  switch (usage.kind) {
    case "days": {
      return `${usage.usage}　${usage.days}日分`;
    }
    case "times": {
      return `${usage.usage}　${usage.times}回分`;
    }
    case "other": {
      return `${usage.usage}`;
    }
  }
}

function lastLineItem(ctx: DrawerContext, font: string): Item {
  return textItem(ctx, "--- 以下余白 ---", { font, color: black });
}

function mkContinueLineBlock(ctx: DrawerContext, font: string, page: number, totalPages: number): Item {
  const text = page < totalPages
    ? `--- 次ページに続く　（${page} / ${totalPages}） ---`
    : `--- 以下余白　（${page} / ${totalPages}） ---`;
  return textItem(ctx, text, { font, color: red });
}

const black: Color = { r: 0, g: 0, b: 0 };
const green: Color = { r: 0, g: 255, b: 0 };
const red: Color = { r: 255, g: 0, b: 0 };

