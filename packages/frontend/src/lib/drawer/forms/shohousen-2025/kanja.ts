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
  let labelWidth = 26;
  c.frame(ctx, frame);
  cr.renderCol(ctx, frame,
    cr.fixed(10, (ctx, box) => {
      r.renderRow(ctx, box,
        r.fixed(labelWidth, drawAddressLabel),
        r.fixed(labelWidth, (ctx, box) => drawAddress(ctx, box, data)),
      )
    }),
    cr.fixed(13, (ctx, box) => {
      r.renderRow(ctx, box,
        r.fixed(labelWidth,
          (ctx, box) => c.drawText(ctx, "電話番号", box, "center", "center"))
      );
    }),
    cr.fixed(2),
    cr.fixed(6, (ctx, box) => {
      r.renderRow(ctx, box,
        r.fixed(labelWidth,
          (ctx, box) => c.drawText(ctx, "保険医氏名", box, "center", "center"))
      );
    }),
  );
}

function drawAddressLabel(ctx: DrawerContext, box: Box) {
  let ele = stackedTexts(["保険医療機関の", "所在地及び名称"]);
  drawElement(ctx, box, ele);
}

function drawAddress(ctx: DrawerContext, box: Box, data: ShohousenData2025) {
  let addr: string = data.clinicAddress ?? "";
  let name: string = data.clinicName ?? "";
  c.withFontAndColor(ctx, "d2.5", black, () => {
    cr.renderCol(ctx, box,
      cr.gap((ctx, box) => c.drawText(ctx, addr, box, "left", "center")),
      cr.gap((ctx, box) => c.drawText(ctx, name, box, "left", "center")),
    );
  })
}




