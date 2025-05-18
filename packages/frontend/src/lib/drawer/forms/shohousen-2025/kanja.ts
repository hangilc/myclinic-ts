import type { Box } from "@/lib/drawer/compiler/box";
import * as b from "@/lib/drawer/compiler/box";
import * as c from "@/lib/drawer/compiler/compiler";
import * as x from "./xsplit";
import { type DrawerContext } from "@/lib/drawer/compiler/context";
import type { ShohousenData2025 } from "./data2025";
import { drawShimei } from "./kanja/shimei";
import { drawBirthdayAndSex } from "./kanja/birthday-and-sex";
import { drawKubun } from "./kanja/kubun";

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
  c.frame(ctx, frame);
}


