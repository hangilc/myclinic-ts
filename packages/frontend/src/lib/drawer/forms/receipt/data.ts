import type { DrawerContext } from "../../compiler/context";
import type { ReceiptDrawerData } from "./receipt-drawer-data";
import * as c from "../../compiler/compiler";
import * as b from "../../compiler/box";
import type { Box } from "../../compiler/box";

export function drawData(ctx: DrawerContext, data: ReceiptDrawerData) {
  renderInstitute(ctx, data.clinicName ?? "", data.addressLines ?? [], c.getMark(ctx, "instituteBox"));
}

function renderInstitute(ctx: DrawerContext, name: string, addressLines: string[], box: Box) {
  const rows = b.splitToRows(box, b.splitAt(5));
  c.setFont(ctx, "gothic-4");
  c.drawText(ctx, name, rows[0], "left", "top");
  c.setFont(ctx, "gothic-2.6");
  c.drawLines(ctx, addressLines, rows[1], { leading: 1 });
}