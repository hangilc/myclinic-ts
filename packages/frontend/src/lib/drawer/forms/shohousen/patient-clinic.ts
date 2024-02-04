import type { Box } from "../../compiler/box";
import * as b from "../../compiler/box";
import * as c from "../../compiler/compiler";
import type { DrawerContext } from "../../compiler/context";

export function drawPatientClinic(ctx: DrawerContext, box: Box) {
  const layout = b.withSplitColumns(box, b.splitAt(4, 55), ([leftColumn, patient, clinic]) => {
    return { leftColumn, patient, clinic };
  })
  c.rect(ctx, box);
  c.frameRight(ctx, layout.leftColumn);
  c.setFont(ctx, "mincho-2.5");
  c.drawTextJustifiedVertically(ctx, "患者", b.modify(layout.leftColumn, b.inset(0, 4)), "center");
  drawPatient(ctx, layout.patient);
  drawClinic(ctx, layout.clinic);
}

function drawPatient(ctx: DrawerContext, box: Box) {
  const layout = b.withSplitRows(box, b.splitAt(9.5, 13.8), ([upper, middle, lower]) => {
    return { upper, middle, lower }
  });
  c.frameRight(ctx, box);
  c.rect(ctx, layout.upper);
  ((box: Box) => {
    const layout = b.withSplitColumns(box, b.splitAt(10.5), ([label, body]) => ({ label, body }));
    c.frameRight(ctx, layout.label);
    c.setFont(ctx, "mincho-2.5");
    c.drawTextJustified(ctx, "氏名", b.modify(layout.label, b.inset(2, 0)), "center");
    c.mark(ctx, "patientNameBox", layout.body)
  })(layout.upper);
  ((box: Box) => {
    const layout = b.withSplitColumns(box, b.splitAt(10.5, 39), ([label, birthdate, sex]) => {
      return { label, birthdate, sex };
    });
    c.frameRight(ctx, layout.label);
    c.frameRight(ctx, layout.birthdate);
    c.setFont(ctx, "mincho-2");
    c.drawTextJustified(ctx, "生年月日", b.modify(layout.label, b.inset(0.5, 0)), "center");
    drawBirthdate(ctx, layout.birthdate);
    drawSex(ctx, layout.sex);
  })(layout.middle);
  ((box: Box) => {
    const layout = b.withSplitColumns(box, b.splitAt(10.5, 24, 37.3), ([label, hihokensha, hifuyousha]) => {
      return { label, hihokensha, hifuyousha };
    });
    c.frameRight(ctx, layout.label);
    c.frameRight(ctx, layout.hihokensha);
    c.frameRight(ctx, layout.hifuyousha);
    c.setFont(ctx, "mincho-2.5");
    c.drawText(ctx, "区分", layout.label, "center", "center");
    c.drawText(ctx, "被保険者", layout.hihokensha, "center", "center");
    c.drawText(ctx, "被扶養者", layout.hifuyousha, "center", "center");
    c.mark(ctx, "patientHihokenshaBox", layout.hihokensha);
    c.mark(ctx, "patientHifuyoushaBox", layout.hifuyousha);
  })(layout.lower);
  c.rect(ctx, layout.middle);
  c.rect(ctx, layout.lower);
}

function drawBirthdate(ctx: DrawerContext, box: Box) {
  const [year, month, day] = c.drawComposite(ctx, box, [
    { kind: "mark-to", at: 9 },
    { kind: "gap", width: 1},
    { kind: "text", text: "年"},
    { kind: "mark-to", at: 17 },
    { kind: "gap", width: 1},
    { kind: "text", text: "月"},
    { kind: "mark-to", at: 25 },
    { kind: "gap", width: 1},
    { kind: "text", text: "日"},
  ]);
  c.mark(ctx, "birthdayYearBox", year);
  c.mark(ctx, "birthdayMonthBox", month);
  c.mark(ctx, "birthdayDayBox", day);
}

function drawSex(ctx: DrawerContext, box: Box) {
  const [male, dot, female] = b.splitToColumns(box, b.evenSplitter(3));
  c.drawText(ctx, "男", male, "center", "center");
  c.drawText(ctx, "・", dot, "center", "center");
  c.drawText(ctx, "女", female, "center", "center");
  c.mark(ctx, "patientMaleBox", male);
  c.mark(ctx, "patientFemaleBox", female);
}

function drawClinic(ctx: DrawerContext, box: Box) {
  const layout = b.withSplitRows(b.modify(box, b.shrinkHoriz(1, 0)), b.splitAt(9.5, 13.8), ([a, b, c]) => {
    return { upper: a, middle: b, lower: c };
  });
  ((box: Box) => {
    const [label, info] = b.splitToColumns(box, b.splitAt(11));
    b.withSplitRows(label, b.evenSplitter(3), ([r1, r2, r3]) => {
      c.setFont(ctx, "mincho-1.5");
      c.drawTextJustified(ctx, "保険医療機関", r1, "center");
      c.drawTextJustified(ctx, "の所在地", r2, "center");
      c.drawTextJustified(ctx, "及び名称", r3, "center");
    });
    c.mark(ctx, "clinicInfoBox", info);
  })(layout.upper);
  ((box: Box) => {
    const [label, info] = b.splitToColumns(box, b.splitAt(11));
    c.drawTextJustified(ctx, "電話番号", label, "center");
    c.mark(ctx, "clinicPhoneBox", info);
  })(layout.middle);
  ((box: Box) => {
    const [label, info, hanko] = b.splitToColumns(box, b.splitAt(11, 60.5));
    c.drawTextJustified(ctx, "保険医氏名", label, "center");
    c.mark(ctx, "clinicDoctorBox", info);
    c.drawText(ctx, "印", b.modify(hanko, b.shift(1.5, 0)), "left", "center");
  })(layout.lower);
}