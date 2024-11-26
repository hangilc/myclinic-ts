import type { Op } from "../../compiler/op";
import * as c from "../../compiler/compiler";
import * as b from "../../compiler/box";
import * as r from "../../compiler/render";
import { mkDrawerContext, type DrawerContext } from "../../compiler/context";
import { type DrawerContext as DC } from "../../compiler/context";
import { type Box } from "../../compiler/box";
import { A4 } from "../../compiler/paper-size";
import type { RyouyouKeikakushoData } from "./ryouyou-keikakusho-data";
import { textBlock, type LineItemSpec, advanceTo } from "../../compiler/render";
import type { HAlign } from "../../compiler/align";
import { booleanValue, boxed, drawBracketed, drawLeftSquareBracket, drawRightSquareBracket, expander, gap, line, textCircle, value } from "./widgets";

export function drawRyouyouKeikakushoShokai(data: RyouyouKeikakushoData): Op[] {
  const ctx = mkDrawerContext();
  setupFonts(ctx);
  setupPens(ctx);
  const paper: Box = b.paperSizeToBox(A4);
  const areas: Box[] = b.splitToRows(b.modify(paper, b.shrinkHoriz(10, 10)), b.splitAt(38, 262));
  drawUpperArea(ctx, areas[0], data);
  drawMiddleArea(ctx, areas[1], data);
  drawLowerArea(ctx, areas[2], data);
  return c.getOps(ctx);
}

function setupFonts(ctx: DC) {
  c.createFont(ctx, "f5", "MS Mincho", 5);
  c.createFont(ctx, "f4", "MS Mincho", 4);
  c.createFont(ctx, "f3.5", "MS Mincho", 3.5);
}

function setupPens(ctx: DC) {
  c.createPen(ctx, "thick", 0, 0, 0, 0.6);
  c.createPen(ctx, "thin", 0, 0, 0, 0.2);
}

function text(text: string): LineItemSpec {
  return r.textBlock(text, undefined, { valign: "center" });
}

function drawUpperArea(ctx: DC, box: Box, data: RyouyouKeikakushoData) {
  c.setFont(ctx, "f5");
  box = b.modify(box, b.shrinkVert(0, 2), b.setHeight(5, "bottom"));
  c.drawText(ctx, "生活習慣病　療養計画書　初回用", box, "left", "bottom");
  const right: Box = b.modify(box, b.setWidth(90, "right"));
  line(ctx, right, [
    "（記入日:",
    gap(16, value(data, "issue-year")),
    "年",
    gap(8, value(data, "issue-month")),
    "月",
    gap(8, value(data, "issue-day")),
    "日）",
  ], { halign: "right" });
}

function drawMiddleArea(ctx: DC, box: Box, data: RyouyouKeikakushoData) {
  const [upper, _gap, lower] = b.splitToRows(box, b.splitAt(14, 17));
  const [upperLeft, _upperGap, upperRight] = b.splitToColumns(upper, b.splitAt(111, 119));
  drawMiddleUpperLeft(ctx, upperLeft, data);
  drawMiddleUpperRight(ctx, upperRight, data);
  c.setPen(ctx, "thick");
  c.rect(ctx, lower);
  const rows = b.splitToRows(lower, b.splitAt(5, 50, 158));
  rows.forEach(r => c.frameBottom(ctx, r));
  c.setFont(ctx, "f4");
  c.drawText(ctx, "ねらい：検査結果を理解できること・自分の生活上の問題点を抽出し、目標を設定できること",
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
    gap(11),
    "患者氏名：",
    expander(value(data, "patient-name")),
    advanceTo(83),
    "(",
    textCircle("男", booleanValue(data, "patient-sex-male")),
    "・",
    textCircle("女", booleanValue(data, "patient-sex-female")),
    "）",
  ]);
  const fs = c.currentFontSize(ctx);
  line(ctx, row2, [
    gap(3),
    text("生年月日:"),
    textCircle("明", booleanValue(data, "birthdate-gengou-meiji")),
    gap(-fs / 4),
    text("・"),
    gap(-fs / 4),
    textCircle("大", booleanValue(data, "birthdate-gengou-taishou")),
    gap(-fs / 4),
    text("・"),
    gap(-fs / 4),
    textCircle("昭", booleanValue(data, "birthdate-gengou-shouwa")),
    gap(-fs / 4),
    text("・"),
    gap(-fs / 4),
    textCircle("平", booleanValue(data, "birthdate-gengou-heisei")),
    gap(-fs / 4),
    text("・"),
    gap(-fs / 4),
    textCircle("令", booleanValue(data, "birthdate-gengou-reiwa")),
    expander(value(data, "birthdate-nen")),
    advanceTo(59),
    text("年"),
    expander(value(data, "birthdate-month")),
    advanceTo(72),
    text("月"),
    expander(value(data, "birthdate-day")),
    advanceTo(84),
    text("日生("),
    expander(value(data, "patient-age")),
    advanceTo(101),
    text("才)"),
  ])
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
  const rows = b.splitToRows(cols[1], b.splitAt(9.5, 26.5));
  rows[2] = b.modify(rows[2], b.shrinkVert(0, 1));
  {
    const box = b.modify(rows[0], b.inset(1));
    c.drawText(ctx, "【目標】", box, "left", "top");
    b.withSplitRows(b.modify(rows[0], b.shrinkHoriz(17, 0)), b.evenSplitter(2), ([upper, lower]) => {
      line(ctx, upper, [
        ...boxed("体重(", data, "mokuhyou-体重-mark"),
        gap(11, value(data, "mokuhyou-体重")),
        text("kg)"),
        gap(3),
        ...boxed("BMI:(", data, "mokuhyou-BMI-mark"),
        gap(14, value(data, "mokuhyou-BMI")),
        text(")"),
        gap(5),
        ...boxed("収縮期／拡張期圧(", data, "mokuhyou-BP-mark"),
        gap(22, value(data, "mokuhyou-BP")),
        text("mmHg)")
      ]);
      line(ctx, lower, [
        ...boxed("HbA1c:(", data, "mokuhyou-HbA1c-mark"),
        gap(20, value(data, "mokuhyou-HbA1c")),
        text("%)"),
      ]);
    })
  }
  {
    b.withSplitRows(rows[1], b.splitAt(5), ([upper, lower]) => {
      c.drawText(ctx, "【➀達成目標】:患者と相談した目標", upper, "left", "center");
      c.withFont(ctx, "f4", () => {
        lower = b.modify(lower, b.shrinkHoriz(3, 3), b.shrinkVert(2, 2));
        drawBracketed(ctx, lower, value(data, "mokuhyou-達成目標"));
      })
    });
  }
  {
    b.withSplitRows(rows[2], b.splitAt(5), ([upper, lower]) => {
      c.drawText(ctx, "【➁行動目標】:患者と相談した目標", upper, "left", "center");
      c.withFont(ctx, "f4", () => {
        lower = b.modify(lower, b.shrinkHoriz(3, 3), b.shrinkVert(2, 2));
        drawBracketed(ctx, lower, value(data, "mokuhyou-行動目標"));
      })
    });
  }
}

function drawJuuten(ctx: DC, box: Box, data: RyouyouKeikakushoData) {
  const cols = b.splitToColumns(box, b.splitAt(7));
  c.setPen(ctx, "thick");
  c.frameRight(ctx, cols[0]);
  c.drawTextVertically(ctx, "︻重点を置く領域と指導項目︼", cols[0], "center", "center");
  b.withSplitRows(cols[1], b.splitAt(46, 76.5, 89), (rs) => {
    rs.forEach(r => c.frameBottom(ctx, r));
    const [shokuji, undou, tabako, sonota] = rs;
    const bodyModifier = b.inset(1);
    // 食事
    b.withSplitColumns(shokuji, b.splitAt(18), ([mark, body]) => {
      c.frameRight(ctx, mark);
      line(ctx, mark, [
        ...boxed("食事", data, "juuten-食事-mark"),
      ], { halign: "center" });
      b.withSplitRows(body, b.evenSplitter(7), rs => {
        b.withSplitColumns(rs[0], b.splitAt(98), ([left, right]) => {
          line(ctx, left, [
            ...boxed("食事摂取量を適正にする", data, "juuten-食事-摂取量を適正にする-mark")
          ]);
          line(ctx, right, [
            ...boxed("食塩・調味料を控える", data, "juuten-食事-食塩・調味料を控える-mark")
          ]);
        });
        b.withSplitColumns(rs[1], b.splitAt(98), ([left, right]) => {
          line(ctx, left, [
            ...boxed("野菜・きのこ・海藻など食物繊維の摂取を増やす", data, "juuten-食事-食物繊維の摂取を増やす-mark")
          ]);
          line(ctx, right, [
            ...boxed("外食の際の注意事項(", data, "juuten-食事-外食の際の注意事項-mark"),
            expander(value(data, "juuten-食事-外食の際の注意事項" )),
            ")",
          ]);
        });
        b.withSplitColumns(rs[2], b.splitAt(98), ([left, right]) => {
          line(ctx, left, [
            ...boxed("油を使った料理(揚げ物や炒め物等)の摂取を減らす", data, "juuten-食事-油を使った料理の摂取を減らす-mark")
          ]);
          line(ctx, right, [
            ...boxed("その他", data, "juuten-食事-その他-mark")
          ]);
        });
        line(ctx, rs[3], [
          ...boxed("節酒:[減らす(種類・量:", data, "juuten-食事-節酒-mark"),
          gap(42, value(data, "juuten-食事-節酒" )),
          "を週",
          gap(8, value(data, "juuten-食事-節酒-回")),
          "回)]",
        ]);
        line(ctx, rs[4], [
          ...boxed("間食:[減らす(種類・量:", data, "juuten-食事-間食-mark"),
          gap(42, value(data, "juuten-食事-間食")),
          text("を週"),
          gap(8, value(data, "juuten-食事-間食-回")),
          text("回)]"),
        ]);
        line(ctx, rs[5], [
          ...boxed("食べ方:(", data, "juuten-食事-食べ方-mark"),
          textCircle("ゆっくり食べる", booleanValue(data, "juuten-食事-食べ方-ゆっくり食べる")),
          text("・その他("),
          gap(44, value(data, "juuten-食事-食べ方")),
          text("))"),
        ]);
        line(ctx, rs[6], [
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
      b.withSplitRows(body, b.evenSplitter(5), rs => {
        line(ctx, rs[0], [
          ...boxed("運動処方:種類(", data, "juuten-運動-種類-mark"),
          textCircle("ｳｫｰｷﾝｸﾞ", booleanValue(data, "juuten-運動-ウォーキング-mark" )),
          text("・"),
          gap(82, value(data, "juuten-運動-種類" )),
          text(")"),
        ]);
        line(ctx, rs[1], [
          gap(7),
          text("時間(30分以上・"),
          gap(30, value(data, "juuten-運動-時間" )),
          text(")、頻度("),
          textCircle("ほぼ毎日", booleanValue(data, "juuten-運動-ほぼ毎日")),
          text("・週"),
          gap(22, value(data, "juuten-運動-頻度")),
          text("日)"),
        ]);
        line(ctx, rs[2], [
          gap(7),
          text("強度("),
          textCircle("息がはずむが会話が可能な強さ", booleanValue(data, "juuten-運動-息がはずむが会話が可能な強さ")),
          text(" or 脈拍"),
          gap(14, value(data, "juuten-運動-強度-脈拍")),
          text("拍/分 or "),
          gap(14, value(data, "juuten-運動-強度-その他")),
          text(")"),
        ]);
        line(ctx, rs[3], [
          ...boxed("日常生活の活動量増加(例:1日1万歩・", data, "juuten-運動-活動量-mark"),
          gap(36, value(data, "juuten-運動-活動量")),
          text(")"),
        ]);
        line(ctx, rs[4], [
          ...boxed("運動時の注意事項など(", data, "juuten-運動-注意事項-mark"),
          gap(62, value(data, "juuten-運動-注意事項")),
          text(")"),
        ]);
      }, { boxModifiers: [bodyModifier] });
    })
    // たばこ
    b.withSplitColumns(tabako, b.splitAt(18), ([mark, body]) => {
      c.frameRight(ctx, mark);
      line(ctx, mark, [
        ...boxed("たばこ", data, "juuten-たばこ-mark"),
      ], { halign: "center" });
      b.withSplitRows(body, b.evenSplitter(2), rs => {
        line(ctx, rs[0], boxed("非喫煙者である", data, "juuten-たばこ-非喫煙者-mark"));
        b.withSplitColumns(rs[1], b.splitAt(46), cs => {
          line(ctx, cs[0], boxed("禁煙・節煙の有効性", data, "juuten-たばこ-禁煙・節煙の有効性-mark"));
          line(ctx, cs[1], boxed("禁煙の実施補法等", data, "juuten-たばこ-禁煙の実施補法等-mark"));
        });
      }, { boxModifiers: [bodyModifier] });
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
      b.withSplitRows(body, b.evenSplitter(3), rs => {
        b.withSplitColumns(rs[0], b.splitAt(24, 48, 92), cs => {
          line(ctx, cs[0], boxed("仕事", data, "juuten-その他-仕事-mark"));
          line(ctx, cs[1], boxed("余暇", data, "juuten-その他-余暇-mark"));
          line(ctx, cs[2], boxed("睡眠の確保(質・量)", data, "juuten-その他-睡眠の確保-mark"));
          line(ctx, cs[3], boxed("減量", data, "juuten-その他-減量-mark"));
        });
        line(ctx, rs[1], boxed("家庭での計測(歩数、体重、血圧、腹囲等)", data, "juuten-その他-家庭での計測-mark"));
        line(ctx, rs[2],[
          ...boxed("その他(", data, "juuten-その他-その他-mark"),
          gap(88, value(data, "juuten-その他-その他")),
          ")",
        ]);
      }, { boxModifiers: [bodyModifier] });
    })
  })
}

function drawKensa(ctx: DC, box: Box, data: RyouyouKeikakushoData) {
  const cols = b.splitToColumns(box, b.splitAt(7));
  c.setPen(ctx, "thick");
  c.frameRight(ctx, cols[0]);
  c.drawTextVertically(ctx, "︻検査︼", cols[0], "center", "center");
  b.withSplitRows(cols[1], b.splitAt(30), rs => {
    c.withPen(ctx, "thin", () => {
      c.frameBottom(ctx, rs[0]);
    });
    b.withSplitRows(rs[0], b.evenSplitter(5), rs => {
      line(ctx, rs[0], [
        text("【血液検査項目】(採血日"),
        gap(8, value(data, "kensa-採血日-月")),
        text("月"),
        gap(8, value(data, "kensa-採血日-日")),
        text("日)"),
        advanceTo(88),
        ...boxed("総ｺﾚｽﾃﾛｰﾙ", data, "kensa-総コレステロール-mark"),
        advanceTo(122),
        text("("),
        gap(40, value(data, "kensa-総コレステロール")),
        text("mg/dl)")
      ]);
      line(ctx, rs[1], [
        ...boxed("血糖", data, "kensa-血糖-mark"),
        text("("),
        ...boxed("空腹時", data, "kensa-血糖-空腹時-mark"),
        gap(3),
        ...boxed("随時", data, "kensa-血糖-随時-mark"),
        gap(4),
        ...boxed("食後", data, "kensa-血糖-食後-mark"),
        text("("),
        expander(value(data, "kensa-血糖-食後")),
        text(")時間"),
        text(")"),
        gap(2),
        advanceTo(88),
        ...boxed("中性脂肪", data, "kensa-中性脂肪-mark"),
        advanceTo(122),
        text("("),
        gap(40, value(data, "kensa-中性脂肪")),
        text("mg/dl)")
      ]);
      line(ctx, rs[2], [
        gap(40),
        text("("),
        expander(value(data, "kensa-血糖-値")),
        text("mg/dl)"),
        gap(2),
        advanceTo(88),
        ...boxed("HDLｺﾚｽﾃﾛｰﾙ", data, "kensa-ＨＤＬコレステロール-mark"),
        advanceTo(122),
        text("("),
        gap(40, value(data, "kensa-ＨＤＬコレステロール")),
        text("mg/dl)")
      ]);
      line(ctx, rs[3], [
        ...boxed("HbA1c:", data, "kensa-HbA1c-mark"),
        advanceTo(40),
        text("("),
        expander(value(data, "kensa-HbA1c")),
        text("%)"),
        gap(2),
        advanceTo(88),
        ...boxed("LDLｺﾚｽﾃﾛｰﾙ", data, "kensa-ＬＤＬコレステロール-mark"),
        advanceTo(122),
        text("("),
        gap(40, value(data, "kensa-ＬＤＬコレステロール")),
        text("mg/dl)")
      ]);
      line(ctx, rs[4], [
        text("※血液検査結果を手交している場合は記載不要"),
        advanceTo(88),
        ...boxed("その他", data, "kensa-血液検査項目-その他-mark"),
        text("("),
        gap(67, value(data, "kensa-血液検査項目-その他")),
        text(")")
      ]);
    }, { rowModifiers: [b.shrinkHoriz(1, 1)] });
    b.withSplitRows(rs[1], b.evenSplitter(3), rs => {
      line(ctx, rs[0], [
        text("【その他】")
      ]);
      line(ctx, rs[1], [
        ...boxed("栄養状態", data, "kensa-栄養状態-mark"),
        advanceTo(24),
        text("("),
        textCircle("低栄養状態の恐れ", booleanValue(data, "kensa-栄養状態-低栄養状態の恐れ-mark")),
        gap(8),
        textCircle("良好", booleanValue(data, "kensa-栄養状態-良好")),
        gap(8),
        textCircle("肥満", booleanValue(data, "kensa-栄養状態-肥満")),
        text(")"),
      ]);
      line(ctx, rs[2], [
        ...boxed("その他", data, "kensa-その他-その他-mark"),
        advanceTo(24),
        text("("),
        gap(64, value(data, "kensa-その他-その他")),
        text(")"),
      ]);
    }, { rowModifiers: [b.shrinkHoriz(1, 1)] });
  });
}

function drawLowerArea(ctx: DC, box: Box, data: RyouyouKeikakushoData) {
  b.withSplitRows(box, b.splitAt(6, 16), ([upper, lower]) => {
    c.drawText(ctx, "※実施項目は、□にチェック、(  )内には具体的に記入", upper, "left", "center");
    b.withSplitColumns(lower, b.splitAt(27, 110), ([_, left, right]) => {
      left = b.modify(left, b.setWidth(80, "left"));
      right = b.modify(right, b.setWidth(80, "left"), b.shrinkVert(-0.5, 0));
      c.withPen(ctx, "thin", () => {
        c.rect(ctx, left);
        c.drawText(ctx, "患者署名", left, "left", "top", { modifiers: [b.inset(0.5)] });
        c.rect(ctx, right);
        c.drawText(ctx, "医師氏名", right, "left", "top", { modifiers: [b.inset(0.5)] });
        c.drawText(ctx, value(data, "医師氏名"), b.modify(right, b.shrinkHoriz(18, 0)), "left", "center");
      })
    });
  });
}
