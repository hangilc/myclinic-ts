import { hokenshaBangouRep } from "@/lib/hoken-rep";
import type { Box } from "../../compiler/box";
import * as b from "../../compiler/box";
import * as c from "../../compiler/compiler";
import type { DrawerContext } from "../../compiler/context";
import { breakLines } from "../../compiler/break-lines";

export interface ShohousenData {
  clinicAddress?: string;
  clinicName?: string;
  clinicPhone?: string;
  clinicKikancode?: string;
  doctorName?: string;
  hokenshaBangou?: string;
  hihokensha?: string;
  futansha?: string;
  jukyuusha?: string;
  futansha2?: string;
  jukyuusha2?: string;
  shimei?: string;
  birthdate?: string; // YYYY-MM-DD
  sex?: "M" | "F"; 
  hokenKubun?: "hihokensha" | "hifuyousha"; 
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
  drawHihokensha(ctx, c.getMark(ctx, "hihokenshaBox"), data.hihokensha ?? "");
  drawKouhiFutansha(ctx, c.getMark(ctx, "futanshaBangouBox"), data.futansha ?? "");
  drawKouhiJukyuusha(ctx, c.getMark(ctx, "jukyuushaBangouBox"), data.jukyuusha ?? "");
  drawKouhiFutansha(ctx, c.getMark(ctx, "futanshaBangou2Box"), data.futansha2 ?? "");
  drawKouhiJukyuusha(ctx, c.getMark(ctx, "jukyuushaBangou2Box"), data.jukyuusha2 ?? "");
  drawShimei(ctx, c.getMark(ctx, "patientNameBox"), data.shimei ?? "");
  drawBirthDate(ctx, 
    c.getMark(ctx, "birthdayYearBox"), 
    c.getMark(ctx, "birthdayMonthBox"), 
    c.getMark(ctx, "birthdayDayBox"), 
    data.birthdate ?? "");
  drawSex(ctx, c.getMark(ctx, "sexMaleBox"), c.getMark(ctx, "sexFemaleBox"), data.sex ?? "");
  drawHokenKubun(ctx, 
    c.getMark(ctx, "patientHihokenshaBox"),
    c.getMark(ctx, "patientHifuyoushaBox"),
    data.hokenKubun ?? "");
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

function normalizeHokenshaBangou(bangou: string): string {
  if (bangou.length <= 6) {
    return "0".repeat(6 - bangou.length) + bangou;
  } else if( bangou.length <= 8) {
    return "0".repeat(8 - bangou.length) + bangou;
  } else {
    throw new Error(`Invalid hokenshaBangou: ${bangou}.`);
  }
}

function drawHokenshaBangou(ctx: DrawerContext, box: Box, bangou: string) {
  bangou = bangou.trim();
  if (bangou) {
    bangou = normalizeHokenshaBangou(bangou);
    c.setFont(ctx, "gothic-4");
    c.drawTextInEvenColumns(ctx, bangou, box, 8, "right");
  }
}

function drawHihokensha(ctx: DrawerContext, box: Box, hihokensha: string) {
  box = b.modify(box, b.shrinkHoriz(5, 0));
  c.setFont(ctx, "gothic-4");
  c.drawText(ctx, hihokensha, box, "left", "center");
}

function drawKouhiFutansha(ctx: DrawerContext, box: Box, futansha: string) {
  if( futansha !== "" ){
    c.setFont(ctx, "gothic-4");
    c.drawTextInEvenColumns(ctx, futansha, box, 8, "right");
  }
}

function drawKouhiJukyuusha(ctx: DrawerContext, box: Box, jukyuusha: string) {
  if( jukyuusha !== "" ){
    c.setFont(ctx, "gothic-4");
    c.drawTextInEvenColumns(ctx, jukyuusha, box, 7, "right");
  }
}

function drawShimei(ctx: DrawerContext, box: Box, shimei: string) {
  box = b.modify(box, b.shrinkHoriz(2, 2));
  c.setFont(ctx, "mincho-4.5");
  let lines = breakLines(shimei, c.currentFontSize(ctx), b.width(box));
  if( lines.length === 0 ){
    return;
  } else if( lines.length === 1 ){
    c.drawText(ctx, shimei, box, "left", "center");
  } else if ( lines.length === 2 ){
    c.drawLines(ctx, lines, box);
  } else {
    c.setFont(ctx, "mincho-2.5");
    lines = breakLines(shimei, c.currentFontSize(ctx), b.width(box));
    c.drawLines(ctx, lines, box);
  }
}

function drawBirthDate(ctx: DrawerContext, yearBox: Box, monthBox: Box, dayBox: Box, birthdate: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(birthdate);
  if( m ){
    const year = m[1];
    const month = m[2].replace(/^0/, "");
    const day = m[3].replace(/^0/, "");
    c.setFont(ctx, "gothic-2.5");
    c.drawText(ctx, year, yearBox, "right", "center");
    c.drawText(ctx, month, monthBox, "right", "center");
    c.drawText(ctx, day, dayBox, "right", "center");
  }
}

function drawSex(ctx: DrawerContext, maleBox: Box, femaleBox: Box, sex: "M" | "F" | "") {
  if( sex === "M" ){
    c.setFont(ctx, "gothic-3");
    c.drawText(ctx, "○", maleBox, "center", "center");
  } else if( sex === "F" ){
    c.setFont(ctx, "gothic-3");
    c.drawText(ctx, "○", femaleBox, "center", "center");
  }
}

function drawHokenKubun(ctx: DrawerContext, hihokenshaBox: Box, hifuyoushaBox: Box, 
  hokenKubun?: "hihokensha" | "hifuyousha" | "") {
    if( hokenKubun === "hihokensha" ){
      c.setFont(ctx, "gothic-3");
      c.drawText(ctx, "○", hihokenshaBox, "center", "center");
    } else if( hokenKubun === "hifuyousha" ){
      c.setFont(ctx, "gothic-3");
      c.drawText(ctx, "○", hifuyoushaBox, "center", "center");
    }
  }
