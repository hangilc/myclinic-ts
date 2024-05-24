import type { Op } from "../../compiler/op";
import * as c from "../../compiler/compiler";
import * as b from "../../compiler/box";
import { mkDrawerContext } from "../../compiler/context";
import { type DrawerContext as DC } from "../../compiler/context";
import { type Box } from "../../compiler/box";
import { A4 } from "../../compiler/paper-size";

export interface RyouyouKeikakushoData {

}

export function drawRyouyouKeikakusho(data: RyouyouKeikakushoData): Op[] {
  const ctx = mkDrawerContext();
  setupFonts(ctx);
  setupPens(ctx);
  const paper: Box = b.paperSizeToBox(A4);
  const areas: Box[] = b.splitToRows(b.modify(paper, b.shrinkHoriz(10, 10)), b.splitAt(38, 262));
  drawUpperArea(ctx, areas[0]);
  drawMiddleArea(ctx, areas[1]);
  drawLowerArea(ctx, areas[2]);
  {
    c.setPen(ctx, "thin");
    c.rect(ctx, paper);
  }

  return c.getOps(ctx);
}

function setupFonts(ctx: DC) {
  c.createFont(ctx, "f5", "MS Mincho", 5);
  c.createFont(ctx, "f4", "MS Mincho", 4);
}

function setupPens(ctx: DC) {
  c.createPen(ctx, "thick", 0, 0, 0, 0.8);
  c.createPen(ctx, "thin", 0, 0, 0, 0.2);
}

function drawUpperArea(ctx: DC, box: Box) {
  c.setFont(ctx, "f5");
  box = b.modify(box, b.shrinkVert(0, 2));
  c.drawText(ctx, "生活習慣病　療養計画書　初回用", box, "left", "bottom");
  const right: Box = b.modify(box, b.setWidth(80, "right"));
  c.drawComposite(ctx, right, [
    { kind: "text", text: "（記入日：" }, 
    { kind: "gap-to", at: 32, mark: "issue-year" },
    { kind: "text", text: "年" },
    { kind: "gap-to", at: 50, mark: "issue-month" },
    { kind: "text", text: "月" },
    { kind: "gap-to", at: 65, mark: "issue-day" },
    { kind: "text", text: "日）" },
  ], { valign: "bottom", halign: "left", })
}
function drawMiddleArea(ctx: DC, box: Box) {
  const [upper, _gap, lower] = b.splitToRows(box, b.splitAt(14, 17));
  const [upperLeft, _upperGap, upperRight] = b.splitToColumns(upper, b.splitAt(111, 119));
  drawMiddleUpperLeft(ctx, upperLeft);
  drawMiddleUpperRight(ctx, upperRight);
  c.setPen(ctx, "thick");
  c.rect(ctx, lower);
}

function drawMiddleUpperLeft(ctx: DC, box: Box) {
  c.setPen(ctx, "thick");
  c.rect(ctx, box);
  const [row1, row2] = b.splitToRows(box, b.evenSplitter(2));
  c.setPen(ctx, "thin");
  c.frameBottom(ctx, row1);
  c.setFont(ctx, "f4");
  c.drawComposite(ctx, row1, [
    { kind: "gap", width: 11 },
    { kind: "text", text: "患者氏名：" },
    { kind: "gap-to", at: 83, mark: "patient-name" },
    { kind: "text", text: "(" },
    { kind: "text", text: "男", mark: "patient-sex-male" },
    { kind: "text", text: "・" },
    { kind: "text", text: "女", mark: "patient-sex-female" },
    { kind: "text", text: "）" },
  ]);
  c.drawComposite(ctx, row2, [
    { kind: "gap", width: 3 },
    { kind: "text", text: "生年月日：" },
    { kind: "text", text: "明", mark: "birthdate-gengou-meiji" },
    { kind: "text", text: "・" },
    { kind: "text", text: "大", mark: "birthdate-gengou-taishou"  },
    { kind: "text", text: "・" },
    { kind: "text", text: "昭", mark: "birthdate-gengou-shouwa"  },
    { kind: "text", text: "・" },
    { kind: "text", text: "平", mark: "birthdate-gengou-heisei"  },
    { kind: "text", text: "・" },
    { kind: "text", text: "令", mark: "birthdate-gengou-reiwa"  },
    { kind: "gap-to", at: 59, mark: "birthdate-nen" },
    { kind: "text", text: "年"},
    { kind: "gap-to", at: 72, mark: "birthdate-month" },
    { kind: "text", text: "月"},
    { kind: "gap-to", at: 84, mark: "birthdate-day" },
    { kind: "text", text: "日生（"},
    { kind: "gap-to", at: 101 },
    { kind: "text", text: "才）"},
  ])
}

function drawMiddleUpperRight(ctx: DC, box: Box) {
  c.setPen(ctx, "thick");
  c.rect(ctx, box);
  const [upper, lower] = b.splitToRows(b.modify(box, b.shrinkHoriz(1, 1)), b.evenSplitter(2))
  c.setFont(ctx, "f4")
  c.drawText(ctx, "主病", upper, "left", "center");
  c.drawComposite(ctx, lower, [
    { kind: "box", mark: "disease-diabetes", pen: "thin", inset: 0.3 },
    { kind: "gap", width: 1 },
    { kind: "text", text: "糖尿病"},
    { kind: "gap", width: 3 },
    { kind: "box", mark: "disease-hypertension", pen: "thin", inset: 0.3 },
    { kind: "gap", width: 1 },
    { kind: "text", text: "高血圧"},
    { kind: "gap", width: 3 },
    { kind: "box", mark: "disease-lipidemia", pen: "thin", inset: 0.3 },
    { kind: "gap", width: 1 },
    { kind: "text", text: "脂質異常症"},
  ], { valign: "center", dy: -0.6 });
}

function drawLowerArea(ctx: DC, box: Box) {

}