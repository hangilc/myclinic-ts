import type { Box } from "../../compiler/box";
import * as b from "../../compiler/box";
import * as c from "../../compiler/compiler";
import type { DrawerContext } from "../../compiler/context";

export interface ShohousenData {
  clinicAddress: string;
}

export function drawData(ctx: DrawerContext, data: ShohousenData) {
  c.setTextColor(ctx, 0, 255, 0);
  c.setFont(ctx, "mincho-3");
  drawClinicInfo(ctx, c.getMark(ctx, "clinicInfoBox"), data.clinicAddress);
}

function drawClinicInfo(ctx: DrawerContext, box: Box, address: string) {

}