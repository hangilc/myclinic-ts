import type { Op } from "../../compiler/op";
import { mkDrawerContext, type DrawerContext as DC, type DrawerContext } from "../../compiler/context";
import * as c from "../../compiler/compiler";
import * as b from "../../compiler/box";
import * as p from "../../compiler/composite-item";
import { type Box } from "../../compiler/box";
import { A4 } from "../../compiler/paper-size";
import { createRendererInputs, createRendererInterface, createRendererMap } from "../../compiler/create-renderer";
import type { RyouyouKeikakushoData } from "./ryouyou-keikakusho-data";

export function mkRyouyouKeikakushoKeizokuContext(): DrawerContext {
  const ctx = mkDrawerContext();
  setupFonts(ctx);
  setupPens(ctx);
  const paper: Box = b.paperSizeToBox(A4);
  const areas: Box[] = b.splitToRows(b.modify(paper, b.shrinkHoriz(20, 20)), b.splitAt(36, 247));
  drawUpperArea(ctx, areas[0]);
  drawMiddleArea(ctx, areas[1]);
  drawLowerArea(ctx, areas[2]);
  return ctx;
}

export function drawRyouyouKeikakushoKeizoku(data: RyouyouKeikakushoData): Op[] {
  const ctx = mkRyouyouKeikakushoKeizokuContext();
  c.fillData(ctx, data);
  // {
  //   c.setPen(ctx, "thin");
  //   c.rect(ctx, paper);
  // }
  // console.log(Object.keys(ctx.marks).join("\n"));
  // console.log(createRendererInterface(ctx));
  // console.log(createRendererMap(ctx, "keizokuDataMap"));
  // console.log(createRendererInputs(ctx, "keizokuDataMap"));
  // Object.keys(ctx.marks).forEach(k => console.log(k));
  
  return c.getOps(ctx);
}

function setupFonts(ctx: DC) {
  c.createFont(ctx, "f5", "MS Mincho", 4);
  c.createFont(ctx, "f4", "MS Mincho", 3.5);
}

function setupPens(ctx: DC) {
  c.createPen(ctx, "thick", 0, 0, 0, 0.6);
  c.createPen(ctx, "thin", 0, 0, 0, 0.2);
}

function drawUpperArea(ctx: DC, box: Box) {
  c.setFont(ctx, "f5");
  box = b.modify(box, b.shrinkVert(0, 2), b.setHeight(c.currentFontSize(ctx), "bottom"));
  c.drawText(ctx, "生活習慣病　療養計画書　継続用", box, "left", "bottom");
  const right: Box = b.modify(box, b.setWidth(90, "right"));
  c.drawComposite(ctx, right, [
    p.text("（記入日:"),
    p.gapTo(32, { mark: "issue-year", ropt: { halign: "center" } }),
    p.text("年"),
    p.gapTo(50, { mark: "issue-month", ropt: { halign: "center" } }),
    p.text("月"),
    p.gapTo(65, {mark: "issue-day", ropt: { halign: "center" } }),
    p.text("日）"),
    p.text("("),
    p.gap(6, { mark: "issue-times", ropt: { halign: "center" }  }),
    p.text(")回目")
  ], { valign: "bottom", halign: "left", })
}

function drawMiddleArea(ctx: DC, box: Box) {
  const [upper, _gap, lower] = b.splitToRows(box, b.splitAt(14, 17));
  const [upperLeft, _upperGap, upperRight] = b.splitToColumns(upper, b.splitAt(98, 105));
  drawMiddleUpperLeft(ctx, upperLeft);
  drawMiddleUpperRight(ctx, upperRight);
  c.setPen(ctx, "thick");
  c.rect(ctx, lower);
  const rows = b.splitToRows(lower, b.splitAt(5, 58, 152));
  rows.forEach(r => c.frameBottom(ctx, r));
  c.setFont(ctx, "f4");
  c.drawText(ctx, "ねらい:重点目標の達成状況を理解できること・目標再設定と指導された生活習慣改善に取り組めること",
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
    { kind: "gap", width: 8 },
    { kind: "text", text: "患者氏名：" },
    { kind: "gap-to", at: 74, mark: "patient-name" },
    { kind: "text", text: "(" },
    { kind: "text", text: "男", mark: "patient-sex-male" },
    { kind: "text", text: "・" },
    { kind: "text", text: "女", mark: "patient-sex-female" },
    { kind: "text", text: "）" },
  ]);
  c.drawComposite(ctx, row2, [
    { kind: "text", text: "生年月日:" },
    { kind: "text", text: "明", mark: "birthdate-gengou-meiji" },
    { kind: "text", text: "・" },
    { kind: "text", text: "大", mark: "birthdate-gengou-taishou" },
    { kind: "text", text: "・" },
    { kind: "text", text: "昭", mark: "birthdate-gengou-shouwa" },
    { kind: "text", text: "・" },
    { kind: "text", text: "平", mark: "birthdate-gengou-heisei" },
    { kind: "text", text: "・" },
    { kind: "text", text: "令", mark: "birthdate-gengou-reiwa" },
    p.gap(6, { mark: "birthdate-nen" }),
    { kind: "text", text: "年" },
    p.gap(6, { mark: "birthdate-month" }),
    { kind: "text", text: "月" },
    p.gap(6, { mark: "birthdate-day" }),
    { kind: "text", text: "日生(" },
    p.expander({ mark: "birthdate-age" }),
    { kind: "text", text: "才)" },
  ], { boxModifiers: [b.shrinkHoriz(1, 1)] });
}

function drawMiddleUpperRight(ctx: DC, box: Box) {
  function boxed(label: string, mark: string): c.CompositeItem[] {
    return [
      { kind: "box", mark, pen: "thin" },
      { kind: "gap", width: 0.5 },
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
  ], { valign: "center" });
}

function drawMokuhyou(ctx: DC, box: Box) {
  function boxed(label: string, mark: string): c.CompositeItem[] {
    return [
      { kind: "box", mark, pen: "thin" },
      { kind: "gap", width: 1 },
      { kind: "text", text: label },
    ];
  }

  const cols = b.splitToColumns(box, b.splitAt(7));
  c.setPen(ctx, "thick");
  c.frameRight(ctx, cols[0]);
  c.drawTextVertically(ctx, "︻目標︼", cols[0], "center", "center");
  const rows: Box[] = [];
  {
    const h = b.height(box) - 13.5 * 3 - 2.5;
    b.withSplitRows(cols[1], b.splitAt(h), rs => {
      rows.push(rs[0]);
      b.withSplitRows(rs[1], b.evenSplitter(3), rs => rows.push(...rs), { boxModifiers: [b.shiftUp(1.5)] });
    }, { boxModifiers: [b.shrinkHoriz(0.5, 0.5)] });
  }
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
      ], { boxModifiers: [b.shiftDown(0.5)] });
      c.drawComposite(ctx, lower, [
        ...boxed("HbA1c:(", "mokuhyou-HbA1c-mark"),
        p.gap(20, { mark: "mokuhyou-BP" }),
        p.text("%)"),
      ], { boxModifiers: [b.shiftUp(0.5)] });
    })
  }
  {
    b.withSplitRows(rows[1], b.splitAt(5), ([upper, lower]) => {
      c.drawText(ctx, "【➀目標の達成状況】", upper, "left", "center");
      const fontSave = c.getCurrentFont(ctx);
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
      c.mark(ctx, "mokuhyou-目標達成状況", b.modify(lower, b.shrinkHoriz(6, 6), b.shrinkVert(2, 2)));
    });
  }
  {
    b.withSplitRows(rows[2], b.splitAt(5), ([upper, lower]) => {
      c.drawText(ctx, "【➁達成目標】:患者と相談した目標", upper, "left", "center");
      const fontSave = c.getCurrentFont(ctx);
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
    b.withSplitRows(rows[3], b.splitAt(5), ([upper, lower]) => {
      c.drawText(ctx, "【➂行動目標】:患者と相談した目標", upper, "left", "center");
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
      { kind: "box", mark, pen: "thin" },
      { kind: "gap", width: 1 },
      { kind: "text", text: label },
    ];
  }
  function boxedAndGap(label: string, gap: number, trail: string, boxMark: string, gapMark: string): c.CompositeItem[] {
    return [
      ...boxed(label, boxMark),
      p.gap(gap, { mark: gapMark }),
      p.text(trail),
    ]
  }
  const cols = b.splitToColumns(box, b.splitAt(7));
  c.setPen(ctx, "thick");
  c.frameRight(ctx, cols[0]);
  c.drawTextVertically(ctx, "︻重点を置く領域と指導項目︼", cols[0], "center", "center");
  b.withSplitRows(cols[1], b.splitAt(39, 69, 79), (rs) => {
    rs.forEach(r => c.frameBottom(ctx, r));
    const [shokuji, undou, tabako, sonota] = rs;
    const bodyModifier = b.inset(1);
    // 食事
    b.withSplitColumns(shokuji, b.splitAt(18), ([mark, body]) => {
      c.frameRight(ctx, mark);
      c.drawComposite(ctx, mark, [
        ...boxed("食事", "juuten-食事-mark"),
      ], { halign: "center" });
      b.withSplitRows(body, b.evenSplitter(8), rs => {
        c.drawComposite(ctx, rs[0], [
          ...boxed("今回は、指導の必要なし", "juuten-食事-指導の必要なし-mark")
        ]);
        b.withSplitColumns(rs[1], b.splitAt(87), ([left, right]) => {
          c.drawComposite(ctx, left, [
            ...boxed("食事摂取量を適正にする", "juuten-食事-摂取量を適正にする-mark")
          ]);
          c.drawComposite(ctx, right, [
            ...boxed("食塩・調味料を控える", "juuten-食事-食塩・調味料を控える-mark")
          ]);
        });
        b.withSplitColumns(rs[2], b.splitAt(87), ([left, right]) => {
          c.drawComposite(ctx, left, [
            ...boxed("野菜・きのこ・海藻など食物繊維の摂取を増やす", "juuten-食事-食物繊維の摂取を増やす-mark")
          ]);
          c.drawComposite(ctx, right, [
            ...boxed("外食の際の注意事項(", "juuten-食事-外食の際の注意事項-mark"),
            p.expander({ mark: "juuten-食事-外食の際の注意事項" }),
            p.text(")"),
          ]);
        });
        b.withSplitColumns(rs[3], b.splitAt(87), ([left, right]) => {
          c.drawComposite(ctx, left, [
            ...boxed("油を使った料理(揚げ物や炒め物等)の摂取を減らす", "juuten-食事-油を使った料理の摂取を減らす-mark")
          ]);
          c.drawComposite(ctx, right, [
            ...boxed("その他", "juuten-食事-その他-mark")
          ]);
        });
        c.drawComposite(ctx, rs[4], [
          ...boxed("節酒:[減らす(種類・量:", "juuten-食事-節酒-mark"),
          p.gap(42, { mark: "shokuji-食事-節酒" }),
          p.text("を週"),
          p.expander({ mark: "shokuji-食事-節酒-回" }),
          p.text("回)]"),
          p.gapTo(106),
        ]);
        c.drawComposite(ctx, rs[5], [
          ...boxed("間食:[減らす(種類・量:", "juuten-食事-間食-mark"),
          p.gap(42, { mark: "shokuji-食事-間食" }),
          p.text("を週"),
          p.expander({ mark: "shokuji-食事-間食-回" }),
          p.text("回)]"),
          p.gapTo(106),
        ]);
        c.drawComposite(ctx, rs[6], [
          ...boxed("食べ方:(ゆっくり食べる・その他(", "juuten-食事-食べ方-mark"),
          p.expander({ mark: "juuten-食事-食べ方" }),
          p.text("))"),
          p.gapTo(106,)
        ]);
        c.drawComposite(ctx, rs[7], [
          ...boxed("食事時間:朝食、昼食、夕食を規則正しくとる", "juuten-食事-食事時間-mark"),
        ])
      }, { boxModifiers: [bodyModifier] })
    })
    // 運動
    b.withSplitColumns(undou, b.splitAt(18), ([mark, body]) => {
      c.frameRight(ctx, mark);
      c.drawComposite(ctx, mark, [
        ...boxed("運動", "juuten-運動-mark"),
      ], { halign: "center" })
      b.withSplitRows(body, b.evenSplitter(6), rs => {
        c.drawComposite(ctx, rs.shift()!, [
          ...boxed("今回は、指導の必要なし", "juuten-運動-指導の必要なし-mark")
        ]);
        c.drawComposite(ctx, rs.shift()!, [
          ...boxed("運動処方:種類(ｳｫｰｷﾝｸﾞ・", "juuten-運動-種類-mark"),
          p.expander({ mark: "juuten-運動-種類" }),
          p.text(")"),
          p.gapTo(126),
        ]);
        c.drawComposite(ctx, rs.shift()!, [
          p.gap(7),
          p.text("時間(30分以上・"),
          p.gap(30, { mark: "juuten-運動-時間" }),
          p.text(")、頻度(ほぼ毎日・週"),
          p.expander({ mark: "juuten-運動-頻度" }),
          p.text("日)"),
          p.gapTo(126),
        ]);
        c.drawComposite(ctx, rs.shift()!, [
          p.gap(7),
          p.text("強度(息がはずむが会話が可能な強さ or 脈拍"),
          p.gap(14, { mark: "juuten-運動-強度-脈拍" }),
          p.text("拍/分 or "),
          p.expander({ mark: "juuten-運動-強度-その他" }),
          p.text(")"),
          p.gapTo(126),
        ]);
        c.drawComposite(ctx, rs.shift()!, [
          ...boxed("日常生活の活動量増加(例:1日1万歩・", "juuten-運動-活動量-mark"),
          p.expander({ mark: "juuten-運動-活動量" }),
          p.text(")"),
          p.gapTo(102),
        ]);
        c.drawComposite(ctx, rs.shift()!, [
          ...boxed("運動時の注意事項など(", "juuten-運動-注意事項-mark"),
          p.expander({ mark: "juuten-運動-注意事項" }),
          p.text(")"),
          p.gapTo(102),
        ]);
      }, { boxModifiers: [bodyModifier] });
    })
    // たばこ
    b.withSplitColumns(tabako, b.splitAt(18), ([mark, body]) => {
      c.frameRight(ctx, mark);
      c.drawComposite(ctx, mark, [
        ...boxed("たばこ", "juuten-たばこ-mark"),
      ], { halign: "center" });
      c.drawComposite(ctx, body, [
        ...boxed("喫煙・節煙の有効性", "juuten-たばこ-禁煙・節煙の有効性-mark"),
        p.gapTo(43),
        ...boxed("禁煙の実施補法等", "juuten-たばこ-禁煙の実施補法等-mark"),
      ], { boxModifiers: [bodyModifier] });
    })
    // その他
    b.withSplitColumns(sonota, b.splitAt(18), ([mark, body]) => {
      c.frameRight(ctx, mark);
      {
        const line1 = [...boxed("その", "juuten-shokuji-mark")];
        const line2 = [p.gap(5), p.text("他")];
        const w = Math.max(c.calcTotalCompositeWidth(ctx, line1, b.width(mark)), c.calcTotalCompositeWidth(ctx, line2, b.width(mark)));
        const h = c.currentFontSize(ctx) * 2;
        const dx = (b.width(mark) - w) / 2;
        const dy = (b.height(mark) - h) / 2;
        const innerBox = b.modify(mark, b.innerBox(dx, dy, dx + w, dy + h));
        b.withSplitRows(innerBox, b.evenSplitter(2), rs => {
          c.drawComposite(ctx, rs[0], line1);
          c.drawComposite(ctx, rs[1], line2);
        })
      }
      b.withSplitRows(body, b.evenSplitter(3), rs => {
        b.withSplitColumns(rs[0], b.splitAt(24, 48, 92), cs => {
          c.drawComposite(ctx, cs[0], boxed("仕事", "juuten-その他-仕事"));
          c.drawComposite(ctx, cs[1], boxed("余暇", "juuten-その他-余暇"));
          c.drawComposite(ctx, cs[2], boxed("睡眠の確保(質・量)", "juuten-その他-睡眠の確保"));
          c.drawComposite(ctx, cs[3], boxed("減量", "juuten-その他-減量"));
        });
        c.drawComposite(ctx, rs[1], boxed("家庭での計測(歩数、体重、血圧、腹囲等)", "juuten-その他-家庭での計測"));
        c.drawComposite(ctx, rs[2],
          boxedAndGap("その他(", 88, ")", "juuten-その他-その他-mark", "juuten-その他-その他"));
      }, { boxModifiers: [bodyModifier] });
    })
  })
}

function drawKensa(ctx: DC, box: Box) {
  function boxed(label: string, mark: string): c.CompositeItem[] {
    return [
      { kind: "box", mark, pen: "thin" },
      { kind: "gap", width: 0.5 },
      { kind: "text", text: label },
    ];
  }
  const cols = b.splitToColumns(box, b.splitAt(7));
  c.setPen(ctx, "thick");
  c.frameRight(ctx, cols[0]);
  c.drawTextVertically(ctx, "︻検査︼", cols[0], "center", "center");
  b.withSplitRows(cols[1], b.splitAt(26), rs => {
    c.withPen(ctx, "thin", () => {
      c.frameBottom(ctx, rs[0]);
    });
    const tab = 78;
    const tab2 = 106;
    b.withSplitRows(rs[0], b.evenSplitter(5), rs => {
      c.drawComposite(ctx, rs[0], [
        p.text("【血液検査項目】(採血日"),
        p.gap(8, { mark: "kensa-採血日-月" }),
        p.text("月"),
        p.gap(8, { mark: "kensa-採血日-日" }),
        p.text("日)"),
        p.gapTo(tab),
        ...boxed("総ｺﾚｽﾃﾛｰﾙ", "kensa-総コレステロール-mark"),
        p.gapTo(tab2),
        p.text("("),
        p.gap(40, { mark: "kensa-総コレステロール" }),
        p.text("mg/dl)")
      ]);
      c.drawComposite(ctx, rs[1], [
        ...boxed("血糖", "kensa-血糖-mark"),
        p.text("("),
        ...boxed("空腹時", "kensa-血糖-空腹時-mark"),
        p.gap(3),
        ...boxed("随時", "kensa-血糖-随時-mark"),
        p.gap(4),
        ...boxed("食後", "kensa-血糖-食後-mark"),
        p.text("("),
        p.expander({ mark: "kensa-血糖-食後" }),
        p.text(")時間"),
        p.text(")"),
        p.gap(2),
        p.gapTo(tab),
        ...boxed("中性脂肪", "kensa-中性脂肪-mark"),
        p.gapTo(tab2),
        p.text("("),
        p.gap(40, { mark: "kensa-中性脂肪" }),
        p.text("mg/dl)")
      ]);
      c.drawComposite(ctx, rs[2], [
        p.gap(40),
        p.text("("),
        p.expander({ mark: "kensa-血糖-値" }),
        p.text("mg/dl)"),
        p.gap(2),
        p.gapTo(tab),
        ...boxed("HDLｺﾚｽﾃﾛｰﾙ", "kensa-ＨＤＬコレステロール-mark"),
        p.gapTo(tab2),
        p.text("("),
        p.gap(40, { mark: "kensa-ＨＤＬコレステロール" }),
        p.text("mg/dl)")
      ]);
      c.drawComposite(ctx, rs[3], [
        ...boxed("HbA1c:", ""),
        p.gapTo(40),
        p.text("("),
        p.expander({ mark: "kensa-HbA1c" }),
        p.text("%)"),
        p.gap(2),
        p.gapTo(tab),
        ...boxed("LDLｺﾚｽﾃﾛｰﾙ", "kensa-ＬＤＬコレステロール-mark"),
        p.gapTo(tab2),
        p.text("("),
        p.gap(40, { mark: "kensa-ＬＤＬコレステロール" }),
        p.text("mg/dl)")
      ]);
      c.drawComposite(ctx, rs[4], [
        p.text("※血液検査結果を手交している場合は記載不要"),
        p.gapTo(tab),
        ...boxed("その他", "kensa-血液検査項目-その他-mark"),
        p.text("("),
        p.gap(62, { mark: "kensa-血液検査項目-その他" }),
        p.text(")")
      ]);
    }, { rowModifiers: [b.shrinkHoriz(1, 1)] });
    b.withSplitRows(rs[1], b.evenSplitter(3), rs => {
      c.drawComposite(ctx, rs[0], [
        p.text("【その他】")
      ]);
      c.drawComposite(ctx, rs[1], [
        ...boxed("栄養状態", "kensa-栄養状態-mark"),
        p.gapTo(24),
        p.text("(低栄養状態の恐れ"),
        p.gap(8),
        p.text("良好"),
        p.gap(8),
        p.text("肥満"),
        p.text(")"),
      ]);
      c.drawComposite(ctx, rs[2], [
        ...boxed("その他", "kensa-その他-その他-mark"),
        p.gapTo(24),
        p.text("("),
        p.gap(58),
        p.text(")"),
      ]);
    }, { rowModifiers: [b.shrinkHoriz(1, 1)] });
  });
}

function drawLowerArea(ctx: DC, box: Box) {
  function boxed(label: string, mark: string): c.CompositeItem[] {
    return [
      { kind: "box", mark, pen: "thin" },
      { kind: "gap", width: 0.5 },
      { kind: "text", text: label },
    ];
  }
  b.withSplitRows(box, b.splitAt(5, 15, 25), ([upper, middle, lower]) => {
    c.drawText(ctx, "※実施項目は、□にチェック、(  )内には具体的に記入", upper, "left", "center", { dy: -0.6 });
    const sigWidth = 70.5;
    b.withSplitColumns(middle, b.splitAt(26, 99.5), ([_, left, right]) => {
      left = b.modify(left, b.setWidth(sigWidth, "left"));
      right = b.modify(right, b.setWidth(sigWidth, "left"));
      c.withPen(ctx, "thin", () => {
        c.rect(ctx, left);
        c.drawText(ctx, "患者署名", left, "left", "top", { modifiers: [b.inset(0.5)] });
        c.rect(ctx, right);
        c.drawText(ctx, "医師氏名", right, "left", "top", { modifiers: [b.inset(0.5)] });
        c.mark(ctx, "医師氏名", b.modify(right, b.shrinkHoriz(18, 0)));
      })
    });
    b.withSplitRows(lower, b.evenSplitter(2), rs => {
      const lines = [
        "患者が療養計画書の内容について説明を受けた上で十分に理解したことを確認した。",
        "(なお、上記項目に担当医がチェックした場合については患者署名を省略して差し支えない)",
      ];
      c.drawComposite(ctx, rs[0], [
        ...boxed(lines[0], "患者署名省略-mark"),
      ]);
      c.drawComposite(ctx, rs[1], [
        p.text(lines[1]),
      ]);
    }, { boxModifiers: [b.shrinkHoriz(26, 0), b.shiftDown(1)] });
  });
}
