import type { Box } from "../../compiler/box";
import * as b from "../../compiler/box";
import * as c from "../../compiler/compiler";
import type { DrawerContext } from "../../compiler/context";
import { breakLines } from "../../compiler/break-lines";
import { parseShohousen, type Drug } from "./parser/parse-shohousen";
import { RenderDrugContext, renderDrug } from "./parser/render";
import { toZenkaku } from "@/lib/zenkaku";
import { requiredHeight } from "../../compiler/util";

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
  koufuDate?: string; // YYYY-MM-DD
  validUptoDate?: string; // YYYY-MM-DD
  drugs?: string;
  isDenshi?: boolean;
  accessCode?: string;
}

export function drawData(ctx: DrawerContext, data: ShohousenData) {
  let drugs: Drug[] = [];
  let memoLines: string[] = [];
  if (data.drugs) {
    const parsedContent = parseShohousen(data.drugs);
    parsedContent.commands.forEach(cmd => {
      switch (cmd.kind) {
        case "memo": {
          memoLines.push(cmd.content);
          break;
        }
        case "online-taiou": {
          memoLines.push("オンライン対応");
          break;
        }
        case "valid-upto": {
          data.validUptoDate = cmd.date;
          break;
        }
      }
    });
    drugs = parsedContent.drugs;
  }
  c.setTextColor(ctx, 0, 255, 0);
  drawClinicInfo(ctx, c.getMark(ctx, "clinicInfoBox").box,
    data.clinicAddress ?? "", data.clinicName ?? "",
    data.clinicPhone ?? "", data.clinicKikancode ?? "");
  drawClinicPhone(ctx, c.getMark(ctx, "clinicPhoneBox").box, data.clinicPhone ?? "");
  drawDoctorName(ctx, c.getMark(ctx, "clinicDoctorBox").box, data.doctorName ?? "");
  c.setTextColor(ctx, 0, 0, 0);
  drawHokenshaBangou(ctx, c.getMark(ctx, "hokenshaBangouBox").box, data.hokenshaBangou ?? "");
  drawHihokensha(ctx, c.getMark(ctx, "hihokenshaBox").box, data.hihokensha ?? "");
  drawKouhiFutansha(ctx, c.getMark(ctx, "futanshaBangouBox").box, data.futansha ?? "");
  drawKouhiJukyuusha(ctx, c.getMark(ctx, "jukyuushaBangouBox").box, data.jukyuusha ?? "");
  drawKouhiFutansha(ctx, c.getMark(ctx, "futanshaBangou2Box").box, data.futansha2 ?? "");
  drawKouhiJukyuusha(ctx, c.getMark(ctx, "jukyuushaBangou2Box").box, data.jukyuusha2 ?? "");
  drawShimei(ctx, c.getMark(ctx, "patientNameBox").box, data.shimei ?? "");
  drawDate(ctx,
    c.getMark(ctx, "birthdayYearBox").box,
    c.getMark(ctx, "birthdayMonthBox").box,
    c.getMark(ctx, "birthdayDayBox").box,
    data.birthdate ?? "");
  drawSex(ctx, c.getMark(ctx, "sexMaleBox").box, c.getMark(ctx, "sexFemaleBox").box, data.sex ?? "");
  drawHokenKubun(ctx,
    c.getMark(ctx, "patientHihokenshaBox").box,
    c.getMark(ctx, "patientHifuyoushaBox").box,
    data.hokenKubun ?? "");
  drawDate(ctx,
    c.getMark(ctx, "issueYearBox").box,
    c.getMark(ctx, "issueMonthBox").box,
    c.getMark(ctx, "issueDayBox").box,
    data.koufuDate ?? "");
  drawValidUpto(ctx, data.validUptoDate);
  drawDrugs(ctx, c.getMark(ctx, "drugsPaneBox").box, c.getMark(ctx, "memoPaneBox").box, drugs, memoLines);
}

function drawValidUpto(ctx: DrawerContext, date: string | undefined) {
  drawDate(ctx,
    c.getMark(ctx, "validYearBox").box,
    c.getMark(ctx, "validMonthBox").box,
    c.getMark(ctx, "validDayBox").box,
    date ?? ""
  );
}

function drawClinicInfo(ctx: DrawerContext, box: Box, address: string, name: string,
  _phone: string, kikancode: string) {
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
  } else if (bangou.length <= 8) {
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
  if (futansha !== "") {
    c.setFont(ctx, "gothic-4");
    c.drawTextInEvenColumns(ctx, futansha, box, 8, "right");
  }
}

function drawKouhiJukyuusha(ctx: DrawerContext, box: Box, jukyuusha: string) {
  if (jukyuusha !== "") {
    c.setFont(ctx, "gothic-4");
    c.drawTextInEvenColumns(ctx, jukyuusha, box, 7, "right");
  }
}

function drawShimei(ctx: DrawerContext, box: Box, shimei: string) {
  box = b.modify(box, b.shrinkHoriz(2, 2));
  c.setFont(ctx, "mincho-4.5");
  let lines = breakLines(shimei, c.currentFontSize(ctx), b.width(box));
  if (lines.length === 0) {
    return;
  } else if (lines.length === 1) {
    c.drawText(ctx, shimei, box, "left", "center");
  } else if (lines.length === 2) {
    c.drawTexts(ctx, lines, box);
  } else {
    c.setFont(ctx, "mincho-2.5");
    lines = breakLines(shimei, c.currentFontSize(ctx), b.width(box));
    c.drawTexts(ctx, lines, box);
  }
}

function drawDate(ctx: DrawerContext, yearBox: Box, monthBox: Box, dayBox: Box, birthdate: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(birthdate);
  if (m) {
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
  if (sex === "M") {
    c.setFont(ctx, "gothic-3");
    c.drawText(ctx, "○", maleBox, "center", "center");
  } else if (sex === "F") {
    c.setFont(ctx, "gothic-3");
    c.drawText(ctx, "○", femaleBox, "center", "center");
  }
}

function drawHokenKubun(ctx: DrawerContext, hihokenshaBox: Box, hifuyoushaBox: Box,
  hokenKubun?: "hihokensha" | "hifuyousha" | "") {
  if (hokenKubun === "hihokensha") {
    c.setFont(ctx, "gothic-3");
    c.drawText(ctx, "○", hihokenshaBox, "center", "center");
  } else if (hokenKubun === "hifuyousha") {
    c.setFont(ctx, "gothic-3");
    c.drawText(ctx, "○", hifuyoushaBox, "center", "center");
  }
}

function prepareDrugMemoLines(ctx: DrawerContext, font: string, renderDrugContext: RenderDrugContext, memoBox: Box,
  drugs: Drug[], memo: string[]): {
    drugLines: string[]; memoLines: string[], fontSize: number
  } {
  c.setFont(ctx, font);
  let fontSize = c.currentFontSize(ctx);
  const drugLines: string[] = [];
  const memoLines: string[] = [];
  let pad = "";
  let blankPad = " ".repeat(2);
  if (drugs.length >= 10) {
    pad = " ";
    blankPad = " " + blankPad;
  }
  blankPad = toZenkaku(blankPad);
  drugs.forEach((drug, i) => {
    let index = (i + 1).toString();
    if ((i + 1) < 10) {
      index = pad + index;
    }
    index = toZenkaku(`${index})`);
    renderDrug(drug, renderDrugContext).forEach((dl, j) => {
      if (j === 0) {
        drugLines.push(index + dl);
      } else {
        drugLines.push(blankPad + dl);
      }
    })
  });
  memo.forEach(m => {
    const lines = breakLines(m, fontSize, b.width(memoBox));
    memoLines.push(...lines);
  });
  if (drugLines.length > 0) {
    drugLines.push("------以下余白------");
  }
  drugLines.unshift("Ｒｐ）");
  return { drugLines, memoLines, fontSize };
}

function tryDrawDrugs(ctx: DrawerContext, font: string, renderDrugContext: RenderDrugContext,
  box: Box, memoBox: Box, drugs: Drug[], memo: string[]): boolean {
  const { drugLines, memoLines, fontSize } = prepareDrugMemoLines(ctx, font, renderDrugContext, memoBox, drugs, memo);
  if (requiredHeight(drugLines.length, fontSize) <= b.height(box) &&
    requiredHeight(memoLines.length, fontSize) <= b.height(memoBox)) {
    c.drawTexts(ctx, drugLines, box);
    c.drawTexts(ctx, memoLines, memoBox);
    return true;
  } else {
    return false;
  }
}

function drawDrugs(ctx: DrawerContext, box: Box, memoBox: Box, drugs: Drug[], memo: string[]) {
  box = b.modify(box, b.inset(1));
  memoBox = b.modify(memoBox, b.inset(1));
  const fontSave = c.getCurrentFont(ctx);
  try {
    if (tryDrawDrugs(ctx, "gothic-4.5", new RenderDrugContext({}), box, memoBox, drugs, memo)) {
      // nop
    } else if (tryDrawDrugs(ctx, "gothic-3.5", new RenderDrugContext({ maxLine: 36 }), box, memoBox, drugs, memo)) {
      // nop
    } else {
      const { drugLines, memoLines } = prepareDrugMemoLines(ctx, "gothic-3.5",
        new RenderDrugContext({ maxLine: 36 }), memoBox, drugs, memo);
      c.drawTexts(ctx, [...drugLines, ...memoLines], box);
    }
  } finally {
    if (fontSave) {
      c.setFont(ctx, fontSave);
    }
  }

}
