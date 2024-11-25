import type { Op } from "../../compiler/op";
import { mkDrawerContext, type DrawerContext as DC, type DrawerContext } from "../../compiler/context";
import * as c from "../../compiler/compiler";
import * as b from "../../compiler/box";
import * as r from "../../compiler/render";
import { type Box } from "../../compiler/box";
import { A4 } from "../../compiler/paper-size";
import type { RyouyouKeikakushoData } from "./ryouyou-keikakusho-data";
import { textBlock, type LineItemSpec, advanceTo, type LineItemSpecExtender, } from "../../compiler/render";
import type { HAlign } from "../../compiler/align";

export function drawRyouyouKeikakushoKeizoku(data: RyouyouKeikakushoData): Op[] {
  const ctx = mkDrawerContext();
  setupFonts(ctx);
  setupPens(ctx);
  const paper: Box = b.paperSizeToBox(A4);
  const areas: Box[] = b.splitToRows(b.modify(paper, b.shrinkHoriz(20, 20)), b.splitAt(36, 247));
  drawUpperArea(ctx, areas[0], data);
  drawMiddleArea(ctx, areas[1], data);
  drawLowerArea(ctx, areas[2], data);

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

function value(data: RyouyouKeikakushoData, key: keyof RyouyouKeikakushoData): string {
  return data[key]?.toString() ?? "";
}

function booleanValue(data: RyouyouKeikakushoData, key: keyof RyouyouKeikakushoData): boolean {
  return !!data[key];
}

function textCircle(text: string, drawCircle: boolean): LineItemSpec {
  return textBlock(text, undefined, {
    decorate: (ctx, box) => {
      if (drawCircle) {
        c.circle(ctx, b.cx(box), b.cy(box), 3);
      }
    }
  });
}

function gap(size: number, text?: string): LineItemSpec {
  return r.textBlock(text, size, { halign: "center" });
}

function boxed(label: string, data: RyouyouKeikakushoData, key: keyof RyouyouKeikakushoData): LineItemSpec[] {
  let size = 3;
  return [
    { kind: "block", block: {
      width: 3, height: 3,
      render: (ctx: DrawerContext, box: Box) => {
        c.withPen(ctx, "thin", () => {
          // box = b.modify(box, b.setHeight(size, "center"), b.shiftDown(0.6));
          box = b.modify(box, b.setHeight(size, "center"), b.shiftDown(1.0));
          c.frame(ctx, box);
          if (booleanValue(data, key)) {
            c.withPen(ctx, "thick", () => {
              c.moveTo(ctx, box.left, box.bottom);
              c.lineTo(ctx, box.right, box.top);
            });
          }
        });

      }
    }},
    gap(1.5),
    textBlock(label),
  ];
}

function expander(text?: string): LineItemSpec {
  return r.textBlock(text, "expand", { halign: "center" });
}

function line(ctx: DrawerContext, box: Box, extendedSpecs: (string | (LineItemSpec & LineItemSpecExtender))[], opt?: {
  halign?: HAlign
}) {
  const specs: (LineItemSpec & LineItemSpecExtender)[] = extendedSpecs.map(spec => {
    if (typeof spec === "string") {
      return r.textBlock(spec);
    } else {
      return spec;
    }
  });
  const block = r.line(ctx, specs, { maxWidth: b.width(box) });
  r.putIn(ctx, block, box, { halign: opt?.halign ?? "left", valign: "center" });
}

function drawUpperArea(ctx: DC, box: Box, data: RyouyouKeikakushoData) {
  c.setFont(ctx, "f5");
  box = b.modify(box, b.shrinkVert(0, 2), b.setHeight(c.currentFontSize(ctx), "bottom"));
  c.drawText(ctx, "生活習慣病　療養計画書　継続用", box, "left", "bottom");
  const right: Box = b.modify(box, b.setWidth(90, "right"));
  line(ctx, right, [
    "（記入日:",
    expander(value(data, "issue-year")),
    advanceTo(32),
    "年",
    expander(value(data, "issue-month")),
    advanceTo(50),
    "月",
    expander(value(data, "issue-day")),
    advanceTo(65),
    "日",
    "(",
    expander(value(data, "issue-times")),
    ")回目",
  ]);
}

function drawMiddleArea(ctx: DC, box: Box, data: RyouyouKeikakushoData) {
  const [upper, _gap, lower] = b.splitToRows(box, b.splitAt(14, 17));
  const [upperLeft, _upperGap, upperRight] = b.splitToColumns(upper, b.splitAt(98, 105));
  drawMiddleUpperLeft(ctx, upperLeft, data);
  drawMiddleUpperRight(ctx, upperRight, data);
  c.setPen(ctx, "thick");
  c.rect(ctx, lower);
  const rows = b.splitToRows(lower, b.splitAt(5, 58, 152));
  rows.forEach(r => c.frameBottom(ctx, r));
  c.setFont(ctx, "f4");
  c.drawText(ctx, "ねらい:重点目標の達成状況を理解できること・目標再設定と指導された生活習慣改善に取り組めること",
    rows[0], "center", "center", { dy: -0.25 });
  drawMokuhyou(ctx, rows[1], data);
  drawJuuten(ctx, rows[2], data);
  drawKensa(ctx, rows[3], data);
}

function drawMiddleUpperLeft(ctx: DC, box: Box, data: RyouyouKeikakushoData) {
  c.setPen(ctx, "thick");
  c.rect(ctx, box);
  const [row1, row2] = b.splitToRows(box, b.evenSplitter(2));
  c.setPen(ctx, "thin");
  c.frameBottom(ctx, row1);
  c.setFont(ctx, "f4");
  line(ctx, row1, [
    gap(8),
    "患者氏名：",
    expander(value(data, "patient-name")),
    advanceTo(74),
    "(",
    textCircle("男", booleanValue(data, "patient-sex-male")),
    "・",
    textCircle("女", booleanValue(data, "patient-sex-female")),
    "）",
  ]);

  const fs = c.currentFontSize(ctx);
  line(ctx, b.modify(row2, b.shrinkHoriz(1, 1)), [
    gap(3),
    "生年月日:",
    textCircle("明", booleanValue(data, "birthdate-gengou-meiji")),
    gap(-fs / 4),
    "・",
    gap(-fs / 4),
    textCircle("大", booleanValue(data, "birthdate-gengou-taishou")),
    gap(-fs / 4),
    "・",
    gap(-fs / 4),
    textCircle("昭", booleanValue(data, "birthdate-gengou-shouwa")),
    gap(-fs / 4),
    "・",
    gap(-fs / 4),
    textCircle("平", booleanValue(data, "birthdate-gengou-heisei")),
    gap(-fs / 4),
    "・",
    gap(-fs / 4),
    textCircle("令", booleanValue(data, "birthdate-gengou-reiwa")),
    gap(6, value(data, "birthdate-nen")),
    "年",
    gap(6, value(data, "birthdate-month")),
    "月",
    gap(6, value(data, "birthdate-day")),
    "日生(",
    gap(6, value(data, "patient-age")),
    "才)",
  ]);
}


function drawMiddleUpperRight(ctx: DC, box: Box, data: RyouyouKeikakushoData) {
  c.setPen(ctx, "thick");
  c.rect(ctx, box);
  const [upper, lower] = b.splitToRows(b.modify(box, b.shrinkHoriz(1, 1)), b.evenSplitter(2))
  c.setFont(ctx, "f4")
  c.drawText(ctx, "主病", upper, "left", "center");
  line(ctx, b.modify(lower, b.shrinkHoriz(1, 0)), [
    ...boxed("糖尿病", data, "disease-diabetes"),
    gap(3),
    ...boxed("高血圧", data, "disease-hypertension"),
    gap(3),
    ...boxed("脂質異常症", data, "disease-hyperlipidemia"),
  ]);
}

function drawMokuhyou(ctx: DC, box: Box, data: RyouyouKeikakushoData) {
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
      line(ctx, b.modify(upper, b.shiftDown(0.5)), [
        ...boxed("体重(", data, "mokuhyou-体重-mark"),
        gap(11, value(data, "mokuhyou-体重")),
        "kg)",
        gap(3),
        ...boxed("BMI:(", data, "mokuhyou-BMI-mark"),
        gap(14, value(data, "mokuhyou-BMI")),
        ")",
        gap(5),
        ...boxed("収縮期／拡張期圧(", data, "mokuhyou-BP-mark"),
        gap(22, value(data, "mokuhyou-BP")),
        "mmHg)"
      ]);
      line(ctx, b.modify(lower, b.shiftUp(0.5)), [
        ...boxed("HbA1c:(", data, "mokuhyou-HbA1c-mark"),
        gap(20, value(data, "mokuhyou-HbA1c")),
        "%)",
      ]);
    })
  }
  {
    b.withSplitRows(rows[1], b.splitAt(5), ([upper, lower]) => {
      c.drawText(ctx, "【➀目標の達成状況】", upper, "left", "center");
      lower = b.modify(lower, b.shrinkVert(1, 0.5), b.shrinkHoriz(6, 6));
      const left = b.modify(lower, b.setWidth(2, "left"));
      const right = b.modify(lower, b.setWidth(2, "right"));
      const center = b.modify(lower, b.shrinkHoriz(2, 2));
      c.withPen(ctx, "thin", () => {
        c.moveTo(ctx, left.right, left.top);
        c.lineTo(ctx, left.left, left.top);
        c.lineTo(ctx, left.left, left.bottom);
        c.lineTo(ctx, left.right, left.bottom);
        c.moveTo(ctx, right.left, right.top);
        c.lineTo(ctx, right.right, right.top);
        c.lineTo(ctx, right.right, right.bottom);
        c.lineTo(ctx, right.left, right.bottom);
      });
      c.withFont(ctx, "f4", () => {
        c.paragraph(ctx, value(data, "mokuhyou-目標達成状況"), b.modify(center, b.shrinkHoriz(2, 2)), {
          halign: "left",
          valign: "center",
        });
      })
    });
  }
  {
    b.withSplitRows(rows[2], b.splitAt(5), ([upper, lower]) => {
      c.drawText(ctx, "【➁達成目標】:患者と相談した目標", upper, "left", "center");
      lower = b.modify(lower, b.shrinkVert(1, 0.5), b.shrinkHoriz(6, 6));
      const left = b.modify(lower, b.setWidth(2, "left"));
      const right = b.modify(lower, b.setWidth(2, "right"));
      const center = b.modify(lower, b.shrinkHoriz(2, 2));
      c.withPen(ctx, "thin", () => {
        c.moveTo(ctx, left.right, left.top);
        c.lineTo(ctx, left.left, left.top);
        c.lineTo(ctx, left.left, left.bottom);
        c.lineTo(ctx, left.right, left.bottom);
        c.moveTo(ctx, right.left, right.top);
        c.lineTo(ctx, right.right, right.top);
        c.lineTo(ctx, right.right, right.bottom);
        c.lineTo(ctx, right.left, right.bottom);
      });
      c.withFont(ctx, "f4", () => {
        c.paragraph(ctx, value(data, "mokuhyou-達成目標"), b.modify(center, b.shrinkHoriz(2, 2)), {
          halign: "left",
          valign: "center",
        });
      })
    });
  }
  {
    b.withSplitRows(rows[3], b.splitAt(5), ([upper, lower]) => {
      c.drawText(ctx, "【➂行動目標】:患者と相談した目標", upper, "left", "center");
      c.withFont(ctx, "f4", () => {
        lower = b.modify(lower, b.shrinkVert(1, 0.5), b.shrinkHoriz(6, 6));
        const left = b.modify(lower, b.setWidth(2, "left"));
        const right = b.modify(lower, b.setWidth(2, "right"));
        const center = b.modify(lower, b.shrinkHoriz(2, 2));
        c.withPen(ctx, "thin", () => {
          c.moveTo(ctx, left.right, left.top);
          c.lineTo(ctx, left.left, left.top);
          c.lineTo(ctx, left.left, left.bottom);
          c.lineTo(ctx, left.right, left.bottom);
          c.moveTo(ctx, right.left, right.top);
          c.lineTo(ctx, right.right, right.top);
          c.lineTo(ctx, right.right, right.bottom);
          c.lineTo(ctx, right.left, right.bottom);
        });
        c.withFont(ctx, "f4", () => {
          c.paragraph(ctx, value(data, "mokuhyou-行動目標"), b.modify(center, b.shrinkHoriz(2, 2)), {
            halign: "left",
            valign: "center",
          });
        })
      })
    });
  }
}

function drawJuuten(ctx: DC, box: Box, data: RyouyouKeikakushoData) {
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
      line(ctx, mark, [
        ...boxed("食事", data, "juuten-食事-mark"),
      ], { halign: "center" });
      b.withSplitRows(body, b.evenSplitter(8), rs => {
        line(ctx, rs[0], [
          ...boxed("今回は、指導の必要なし", data, "juuten-食事-指導の必要なし-mark")
        ]);
        b.withSplitColumns(rs[1], b.splitAt(87), ([left, right]) => {
          line(ctx, left, [
            ...boxed("食事摂取量を適正にする", data, "juuten-食事-摂取量を適正にする-mark")
          ]);
          line(ctx, right, [
            ...boxed("食塩・調味料を控える", data, "juuten-食事-食塩・調味料を控える-mark")
          ]);
        });
        b.withSplitColumns(rs[2], b.splitAt(87), ([left, right]) => {
          line(ctx, left, [
            ...boxed("野菜・きのこ・海藻など食物繊維の摂取を増やす", data, "juuten-食事-食物繊維の摂取を増やす-mark")
          ]);
          line(ctx, right, [
            ...boxed("外食の際の注意事項(", data, "juuten-食事-外食の際の注意事項-mark"),
            expander(value(data, "juuten-食事-外食の際の注意事項")),
            ")",
          ]);
        });
        b.withSplitColumns(rs[3], b.splitAt(87), ([left, right]) => {
          line(ctx, left, [
            ...boxed("油を使った料理(揚げ物や炒め物等)の摂取を減らす", data, "juuten-食事-油を使った料理の摂取を減らす-mark")
          ]);
          line(ctx, right, [
            ...boxed("その他", data, "juuten-食事-その他-mark")
          ]);
        });
        line(ctx, b.modify(rs[4], b.setWidth(106, "left")), [
          ...boxed("節酒:[減らす(種類・量:", data, "juuten-食事-節酒-mark"),
          gap(42, value(data, "juuten-食事-節酒")),
          "を週",
          expander(value(data, "juuten-食事-節酒-回")),
          "回)]",
        ]);
        line(ctx, b.modify(rs[5], b.setWidth(106, "left")), [
          ...boxed("間食:[減らす(種類・量:", data, "juuten-食事-間食-mark"),
          gap(42, value(data, "juuten-食事-間食")),
          "を週",
          expander(value(data, "juuten-食事-間食-回")),
          "回)]",
        ]);
        line(ctx, b.modify(rs[6], b.setWidth(106, "left")), [
          ...boxed("食べ方:(ゆっくり食べる・その他(", data, "juuten-食事-食べ方-mark"),
          expander(value(data, "juuten-食事-食べ方")),
          "))",
        ]);
        line(ctx, rs[7], [
          ...boxed("食事時間:朝食、昼食、夕食を規則正しくとる", data, "juuten-食事-食事時間-mark"),
        ])
      }, { boxModifiers: [bodyModifier] })
    })
    // 運動
    b.withSplitColumns(undou, b.splitAt(18), ([mark, body]) => {
      c.frameRight(ctx, mark);
      line(ctx, mark, [
        ...boxed("運動", data, "juuten-運動-mark"),
      ], { halign: "center" })
      b.withSplitRows(body, b.evenSplitter(6), rs => {
        line(ctx, rs.shift()!, [
          ...boxed("今回は、指導の必要なし", data, "juuten-運動-指導の必要なし-mark")
        ]);
        line(ctx, b.modify(rs.shift()!, b.setWidth(126, "left")), [
          ...boxed("運動処方:種類(ｳｫｰｷﾝｸﾞ・", data, "juuten-運動-種類-mark"),
          expander(value(data, "juuten-運動-種類")),
          ")",
        ]);
        line(ctx, b.modify(rs.shift()!, b.setWidth(126, "left")), [
          gap(7),
          "時間(30分以上・",
          gap(30, value(data, "juuten-運動-時間")),
          ")、頻度(ほぼ毎日・週",
          expander(value(data, "juuten-運動-頻度")),
          "日)",
        ]);
        line(ctx, b.modify(rs.shift()!, b.setWidth(126, "left")), [
          gap(7),
          "強度(息がはずむが会話が可能な強さ or 脈拍",
          gap(14, value(data, "juuten-運動-強度-脈拍")),
          "拍/分 or ",
          expander(value(data, "juuten-運動-強度-その他")),
          ")",
        ]);
        line(ctx, b.modify(rs.shift()!, b.setWidth(102, "left")), [
          ...boxed("日常生活の活動量増加(例:1日1万歩・", data, "juuten-運動-活動量-mark"),
          expander(value(data, "juuten-運動-活動量")),
          ")",
        ]);
        line(ctx, b.modify(rs.shift()!, b.setWidth(102, "left")), [
          ...boxed("運動時の注意事項など(", data, "juuten-運動-注意事項-mark"),
          expander(value(data, "juuten-運動-注意事項")),
          ")",
        ]);
      }, { boxModifiers: [bodyModifier] });
    })
    // たばこ
    b.withSplitColumns(tabako, b.splitAt(18), ([mark, body]) => {
      c.frameRight(ctx, mark);
      line(ctx, mark, [
        ...boxed("たばこ", data, "juuten-たばこ-mark"),
      ], { halign: "center" });
      line(ctx, b.modify(body, bodyModifier), [
        ...boxed("喫煙・節煙の有効性", data, "juuten-たばこ-禁煙・節煙の有効性-mark"),
        advanceTo(43),
        ...boxed("禁煙の実施補法等", data, "juuten-たばこ-禁煙の実施補法等-mark"),
      ]);
    })
    // その他
    b.withSplitColumns(sonota, b.splitAt(18), ([mark, body]) => {
      c.frameRight(ctx, mark);
      {
        const line1 = r.line(ctx, [...boxed("その", data, "juuten-その他-mark")]);
        const line2 = r.line(ctx, [textBlock("他")]);
        const para = r.paragraph(ctx, [line1, line2], { halign: "center" });
        r.putIn(ctx, para, mark, { halign: "center", valign: "center" });
      }
      b.withSplitRows(b.modify(body, bodyModifier), b.evenSplitter(3), rs => {
        b.withSplitColumns(rs[0], b.splitAt(24, 48, 92), cs => {
          line(ctx, cs[0], boxed("仕事", data, "juuten-その他-仕事-mark"));
          line(ctx, cs[1], boxed("余暇", data, "juuten-その他-余暇-mark"));
          line(ctx, cs[2], boxed("睡眠の確保(質・量)", data, "juuten-その他-睡眠の確保-mark"));
          line(ctx, cs[3], boxed("減量", data, "juuten-その他-減量-mark"));
        });
        line(ctx, rs[1], boxed("家庭での計測(歩数、体重、血圧、腹囲等)", data, "juuten-その他-家庭での計測-mark"));
        line(ctx, rs[2], [
          ...boxed("その他(", data, "juuten-その他-その他-mark"),
          gap(88, value(data, "juuten-その他-その他")),
          ")",
        ]);
      })
    })
  }
  )
}

function drawKensa(ctx: DC, box: Box, data: RyouyouKeikakushoData) {
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
      line(ctx, rs[0], [
        "【血液検査項目】(採血日",
        gap(8, value(data, "kensa-採血日-月")),
        "月",
        gap(8, value(data, "kensa-採血日-日")),
        "日)",
        advanceTo(tab),
        ...boxed("総ｺﾚｽﾃﾛｰﾙ", data, "kensa-総コレステロール-mark"),
        advanceTo(tab2),
        "(",
        gap(40, value(data, "kensa-総コレステロール"),),
        "mg/dl)",
      ]);
      {
        line(ctx, rs[1], [
          ...boxed("血糖", data, "kensa-血糖-mark"),
          "(",
          ...boxed("空腹時", data, "kensa-血糖-空腹時-mark"),
          gap(3),
          ...boxed("随時", data, "kensa-血糖-随時-mark"),
          gap(4),
          ...boxed("食後", data, "kensa-血糖-食後-mark"),
          "(",
          expander(value(data, "kensa-血糖-食後")),
          ")時間",
          ")",
          gap(2),
          advanceTo(tab),
          ...boxed("中性脂肪", data, "kensa-中性脂肪-mark"),
          advanceTo(tab2),
          "(",
          gap(40, value(data, "kensa-中性脂肪")),
          "mg/dl)",
        ]);
      }
      {
        line(ctx, rs[2], [
          gap(40),
          "(", expander(value(data, "kensa-血糖-値")), "mg/dl)",
          gap(2),
          advanceTo(tab),
          ...boxed("HDLｺﾚｽﾃﾛｰﾙ", data, "kensa-ＨＤＬコレステロール-mark"),
          advanceTo(tab2),
          "(", gap(40, value(data, "kensa-ＨＤＬコレステロール")), "mg/dl)",
        ]);
      }
      {
        line(ctx, rs[3], [
          ...boxed("HbA1c:", data, "kensa-HbA1c-mark"),
          advanceTo(40),
          "(", expander(value(data, "kensa-HbA1c")), "%)",
          gap(2),
          advanceTo(tab),
          ...boxed("LDLｺﾚｽﾃﾛｰﾙ", data, "kensa-ＬＤＬコレステロール-mark"),
          advanceTo(tab2),
          "(", gap(40, value(data, "kensa-ＬＤＬコレステロール")), "mg/dl)",
        ])
      }
      {
        line(ctx, rs[4], [
          "※血液検査結果を手交している場合は記載不要", 
          advanceTo(tab),
          ...boxed("その他", data, "kensa-血液検査項目-その他-mark"),
          "(", gap(62, value(data, "kensa-血液検査項目-その他")), ")",
        ])
      }
    }, { rowModifiers: [b.shrinkHoriz(1, 1)] });
    b.withSplitRows(rs[1], b.evenSplitter(3), rs => {
      line(ctx, rs[0], [ "【その他】" ]);
      line(ctx, rs[1], [
        ...boxed("栄養状態", data, "kensa-栄養状態-mark"),
        advanceTo(24),
        "(低栄養状態の恐れ",
        gap(8),
        "良好",
        gap(8),
        "肥満",
        ")",
      ]);
      line(ctx, rs[2], [
        ...boxed("その他", data, "kensa-その他-その他-mark"),
        advanceTo(24),
        "(",
        gap(58),
        ")",
      ]);
    }, { rowModifiers: [b.shrinkHoriz(1, 1), b.shrinkVert(0, 0.5)] });
  });
}

function drawLowerArea(ctx: DC, box: Box, data: RyouyouKeikakushoData) {
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
        c.drawText(ctx, value(data, "医師氏名"), b.modify(right, b.shrinkHoriz(18, 0)), "left", "center");
      })
    });
    b.withSplitRows(lower, b.evenSplitter(2), rs => {
      const lines = [
        "患者が療養計画書の内容について説明を受けた上で十分に理解したことを確認した。",
        "(なお、上記項目に担当医がチェックした場合については患者署名を省略して差し支えない)",
      ];
      line(ctx, rs[0], [
        ...boxed(lines[0], data, "患者署名省略-mark"),
      ]);
      line(ctx, rs[1], [
        lines[1],
      ]);
    }, { boxModifiers: [b.shrinkHoriz(26, 0), b.shiftDown(1)] });
  });
}
