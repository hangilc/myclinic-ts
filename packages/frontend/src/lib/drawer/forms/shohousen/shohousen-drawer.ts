import type { Op } from "../../compiler/op";
import { mkDrawerContext, type DrawerContext } from "../../compiler/context";
import * as b from "../../compiler/box";
import type { Box } from "../../compiler/box";
import * as c from "../../compiler/compiler";
import { drawTopBox } from "./top-box";
import { mkLayout, mkMainLayout } from "./layout";
import { drawPatientClinic } from "./patient-clinic";
import { drawIssue } from "./issue";
import { drawDrugs } from "./drugs";
import { drawMemo } from "./memo";
import { drawChouzai1 } from "./chouzai1";
import { drawChouzai2 } from "./chouzai2";
import { drawPharmacy } from "./pharmacy";
import { drawData, type ShohousenData } from "./data";

export function drawShohousen(data: ShohousenData): Op[] {
  const layout = mkLayout();
  const mainLayout = mkMainLayout(layout.main);
  const ctx = mkDrawerContext();
  initFont(ctx);
  c.setTextColor(ctx, 0, 255, 0);
  c.createPen(ctx, "default-pen", 0, 255, 0, 0.16);
  c.createPen(ctx, "layout", 0, 0, 0, 0.20);
  c.setPen(ctx, "default-pen");
  drawTitle(ctx, layout.title);
  drawTopBox(ctx, layout.kouhiHoken);
  drawPatientClinic(ctx, mainLayout.patientClinic);
  drawIssue(ctx, mainLayout.issue);
  drawDrugs(ctx, mainLayout.drugs);
  drawMemo(ctx, mainLayout.memo);
  drawChouzai1(ctx, mainLayout.chouzai1);
  drawChouzai2(ctx, mainLayout.chouzai2);
  drawPharmacy(ctx, layout.pharma);
  drawData(ctx, data);
  return c.getOps(ctx, { scale: 0.962, offsetX: 0.25, offsetY: 0 });
}

function initFont(ctx: DrawerContext) {
  c.createFont(ctx, "mincho-5", "MS Mincho", 5);
  c.createFont(ctx, "mincho-4.5", "MS Mincho", 4.5);
  c.createFont(ctx, "mincho-4", "MS Mincho", 4);
  c.createFont(ctx, "mincho-3.5", "MS Mincho", 3.5);
  c.createFont(ctx, "mincho-3", "MS Mincho", 3);
  c.createFont(ctx, "mincho-2.5", "MS Mincho", 2.5);
  c.createFont(ctx, "mincho-2", "MS Mincho", 2);
  c.createFont(ctx, "mincho-1.8", "MS Mincho", 1.8);
  c.createFont(ctx, "mincho-1.5", "MS Mincho", 1.5);
  c.createFont(ctx, "mincho-1.4", "MS Mincho", 1.4);
  c.createFont(ctx, "gothic-4.5", "MS Gothic", 4.5);
  c.createFont(ctx, "gothic-4", "MS Gothic", 4);
  c.createFont(ctx, "gothic-4", "MS Gothic", 4);
  c.createFont(ctx, "gothic-3.5", "MS Gothic", 3.5);
  c.createFont(ctx, "gothic-3", "MS Gothic", 3);
  c.createFont(ctx, "gothic-2.5", "MS Gothic", 2.5);

}

function drawTitle(ctx: DrawerContext, box: Box) {
  box = b.modify(box, b.shiftDown(1), b.setLeft(51), b.setRight(93));
  c.setFont(ctx, "mincho-5");
  c.drawTextJustified(ctx, "処方せん", box, "top");
  box = b.modify(box, b.shiftDown(6));
  c.setFont(ctx, "mincho-2.5");
  c.drawText(ctx, "(この処方せんは、どの保険薬局でも有効です。)", box, "center", "top");
}