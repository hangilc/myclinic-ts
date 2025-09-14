import { mkDrawerContext, type DrawerContext as DC } from "../../compiler/context";
import type { Op } from "../../compiler/op";
import * as c from "@/lib/drawer/compiler/compiler";
import * as b from "@/lib/drawer/compiler/box";
import { type Box } from "@/lib/drawer/compiler/box";
import type { ShujiiDrawerData } from "./shujii-drawer-data";

export function drawShujii(data: ShujiiDrawerData): Op[] {
  let ctx = mkDrawerContext();
  setupFonts(ctx);
  leftBox(ctx, b.mkBox(45, 80, 110, 95));
  rightBox(ctx, b.mkBox(133, 85, 176, 95));
  detail(ctx, b.mkBox(22, 164, 195, 185));
  c.fillData(ctx, data);
return c.getOps(ctx);
}

function setupFonts(ctx: DC) {
  c.createFont(ctx, "small", "MS Gothic", 3);
  c.createFont(ctx, "regular", "MS Gothic", 3.8);
  c.setFont(ctx, "small");
}

function leftBox(ctx: DC, box: Box){
  const rows: Box[] = b.splitToRows(box, b.evenSplitter(3));
  c.mark(ctx, "doctorName", rows[0], { font: "small" });
  c.mark(ctx, "clinicName", rows[1], { font: "small" });
  c.mark(ctx, "clinicAddress", rows[2], { font: "small" });
}

function rightBox(ctx: DC, box: Box) {
  const rows: Box[] = b.splitToRows(box, b.evenSplitter(2));
  c.mark(ctx, "phone", rows[0], { font: "small" });
  c.mark(ctx, "fax", rows[1], { font: "small" });
}

function detail(ctx: DC, box: Box) {
  c.mark(ctx, "detail", b.modify(box, b.inset(2, 1, 2, 0)), { font: "regular", paragraph: true });
}
