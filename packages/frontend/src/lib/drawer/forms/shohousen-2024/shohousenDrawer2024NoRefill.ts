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
  stackedJustifiedTexts
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
  console.log("data", data);
  const ctx = prepareDrawerContext();
  const paper = { width: A5.width, height: A5.height };
  const outerBounds = insetExtent(paper, 3);
  const con = new Container();
  con.frame(outerBounds);
  const innerBounds = insetOffsetExtent(outerBounds, 1, 0, 1, 1);
  con.addCreated((ext) => mainBlock(ctx, ext, data), innerBounds);
  con.renderAt(ctx, { x: 0, y: 0 });
  return [c.getOps(ctx)];
}

function mainBlock(ctx: DrawerContext, extent: Extent, data?: ShohousenData): Renderer {
  const container = new Container();
  const rb = new RowBuilder(extent);
  const [mainTitleRow, subTitleRow, mainRow] = rb.split(rb.fixed(6), rb.fixed(2), rb.expand());
  container.add(mainTitle(ctx, mainTitleRow.extent), mainTitleRow.offset);
  container.add(subTitle(ctx, subTitleRow.extent), subTitleRow.offset);
  const inner = blk.insetOffsetExtent(mainRow, 2, 3, 2, 0);
  container.addCreated((ext) => mainArea(ctx, ext, data), inner);
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

function mainArea(ctx: DrawerContext, extent: Extent, data?: ShohousenData): Renderer {
  const con: Container = new Container();
  const rb = new RowBuilder(extent);
  const [upperRow, kanjaRow, koufuDateRow, drugsRow, bikouRow, shohouDateRow, pharmaRow] =
    rb.split(rb.fixed(20), rb.skip(3), rb.fixed(33), rb.fixed(10), rb.expand(),
      rb.fixed(20), rb.fixed(10), rb.fixed(10))
  {
    let { offset, extent } = upperRow;
    const cb = new ColumnBuilder(extent);
    const [kouhiBox, hokenBox] = cb.splitEven(2);
    con.add(kouhiRenderer(ctx, kouhiBox.extent, data), offset, kouhiBox.offset);
    con.add(hokenRenderer(ctx, hokenBox.extent, data), offset, hokenBox.offset);
    con.addCreated((ext) => koufuDateRowRenderer(ctx, ext, data), koufuDateRow);
    con.addCreated((ext) => drugsRenderer(ctx, ext, data), drugsRow);
    con.addCreated((ext) => bikouRowRenderer(ctx, ext, data), bikouRow);
    con.addCreated((ext) => shohouDateRowRenderer(ctx, ext, data), shohouDateRow);
    con.addCreated((ext) => pharmaRowRenderer(ctx, ext, data), pharmaRow);
  }
  con.add(kanjaRowRenderer(ctx, kanjaRow.extent, data), kanjaRow.offset);
  return con;
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

function drugsRenderer(ctx: DrawerContext, extent: Extent, data?: ShohousenData): Renderer {
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
  let shohouData = data?.shohouData;
  if( shohouData ){
    let [henkoufuka] = RowBuilder.fromOffsetExtent(col1).split(skip(yoffset), expand());
    let [kanjakibou] = RowBuilder.fromOffsetExtent(col2).split(skip(yoffset), expand());
    let [shohou] = RowBuilder.fromOffsetExtent(body).split(skip(yoffset), expand());
    let iter = 0;
    while( shohouHasMore(shohouData) ){
      if( ++iter > 40 ){
        throw new Error("too many iteration (advance shohou)");
      }
    }
  }
  return con;
}

function shohouHasMore(data: ShohouData): boolean {
  return data.groups.length === 0 && data.trailers.length === 0;
}

interface ShohouGroupItem {
  kind: "group";
  groupIndex: number;
  group: ShohouGroup;
}

interface ShohouTrailersItem {
  kind: "trailers";
  trailers: string[];
}

type ShohouAdvanceItem = ShohouGroupItem | ShohouTrailersItem;

function advanceShohouGroup(data: ShohouData, width: number): {
  advanceItem: ShohouAdvanceItem | undefined;
  rest: ShohouData;
} {
  let groupIndex = data.groupIndex;
  if( data.groups.length > 0 ){
    const group = data.groups[0];

  } else {
    if( data.trailers.length > 0 ){

    } else {
      return { advanceItem: undefined, rest: { groupIndex, groups: [], trailers: []}}
    }
  }
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

type ShohouData = {
  groupIndex: number;
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

type ShohousenData = Shohousen2024Data & { shohouData: ShohouData };

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
  return Object.assign({}, drawerData, { shohouData: { groupIndex: 1, groups, trailers }});
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