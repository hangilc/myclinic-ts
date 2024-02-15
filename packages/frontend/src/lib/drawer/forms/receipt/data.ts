import type { DrawerContext } from "../../compiler/context";
import type { ReceiptDrawerData } from "./receipt-drawer-data";
import * as c from "../../compiler/compiler";
import * as b from "../../compiler/box";
import type { Box } from "../../compiler/box";
import { stringDrawWidth } from "../../compiler/char-width";

export function drawData(ctx: DrawerContext, data: ReceiptDrawerData) {
  renderPatient(ctx, data.patientName ?? "", c.getMark(ctx, "nameBox"));
  renderInstitute(ctx, data.clinicName ?? "", data.addressLines ?? [], c.getMark(ctx, "instituteBox"));
}

function renderPatient(ctx: DrawerContext, name: string, box: Box) {
  c.setFont(ctx, "mincho-6");
  let fontSize = c.currentFontSize(ctx);
  if( stringDrawWidth(name, fontSize) <= b.width(box) ) {
    c.drawText(ctx, name, box, "center", "bottom");
  }
}

function renderInstitute(ctx: DrawerContext, name: string, addressLines: string[], box: Box) {
  const rows = b.splitToRows(box, b.splitAt(5));
  c.setFont(ctx, "gothic-4");
  c.drawText(ctx, name, rows[0], "left", "top");
  c.setFont(ctx, "gothic-2.6");
  c.drawLines(ctx, addressLines, rows[1], { leading: 1 });
}