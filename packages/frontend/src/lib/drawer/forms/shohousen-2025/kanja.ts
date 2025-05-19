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
import { drawElement, stackedTexts } from "./element";
import { black } from "./helper";

export function drawKanja(ctx: DrawerContext,  frame: Box, data: ShohousenData2025) {
  let [patient, clinic] = b.splitToColumns(frame, b.evenSplitter(2));
  drawPatient(ctx, patient, data);
  drawClinic(ctx, clinic, data);
}

export function drawPatient(ctx: DrawerContext,  frame: Box, data: ShohousenData2025) {
  c.frame(ctx, frame);
  let [ mark, body ] = b.splitToColumns(frame, b.splitAt(5));
  c.frameRight(ctx, mark);
  let markLabel = b.modify(mark, b.shrinkVert(10, 10));
  c.drawTextJustifiedVertically(ctx, "患者", markLabel, "center");
  let [name, birthdayAndSex, kubun] = b.splitToRows(body, b.evenSplitter(3));
  [name, birthdayAndSex].forEach(b => c.frameBottom(ctx, b));
  let leftWidth = 20;
  drawShimei(ctx, name, leftWidth, data);
  drawBirthdayAndSex(ctx, birthdayAndSex, leftWidth, data);
  drawKubun(ctx, kubun, leftWidth, data);
}

export function drawClinic(ctx: DrawerContext,  frame: Box, data: ShohousenData2025) {
  let insetFrame = b.modify(frame, b.inset(2, 0, 0, 0));
  let labelWidth = 24;
  cr.renderCol(ctx, insetFrame,
    cr.fixed(10, (ctx, box) => {
      r.renderRow(ctx, box,
        r.fixed(labelWidth, drawAddressLabel),
        r.fixed(labelWidth, addressDrawer(data)),
      )
    }),
    cr.fixed(6.5, (ctx, box) => {
      r.renderRow(ctx, box,
        r.fixed(labelWidth,
          (ctx, box) => {
            let w = c.currentFontSize(ctx) * 7;
            box = b.modify(box, b.setWidth(w, "center"));
            c.drawTextJustified(ctx, "電話番号", box, "center")
          }),
        r.gap(phoneDrawer(data)),
      );
    }),
    cr.fixed(6.5, (ctx, box) => {
      r.renderRow(ctx, box,
        r.fixed(labelWidth,
          (ctx, box) => {
            let w = c.currentFontSize(ctx) * 7;
            box = b.modify(box, b.setWidth(w, "center"));
            c.drawTextJustified(ctx, "保険医氏名", box, "center")
          }),
        r.gap(doctorNameDrawer(data)),
      );
    }),
    cr.fixed(2),
    cr.fixed(6, kikanDrawer(data))
  );
}

function drawAddressLabel(ctx: DrawerContext, box: Box) {
  let ele = stackedTexts(["保険医療機関の", "所在地及び名称"]);
  drawElement(ctx, box, ele);
}

function addressDrawer(
  data: ShohousenData2025
): (ctx: DrawerContext, box: Box) => void {
  return (ctx, box) => {
    let addr: string = data.clinicAddress ?? "東京都";
    let name: string = data.clinicName ?? "";
    c.withFontAndColor(ctx, "d2.5", black, () => {
      cr.renderCol(ctx, box,
        cr.gap((ctx, box) => c.drawText(ctx, addr, box, "left", "center")),
        cr.gap((ctx, box) => c.drawText(ctx, name, box, "left", "center")),
      );
    })
  }
}

function phoneDrawer(data: ShohousenData2025): (ctx: DrawerContext, box: Box) => void {
  return (ctx, box) => {
    let phone: string = data.clinicPhone ?? "";
    c.withFontAndColor(ctx, "d2.5", black, () => {
      c.drawText(ctx, phone, box, "left", "center");
    });
  }
}

function doctorNameDrawer(data: ShohousenData2025): (ctx: DrawerContext, box: Box) => void {
  let name = data.doctorName ?? "診療太郎";
  return (ctx, box) => {
    r.renderRow(ctx, box,
      r.gap((ctx, box) => {
        c.withFontAndColor(ctx, "d2.5", black, () => {
          c.drawText(ctx, name, box, "left", "center");
        });
      }),
      r.fixed(2),
      r.fixed(2.5, (ctx, box) => c.drawText(ctx, "㊞", box, "center", "center")),
      r.fixed(8),
    );
  }
}

function kikanDrawer(data: ShohousenData2025): (ctx: DrawerContext, box: Box) => void {
  return (ctx, box) => {
    c.frame(ctx, box);
    const [fukenLabel, fuken, tensuuLabel, tensuu, kikanLabel, kikancode] =
          b.splitToColumns(box, b.splitAt(23, 28, 38.5, 44, 51));
    [fukenLabel, fuken, tensuuLabel, tensuu, kikanLabel].forEach(
      box => c.frameRight(ctx, box)
    );
    c.drawText(ctx, "都道府県番号", fukenLabel, "center", "center");
  };
  
}




