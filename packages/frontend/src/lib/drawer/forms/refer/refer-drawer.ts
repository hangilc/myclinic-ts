import { mkDrawerContext, type DrawerContext } from "../../compiler/context";
import type { Op } from "../../compiler/op";
import type { ReferDrawerData } from "./refer-drawer-data";
import * as c from "../../compiler/compiler";
import * as b from "../../compiler/box";
import { A4 } from "../../compiler/paper-size";
import type { Box } from "../../compiler/box";

export function drawRefer(data: ReferDrawerData): Op[] {
  const ctx = mkDrawerContext();
  setupFonts(ctx);
  setupPens(ctx);
  const paper: Box = b.paperSizeToBox(A4);
  drawTitle(ctx, b.cx(paper), 41);
  drawReferHospital(ctx, 30, 58);
  drawReferDoctor(ctx, 30, 64);
  drawPatientName(ctx, 30, 80);
  drawPatientInfo(ctx, 50, 86);
  drawDiagnosis(ctx, 30, 96);
  drawIssueDate(ctx, 30, 220);
  drawAddress(ctx, 118, 220);

  c.rect(ctx, paper);
  c.fillData(ctx, data);
  return c.getOps(ctx);
}

function setupFonts(ctx: DrawerContext) {
  c.createFont(ctx, "serif-6", "MS Mincho", 6);
  c.createFont(ctx, "serif-5", "MS Mincho", 5);
  c.createFont(ctx, "serif-5-bold", "MS Mincho", 5, "bold", false);
  c.createFont(ctx, "serif-4", "MS Mincho", 4);
}

function setupPens(ctx: DrawerContext) {
  c.createPen(ctx, "default", 0, 0, 0, 0.08);
  c.setPen(ctx, "default");
}

function drawTitle(ctx: DrawerContext, x: number, y: number) {
  const box = b.mkBox(x - 10, y - 5, x + 10, y + 5);
  c.mark(ctx, "title", box, {
    font: "serif-5-bold",
    halign: "center",
    valign: "center",
  })
}

function drawReferHospital(ctx: DrawerContext, x: number, y: number) {
  const box = b.mkBox(x, y - 5, x + 10, y + 5);
  c.mark(ctx, "refer-hospital", box, {
    font: "serif-4", halign: "left", valign: "bottom",
  })
}
function drawReferDoctor(ctx: DrawerContext, x: number, y: number) {
  const box = b.mkBox(x, y - 5, x + 10, y + 5);
  c.mark(ctx, "refer-doctor", box, {
    font: "serif-4", halign: "left", valign: "bottom",
  })
}

function drawPatientName(ctx: DrawerContext, x: number, y: number) {
  const box = b.mkBox(x, y - 5, x + 10, y + 5);
  c.mark(ctx, "patient-name", box, {
    font: "serif-5", halign: "left", valign: "bottom",
  })
}

function drawPatientInfo(ctx: DrawerContext, x: number, y: number) {
  const box = b.mkBox(x, y - 5, x + 10, y + 5);
  c.mark(ctx, "patient-info", box, {
    font: "serif-4", halign: "left", valign: "bottom",
  })
}

function drawDiagnosis(ctx: DrawerContext, x: number, y: number) {
  const box = b.mkBox(x, y - 5, x + 10, y + 5);
  c.mark(ctx, "diagnosis", box, {
    font: "serif-5", halign: "left", valign: "bottom",
  })
}

function drawIssueDate(ctx: DrawerContext, x: number, y: number) {
  const box = b.mkBox(x, y - 4, x + 10, y + 5);
  c.mark(ctx, "issue-date", box, {
    font: "serif-4", halign: "left", valign: "top",
  });
}

function drawAddress(ctx: DrawerContext, x: number, y: number) {
  const box = b.mkBox(x, y - 4, x + 65, y +20);
  c.mark(ctx, "address", box, {
    font: "serif-4", halign: "left", valign: "top", paragraph: true,
    leading: 2,
  });
}
