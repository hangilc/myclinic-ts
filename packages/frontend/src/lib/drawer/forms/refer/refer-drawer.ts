import { mkDrawerContext, type DrawerContext } from "../../compiler/context";
import type { Op } from "../../compiler/op";
import type { ReferDrawerData } from "./refer-drawer-data";
import * as c from "../../compiler/compiler";
import * as b from "../../compiler/box";
import * as p from "../../compiler/composite-item";
import { A4 } from "../../compiler/paper-size";
import type { Box } from "../../compiler/box";
import { breakParagraph } from "../../compiler/break-lines";
import { requiredHeight } from "../../compiler/util";

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
  if (drawContent(ctx, b.mkBox(30, 108, 170, 210), data.content)) {
    drawFooter(ctx, 30, paper.right - 30, 216);
  } else {
    throw new Error("Too long content");
  }
  c.fillData(ctx, data);
  return c.getOps(ctx);
}

function setupFonts(ctx: DrawerContext) {
  c.createFont(ctx, "serif-6", "MS Mincho", 6);
  c.createFont(ctx, "serif-5", "MS Mincho", 5);
  c.createFont(ctx, "serif-5-bold", "MS Mincho", 5, "bold", false);
  c.createFont(ctx, "serif-4", "MS Mincho", 4);
  c.createFont(ctx, "serif-3", "MS Mincho", 3);
}

function setupPens(ctx: DrawerContext) {
  c.createPen(ctx, "default", 0, 0, 0, 0.1);
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

function drawFooter(ctx: DrawerContext, left: number, right: number, top: number) {
  const box = b.mkBox(left, top, right, top + 50);
  const issueDateBox = b.modify(box, b.setHeight(5, "top"), b.setWidth(30, "left"));
  const addressBox = b.modify(box, b.setWidth(62, "right"));
  drawIssueDate(ctx, issueDateBox);
  drawIssuer(ctx, addressBox);
}

function drawIssueDate(ctx: DrawerContext, box: Box) {
  c.mark(ctx, "issue-date", box, {
    font: "serif-4", halign: "left", valign: "top",
  });
}

function drawIssuer(ctx: DrawerContext, box: Box) {
  c.mark(ctx, "address", box, {
    font: "serif-4", halign: "left", valign: "top", paragraph: true,
    leading: 2,
  });
  const lower = b.modify(box, b.shrinkVert(28, 0));
  c.mark(ctx, "clinic-name", lower, {
    font: "serif-4", halign: "left", valign: "top",
  })
  const doctorLine = b.modify(lower, b.shrinkVert(8, 0), b.setHeight(6, "top"));
  c.withFont(ctx, "serif-4", () => {
    c.drawComposite(ctx, doctorLine, [
      p.text("院長"),
      p.gap(4),
      p.gap(30, { mark: "issuer-doctor-name", ropt: { font: "serif-6", valign: "center" } }),
      p.gap(12),
      p.text("㊞", { mark: "stamp" }),
    ], { valign: "center" })
  })
}

function drawContent(ctx: DrawerContext, box: Box, content: string): boolean {
  const fontSave = c.getCurrentFont(ctx);
  try {
    c.setFont(ctx, "serif-4");
    let fontSize = c.currentFontSize(ctx);
    let leading = 1;
    let lines = breakParagraph(content, fontSize, b.width(box));
    let reqHeight = requiredHeight(lines.length, fontSize, leading);
    if( reqHeight <= b.height(box) ){
      c.drawTexts(ctx, lines, box, { leading });
      return true;
    } else {
      return false;
    }
  } finally {
    c.setFont(ctx, fontSave);
  }
  return true;
}
