import type { Op } from "../../compiler/op";
import * as c from "../../compiler/compiler";
import * as b from "../../compiler/box";
import * as p from "../../compiler/composite-item";
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
  c.createPen(ctx, "thick", 0, 0, 0, 0.6);
  c.createPen(ctx, "thin", 0, 0, 0, 0.2);
}

function drawUpperArea(ctx: DC, box: Box) {
  c.setFont(ctx, "f5");
  box = b.modify(box, b.shrinkVert(0, 2));
  c.drawText(ctx, "生活習慣病　療養計画書　初回用", box, "left", "bottom");
  const right: Box = b.modify(box, b.setWidth(80, "right"));
  c.drawComposite(ctx, right, [
    p.text("（記入日："),
    p.gapTo(32, { mark: "issue-year" }),
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
  const rows = b.splitToRows(lower, b.splitAt(5, 50, 158));
  rows.forEach(r => c.frameBottom(ctx, r));
  c.setFont(ctx, "f4");
  c.drawText(ctx, "ねらい：検査結果を理解できること・自分の生活上の問題点を抽出し、目標を設定できること",
    rows[0], "center", "center", { dy: -0.25 });
  drawMokuhyou(ctx, rows[1]);
  drawJuuten(ctx, rows[2]);
  drawKensa(ctx, rows[3]);
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
    { kind: "text", text: "大", mark: "birthdate-gengou-taishou" },
    { kind: "text", text: "・" },
    { kind: "text", text: "昭", mark: "birthdate-gengou-shouwa" },
    { kind: "text", text: "・" },
    { kind: "text", text: "平", mark: "birthdate-gengou-heisei" },
    { kind: "text", text: "・" },
    { kind: "text", text: "令", mark: "birthdate-gengou-reiwa" },
    { kind: "gap-to", at: 59, mark: "birthdate-nen" },
    { kind: "text", text: "年" },
    { kind: "gap-to", at: 72, mark: "birthdate-month" },
    { kind: "text", text: "月" },
    { kind: "gap-to", at: 84, mark: "birthdate-day" },
    { kind: "text", text: "日生（" },
    { kind: "gap-to", at: 101 },
    { kind: "text", text: "才）" },
  ])
}

function drawMiddleUpperRight(ctx: DC, box: Box) {
  function boxed(label: string, mark: string): c.CompositeItem[] {
    return [
      { kind: "box", mark, pen: "thin", inset: 0.3 },
      { kind: "gap", width: 1 },
      { kind: "text", text: label },
    ];
  }

  c.setPen(ctx, "thick");
  c.rect(ctx, box);
  const [upper, lower] = b.splitToRows(b.modify(box, b.shrinkHoriz(1, 1)), b.evenSplitter(2))
  c.setFont(ctx, "f4")
  c.drawText(ctx, "主病", upper, "left", "center");
  c.drawComposite(ctx, lower, [
    ...boxed("糖尿病", "disease-diabetes"),
    { kind: "gap", width: 3 },
    ...boxed("高血圧", "disease-hypertension"),
    { kind: "gap", width: 3 },
    ...boxed("脂質異常症", "disease-hyperlipidemia"),
  ], { valign: "center", dy: -0.6 });
}

function drawMokuhyou(ctx: DC, box: Box) {
  function boxed(label: string, mark: string): c.CompositeItem[] {
    return [
      { kind: "box", mark, pen: "thin", inset: 0.3 },
      { kind: "gap", width: 1 },
      { kind: "text", text: label },
    ];
  }

  const cols = b.splitToColumns(box, b.splitAt(7));
  c.setPen(ctx, "thick");
  c.frameRight(ctx, cols[0]);
  c.drawTextVertically(ctx, "︻目標︼", cols[0], "center", "center");
  const rows = b.splitToRows(cols[1], b.splitAt(9.5, 26.5));
  rows[2] = b.modify(rows[2], b.shrinkVert(0, 1));
  {
    const box = b.modify(rows[0], b.inset(1));
    c.drawText(ctx, "【目標】", box, "left", "top");
    b.withSplitRows(b.modify(rows[0], b.shrinkHoriz(17, 0)), b.evenSplitter(2), ([upper, lower]) => {
      c.drawComposite(ctx, upper, [
        ...boxed("体重(", "mokuhyou-体重-mark"),
        p.gap(11, { mark: "mokuhyou-体重" }),
        p.text("kg)"),
        p.gap(3),
        ...boxed("BMI:(", "mokuhyou-BMI-mark"),
        p.gap(14, { mark: "mokuhyou-BMI" }),
        p.text(")"),
        p.gap(5),
        ...boxed("収縮期／拡張期圧(", "mokuhyou-BP-mark"),
        p.gap(22, { mark: "mokuhyou-bp" }),
        p.text("mmHg)")
      ], { dy: -0.6 });
      c.drawComposite(ctx, lower, [
        ...boxed("HbA1c:(", "mokuhyou-HbA1c-mark"),
        p.gap(20, { mark: "mokuhyou-BP" }),
        p.text("%)"),
      ], { dy: -0.6 });
    })
  }
  {
    b.withSplitRows(rows[1], b.splitAt(5), ([upper, lower]) => {
      c.drawText(ctx, "【➀達成目標】:患者と相談した目標", upper, "left", "center");
      const fontSave = c.getCurrentFont(ctx);
      c.setFont(ctx, "f4");
      lower = b.modify(lower, b.shrinkVert(-1.5, -1.5), b.shrinkHoriz(6, 6));
      b.withSplitRows(lower, b.evenSplitter(4), rs => {
        c.drawText(ctx, "┌", rs[0], "left", "center");
        c.drawText(ctx, "│", rs[1], "left", "center");
        c.drawText(ctx, "│", rs[2], "left", "center");
        c.drawText(ctx, "└", rs[3], "left", "center");
        c.drawText(ctx, "┐", rs[0], "right", "center");
        c.drawText(ctx, "│", rs[1], "right", "center");
        c.drawText(ctx, "│", rs[2], "right", "center");
        c.drawText(ctx, "┘", rs[3], "right", "center");
      });
      c.setFont(ctx, fontSave);
      c.mark(ctx, "mokuhyou-達成目標", b.modify(lower, b.shrinkHoriz(6, 6), b.shrinkVert(2, 2)));
    });
  }
  {
    b.withSplitRows(rows[2], b.splitAt(5), ([upper, lower]) => {
      c.drawText(ctx, "【➁行動目標】:患者と相談した目標", upper, "left", "center");
      c.withSavedFont(ctx, "f4", () => {
        lower = b.modify(lower, b.shrinkVert(-1.5, -1.5), b.shrinkHoriz(6, 6));
        b.withSplitRows(lower, b.evenSplitter(4), rs => {
          c.drawText(ctx, "┌", rs[0], "left", "center");
          c.drawText(ctx, "│", rs[1], "left", "center");
          c.drawText(ctx, "│", rs[2], "left", "center");
          c.drawText(ctx, "└", rs[3], "left", "center");
          c.drawText(ctx, "┐", rs[0], "right", "center");
          c.drawText(ctx, "│", rs[1], "right", "center");
          c.drawText(ctx, "│", rs[2], "right", "center");
          c.drawText(ctx, "┘", rs[3], "right", "center");
        });
        c.mark(ctx, "mokuhyou-行動目標", b.modify(lower, b.shrinkHoriz(6, 6), b.shrinkVert(2, 2)));
      })
    });
  }
}

function drawJuuten(ctx: DC, box: Box) {
  function boxed(label: string, mark: string): c.CompositeItem[] {
    return [
      { kind: "box", mark, pen: "thin", inset: 0.3 },
      { kind: "gap", width: 1 },
      { kind: "text", text: label },
    ];
  }
  const cols = b.splitToColumns(box, b.splitAt(7));
  c.setPen(ctx, "thick");
  c.frameRight(ctx, cols[0]);
  c.drawTextVertically(ctx, "︻重点を置く領域と指導項目︼", cols[0], "center", "center");
  b.withSplitRows(cols[1], b.splitAt(46, 76.5, 89), (rs) => {
    rs.forEach(r => c.frameBottom(ctx, r));
    const [shokuji, undou, tabako, sonota] = rs;
    // 食事
    b.withSplitColumns(shokuji, b.splitAt(18), ([mark, body]) => {
      c.frameRight(ctx, mark);
      c.drawComposite(ctx, mark, [
        ...boxed("食事", "juuten-食事-mark"),
      ], { halign: "center", dy: -0.6 });
      body = b.modify(body, b.inset(1));
      b.withSplitRows(body, b.evenSplitter(8), rs => {
        c.drawComposite(ctx, rs[0], [
          ...boxed("今回は、指導の必要なし", "juuten-食事-指導の必要なし-mark")
        ], { dy: -0.6 });
        b.withSplitColumns(rs[1], b.splitAt(98), ([left, right]) => {
          c.drawComposite(ctx, left, [
            ...boxed("食事摂取量を適正にする", "juuten-食事-摂取量を適正にする-mark")
          ], { dy: -0.6 });
          c.drawComposite(ctx, right, [
            ...boxed("食塩・調味料を控える", "juuten-食事-食塩・調味料を控える-mark")
          ], { dy: -0.6 });
        });
        b.withSplitColumns(rs[2], b.splitAt(98), ([left, right]) => {
          c.drawComposite(ctx, left, [
            ...boxed("野菜・きのこ・海藻など食物繊維の摂取を増やす", "juuten-食事-食物繊維の摂取を増やす-mark")
          ], { dy: -0.6 });
          c.drawComposite(ctx, right, [
            ...boxed("外食の際の注意事項(", "juuten-食事-外食の際の注意事項-mark"),
            p.expander({ mark: "juuten-食事-外食の際の注意事項" }),
            p.text(")"),
          ], { dy: -0.6 });
        });
        b.withSplitColumns(rs[3], b.splitAt(98), ([left, right]) => {
          c.drawComposite(ctx, left, [
            ...boxed("油を使った料理(揚げ物や炒め物等)の摂取を減らす", "juuten-食事-油を使った料理の摂取を減らす-mark")
          ], { dy: -0.6 });
          c.drawComposite(ctx, right, [
            ...boxed("その他", "juuten-食事-その他-mark")
          ], { dy: -0.6 });
        });
      })
    })
    // 運動
    b.withSplitColumns(undou, b.splitAt(18), ([mark, body]) => {
      c.frameRight(ctx, mark);
      c.drawComposite(ctx, mark, [
        ...boxed("運動", "juuten-運動-mark"),
      ], { halign: "center", dy: -0.6 })
    })
    // たばこ
    b.withSplitColumns(tabako, b.splitAt(18), ([mark, body]) => {
      c.frameRight(ctx, mark);
      c.drawComposite(ctx, mark, [
        ...boxed("たばこ", "juuten-たばこ-mark"),
      ], { halign: "center", dy: -0.6 })
    })
    // その他
    b.withSplitColumns(sonota, b.splitAt(18), ([mark, body]) => {
      c.frameRight(ctx, mark);
      c.drawComposite(ctx, mark, [
        ...boxed("食事", "juuten-shokuji-mark"),
      ], { halign: "center", dy: -0.6 })
    })
  })
}

function drawKensa(ctx: DC, box: Box) {
  const cols = b.splitToColumns(box, b.splitAt(7));
  c.setPen(ctx, "thick");
  c.frameRight(ctx, cols[0]);
  c.drawTextVertically(ctx, "︻検査︼", cols[0], "center", "center");

}

function drawLowerArea(ctx: DC, box: Box) {

}

// ︻ ︼