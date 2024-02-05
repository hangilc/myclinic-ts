import type { Box } from "../../compiler/box";
import * as b from "../../compiler/box";
import * as c from "../../compiler/compiler";
import type { DrawerContext } from "../../compiler/context";

export interface ShohousenData {
  clinicAddress?: string;
  clinicName?: string;
  clinicPhone?: string;
  clinicKikancode?: string;
  doctorName?: string;
  hokenshaBangou?: string;
}

export function drawData(ctx: DrawerContext, data: ShohousenData) {
  c.setTextColor(ctx, 0, 255, 0);
  drawClinicInfo(ctx, c.getMark(ctx, "clinicInfoBox"),
    data.clinicAddress ?? "", data.clinicName ?? "",
    data.clinicPhone ?? "", data.clinicKikancode ?? "");
  drawClinicPhone(ctx, c.getMark(ctx, "clinicPhoneBox"), data.clinicPhone ?? "");
  drawDoctorName(ctx, c.getMark(ctx, "clinicDoctorBox"), data.doctorName ?? "");
  c.setTextColor(ctx, 0, 0, 0);
  drawHokenshaBangou(ctx, c.getMark(ctx, "hokenshaBangouBox"), data.hokenshaBangou ?? "");
}

function drawClinicInfo(ctx: DrawerContext, box: Box, address: string, name: string,
  phone: string, kikancode: string) {
  c.setFont(ctx, "mincho-3");
  let r = b.modify(box, b.shift(2, 1));
  c.drawText(ctx, address, r, "left", "top");
  r = b.modify(r, b.shift(4, 4));
  c.setFont(ctx, "mincho-4");
  c.drawText(ctx, name, r, "left", "top");
  r = b.modify(r, b.shrinkHoriz(34, 0), b.shrinkVert(0.5, 0));
  if (kikancode) {
    c.setFont(ctx, "mincho-3");
    c.drawText(ctx, `(機関コード ${kikancode})`, r, "left", "top");
  }
}

function drawClinicPhone(ctx: DrawerContext, box: Box, phone: string) {
  c.setFont(ctx, "mincho-3");
  c.drawText(ctx, phone, b.modify(box, b.shift(6, 0)), "left", "top");
}

function drawDoctorName(ctx: DrawerContext, box: Box, name: string) {
  c.setFont(ctx, "mincho-3.5");
  c.drawText(ctx, name, box, "right", "top");
}

function drawHokenshaBangou(ctx: DrawerContext, box: Box, bangou: string) {
  c.setFont(ctx, "gothic-4");
  c.drawTextInEvenColumns(ctx, bangou, box, 8, "right");

}