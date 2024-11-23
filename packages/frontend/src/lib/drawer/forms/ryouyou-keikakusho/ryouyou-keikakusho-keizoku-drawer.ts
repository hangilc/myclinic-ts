import type { Op } from "../../compiler/op";
import { mkDrawerContext, type DrawerContext as DC, type DrawerContext } from "../../compiler/context";
import * as c from "../../compiler/compiler";
import * as b from "../../compiler/box";
import { type Box } from "../../compiler/box";
import { A4 } from "../../compiler/paper-size";
import type { RyouyouKeikakushoData } from "./ryouyou-keikakusho-data";
import { mkItems, mkWidgets } from "./widgets";
import { gap, seq, textBlock, type Block } from "../../compiler/seq";

const p = mkItems();
const widgets = mkWidgets();

export function drawRyouyouKeikakushoKeizoku(data: RyouyouKeikakushoData): Op[] {
  const ctx = mkDrawerContext();
  setupFonts(ctx);
  setupPens(ctx);
  const paper: Box = b.paperSizeToBox(A4);
  const areas: Box[] = b.splitToRows(b.modify(paper, b.shrinkHoriz(20, 20)), b.splitAt(36, 247));
  drawUpperAreaSeq(ctx, areas[0], data);
  drawMiddleAreaSeq(ctx, areas[1], data);
  drawLowerAreaSeq(ctx, areas[2], data);

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

function circle(draw: boolean, radius: number): (ctx: DrawerContext, box: Box) => void {
  return (ctx: DrawerContext, box: Box) => {
    if (draw) {
      c.circle(ctx, b.cx(box), b.cy(box), radius)
    }
  }
}

function drawUpperAreaSeq(ctx: DC, box: Box, data: RyouyouKeikakushoData) {
  c.setFont(ctx, "f5");
  box = b.modify(box, b.shrinkVert(0, 2), b.setHeight(c.currentFontSize(ctx), "bottom"));
  c.drawText(ctx, "生活習慣病　療養計画書　継続用", box, "left", "bottom");
  const right: Box = b.modify(box, b.setWidth(90, "right"));
  seq(ctx, right, [
    textBlock(ctx, "（記入日:"),
    textBlock(ctx, value(data, "issue-year"), { rightAt: 32, halign: "center", }),
    textBlock(ctx, "年"),
    textBlock(ctx, value(data, "issue-month"), { rightAt: 50, halign: "center", }),
    textBlock(ctx, "月"),
    textBlock(ctx, value(data, "issue-day"), { rightAt: 65, halign: "center", }),
    textBlock(ctx, "日"),
    textBlock(ctx, "("),
    textBlock(ctx, value(data, "issue-times"), { width: 6, halign: "center" }),
    textBlock(ctx, ")回目"),
  ]);
}

function drawMiddleAreaSeq(ctx: DC, box: Box, data: RyouyouKeikakushoData) {
  const [upper, _gap, lower] = b.splitToRows(box, b.splitAt(14, 17));
  const [upperLeft, _upperGap, upperRight] = b.splitToColumns(upper, b.splitAt(98, 105));
  drawMiddleUpperLeftSeq(ctx, upperLeft, data);
  drawMiddleUpperRightSeq(ctx, upperRight, data);
  c.setPen(ctx, "thick");
  c.rect(ctx, lower);
  const rows = b.splitToRows(lower, b.splitAt(5, 58, 152));
  rows.forEach(r => c.frameBottom(ctx, r));
  c.setFont(ctx, "f4");
  c.drawText(ctx, "ねらい:重点目標の達成状況を理解できること・目標再設定と指導された生活習慣改善に取り組めること",
    rows[0], "center", "center", { dy: -0.25 });
  drawMokuhyouSeq(ctx, rows[1], data);
  drawJuutenSeq(ctx, rows[2], data);
  drawKensaSeq(ctx, rows[3], data);
}

function drawMiddleUpperLeftSeq(ctx: DC, box: Box, data: RyouyouKeikakushoData) {
  function text(text: string): Block {
    return textBlock(ctx, text, { valign: "center" });
  }
  function textCircle(text: string, key: keyof RyouyouKeikakushoData): Block {
    return textBlock(ctx, text, { valign: "center", render: circle(booleanValue(data, key), 3) });
  }
  c.setPen(ctx, "thick");
  c.rect(ctx, box);
  const [row1, row2] = b.splitToRows(box, b.evenSplitter(2));
  c.setPen(ctx, "thin");
  c.frameBottom(ctx, row1);
  c.setFont(ctx, "f4");
  seq(ctx, row1, [
    gap(8),
    text("患者氏名："),
    textBlock(ctx, value(data, "patient-name"), { rightAt: 74, valign: "center" }),
    text("("),
    textCircle("男", "patient-sex-male"),
    text("・"),
    textCircle("女", "patient-sex-female"),
    text("）"),
  ]);

  const fs = c.currentFontSize(ctx);
  seq(ctx, b.modify(row2, b.shrinkHoriz(1, 1)), [
    gap(3),
    text("生年月日:"),
    textCircle("明", "birthdate-gengou-meiji"),
    gap(-fs / 4),
    text("・"),
    gap(-fs / 4),
    textCircle("大", "birthdate-gengou-taishou"),
    gap(-fs / 4),
    text("・"),
    gap(-fs / 4),
    textCircle("昭", "birthdate-gengou-shouwa"),
    gap(-fs / 4),
    text("・"),
    gap(-fs / 4),
    textCircle("平", "birthdate-gengou-heisei"),
    gap(-fs / 4),
    text("・"),
    gap(-fs / 4),
    textCircle("令", "birthdate-gengou-reiwa"),
    textBlock(ctx, value(data, "birthdate-nen"), { width: 6, halign: "center", valign: "center" }),
    text("年"),
    textBlock(ctx, value(data, "birthdate-month"), { width: 6, halign: "center", valign: "center" }),
    text("月"),
    textBlock(ctx, value(data, "birthdate-day"), { width: 6, halign: "center", valign: "center" }),
    text("日生("),
    textBlock(ctx, value(data, "patient-age"), { width: 6, halign: "center", valign: "center" }),
    text("才)"),
  ]);
}

function boxed(ctx: DrawerContext, label: string, data: RyouyouKeikakushoData, key: keyof RyouyouKeikakushoData): Block[] {
  let size = 3;
  return [
    textBlock(ctx, "", {
      width: size, render: (ctx: DrawerContext, box: Box) => {
        c.withPen(ctx, "thin", () => {
          box = b.modify(box, b.setHeight(size, "center"), b.shiftDown(0.6));
          c.frame(ctx, box);
          if (booleanValue(data, key)) {
            c.withPen(ctx, "thick", () => {
              c.moveTo(ctx, box.left, box.bottom);
              c.lineTo(ctx, box.right, box.top);
            });
          }
        });
      }
    }),
    gap(1.5),
    textBlock(ctx, label, { valign: "center" }),
  ]
}

function drawMiddleUpperRightSeq(ctx: DC, box: Box, data: RyouyouKeikakushoData) {
  c.setPen(ctx, "thick");
  c.rect(ctx, box);
  const [upper, lower] = b.splitToRows(b.modify(box, b.shrinkHoriz(1, 1)), b.evenSplitter(2))
  c.setFont(ctx, "f4")
  c.drawText(ctx, "主病", upper, "left", "center");
  seq(ctx, b.modify(lower, b.shrinkHoriz(1, 0)), [
    ...boxed(ctx, "糖尿病", data, "disease-diabetes"),
    gap(3),
    ...boxed(ctx, "高血圧", data, "disease-hypertension"),
    gap(3),
    ...boxed(ctx, "脂質異常症", data, "disease-hyperlipidemia"),
  ]);
}

function drawMokuhyouSeq(ctx: DC, box: Box, data: RyouyouKeikakushoData) {
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
      seq(ctx, b.modify(upper, b.shiftDown(0.5)), [
        ...boxed(ctx, "体重(", data, "mokuhyou-体重-mark"),
        textBlock(ctx, value(data, "mokuhyou-体重"), { width: 11, valign: "center", halign: "center" }),
        textBlock(ctx, "kg)", { valign: "center" }),
        gap(3),
        ...boxed(ctx, "BMI:(", data, "mokuhyou-BMI-mark"),
        textBlock(ctx, value(data, "mokuhyou-BMI"), { width: 14, valign: "center", halign: "center" }),
        textBlock(ctx, ")", { valign: "center" }),
        gap(5),
        ...boxed(ctx, "収縮期／拡張期圧(", data, "mokuhyou-BP-mark"),
        textBlock(ctx, value(data, "mokuhyou-BP"), { width: 22, valign: "center", halign: "center" }),
        textBlock(ctx, "mmHg)", { valign: "center" })
      ]);
      seq(ctx, b.modify(lower, b.shiftUp(0.5)), [
        ...boxed(ctx, "HbA1c:(", data, "mokuhyou-HbA1c-mark"),
        textBlock(ctx, value(data, "mokuhyou-HbA1c"), { width: 20, valign: "center", halign: "center" }),
        textBlock(ctx, "%)", { valign: "center", }),
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

function drawJuutenSeq(ctx: DC, box: Box, data: RyouyouKeikakushoData) {
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
      seq(ctx, mark, [
        ...boxed(ctx, "食事", data, "juuten-食事-mark"),
      ], { halign: "center" });
      b.withSplitRows(body, b.evenSplitter(8), rs => {
        seq(ctx, rs[0], [
          ...boxed(ctx, "今回は、指導の必要なし", data, "juuten-食事-指導の必要なし-mark")
        ]);
        b.withSplitColumns(rs[1], b.splitAt(87), ([left, right]) => {
          seq(ctx, left, [
            ...boxed(ctx, "食事摂取量を適正にする", data, "juuten-食事-摂取量を適正にする-mark")
          ]);
          seq(ctx, right, [
            ...boxed(ctx, "食塩・調味料を控える", data, "juuten-食事-食塩・調味料を控える-mark")
          ]);
        });
        b.withSplitColumns(rs[2], b.splitAt(87), ([left, right]) => {
          seq(ctx, left, [
            ...boxed(ctx, "野菜・きのこ・海藻など食物繊維の摂取を増やす", data, "juuten-食事-食物繊維の摂取を増やす-mark")
          ]);
          seq(ctx, right, [
            ...boxed(ctx, "外食の際の注意事項(", data, "juuten-食事-外食の際の注意事項-mark"),
            textBlock(ctx, value(data, "juuten-食事-外食の際の注意事項"), { expand: true, valign: "center" }),
            textBlock(ctx, ")", { valign: "center" }),
          ]);
        });
        b.withSplitColumns(rs[3], b.splitAt(87), ([left, right]) => {
          seq(ctx, left, [
            ...boxed(ctx, "油を使った料理(揚げ物や炒め物等)の摂取を減らす", data, "juuten-食事-油を使った料理の摂取を減らす-mark")
          ]);
          seq(ctx, right, [
            ...boxed(ctx, "その他", data, "juuten-食事-その他-mark")
          ]);
        });
        seq(ctx, b.modify(rs[4], b.setWidth(106, "left")), [
          ...boxed(ctx, "節酒:[減らす(種類・量:", data, "juuten-食事-節酒-mark"),
          textBlock(ctx, value(data, "juuten-食事-節酒"), { width: 42, valign: "center" }),
          textBlock(ctx, "を週", { valign: "center" }),
          textBlock(ctx, value(data, "juuten-食事-節酒-回"), { expand: true, valign: "center" }),
          textBlock(ctx, "回)]", { valign: "center" }),
        ]);
        seq(ctx, b.modify(rs[5], b.setWidth(106, "left")), [
          ...boxed(ctx, "間食:[減らす(種類・量:", data, "juuten-食事-間食-mark"),
          textBlock(ctx, value(data, "juuten-食事-間食"), { width: 42, valign: "center" }),
          textBlock(ctx, "を週", { valign: "center" }),
          textBlock(ctx, value(data, "juuten-食事-間食-回"), { expand: true, valign: "center" }),
          textBlock(ctx, "回)]", { valign: "center" }),
        ]);
        seq(ctx, b.modify(rs[6], b.setWidth(106, "left")), [
          ...boxed(ctx, "食べ方:(ゆっくり食べる・その他(", data, "juuten-食事-食べ方-mark"),
          textBlock(ctx, value(data, "juuten-食事-食べ方"), { expand: true, valign: "center" }),
          textBlock(ctx, "))", { valign: "center" }),
        ]);
        seq(ctx, rs[7], [
          ...boxed(ctx, "食事時間:朝食、昼食、夕食を規則正しくとる", data, "juuten-食事-食事時間-mark"),
        ])
      }, { boxModifiers: [bodyModifier] })
    })
    // 運動
    b.withSplitColumns(undou, b.splitAt(18), ([mark, body]) => {
      c.frameRight(ctx, mark);
      seq(ctx, mark, [
        ...boxed(ctx, "運動", data, "juuten-運動-mark"),
      ], { halign: "center" })
      b.withSplitRows(body, b.evenSplitter(6), rs => {
        seq(ctx, rs.shift()!, [
          ...boxed(ctx, "今回は、指導の必要なし", data, "juuten-運動-指導の必要なし-mark")
        ]);
        seq(ctx, b.modify(rs.shift()!, b.setWidth(126, "left")), [
          ...boxed(ctx, "運動処方:種類(ｳｫｰｷﾝｸﾞ・", data, "juuten-運動-種類-mark"),
          textBlock(ctx, value(data, "juuten-運動-種類"), { expand: true, valign: "center", halign: "center" }),
          textBlock(ctx, ")", { valign: "center" }),
        ]);
        seq(ctx, b.modify(rs.shift()!, b.setWidth(126, "left")), [
          textBlock(ctx, "", { width: 7 }),
          textBlock(ctx, "時間(30分以上・", { valign: "center" }),
          textBlock(ctx, value(data, "juuten-運動-時間"), { width: 30, halign: "center", valign: "center" }),
          textBlock(ctx, ")、頻度(ほぼ毎日・週", { valign: "center" }),
          textBlock(ctx, value(data, "juuten-運動-頻度"), { expand: true, valign: "center", halign: "center" }),
          textBlock(ctx, "日)", { valign: "center" }),
        ]);
        seq(ctx, b.modify(rs.shift()!, b.setWidth(126, "left")), [
          textBlock(ctx, "", { width: 7 }),
          textBlock(ctx, "強度(息がはずむが会話が可能な強さ or 脈拍", { valign: "center", halign: "center" }),
          textBlock(ctx, value(data, "juuten-運動-強度-脈拍"), { width: 14, halign: "center", valign: "center" }),
          textBlock(ctx, "拍/分 or ", { valign: "center" }),
          textBlock(ctx, value(data, "juuten-運動-強度-その他"), { expand: true, valign: "center", halign: "center" }),
          textBlock(ctx, ")", { valign: "center" }),
        ]);
        seq(ctx, b.modify(rs.shift()!, b.setWidth(102, "left")), [
          ...boxed(ctx, "日常生活の活動量増加(例:1日1万歩・", data, "juuten-運動-活動量-mark"),
          textBlock(ctx, value(data, "juuten-運動-活動量"), { expand: true, valign: "center", halign: "center" }),
          textBlock(ctx, ")", { valign: "center" }),
        ]);
        seq(ctx, b.modify(rs.shift()!, b.setWidth(102, "left")), [
          ...boxed(ctx, "運動時の注意事項など(", data, "juuten-運動-注意事項-mark"),
          textBlock(ctx, value(data, "juuten-運動-注意事項"), { expand: true, valign: "center", halign: "center" }),
          textBlock(ctx, ")", { valign: "center" }),
        ]);
      }, { boxModifiers: [bodyModifier] });
    })
    // たばこ
    b.withSplitColumns(tabako, b.splitAt(18), ([mark, body]) => {
      c.frameRight(ctx, mark);
      seq(ctx, mark, [
        ...boxed(ctx, "たばこ", data, "juuten-たばこ-mark"),
      ], { halign: "center" });
      seq(ctx, b.modify(body, bodyModifier), [
        ...boxed(ctx, "喫煙・節煙の有効性", data, "juuten-たばこ-禁煙・節煙の有効性-mark"),
        textBlock(ctx, "", { rightAt: 43 }),
        ...boxed(ctx, "禁煙の実施補法等", data, "juuten-たばこ-禁煙の実施補法等-mark"),
      ]);
    })
    // その他
    b.withSplitColumns(sonota, b.splitAt(18), ([mark, body]) => {
      c.frameRight(ctx, mark);
      {
        const line1 = [...boxed(ctx, "その", data, "juuten-食事-mark")];
        const line2 = [textBlock(ctx, "他", { valign: "center" })];
        const h = c.currentFontSize(ctx) * 2;
        const dy = (b.height(mark) - h) / 2;
        const innerBox = b.modify(mark, b.innerBox(0, dy, b.width(mark), dy + h));
        b.withSplitRows(innerBox, b.evenSplitter(2), rs => {
          seq(ctx, rs[0], line1, { halign: "center" });
          seq(ctx, rs[1], line2, { halign: "center" });
        })
      }
      b.withSplitRows(b.modify(body, bodyModifier), b.evenSplitter(3), rs => {
        b.withSplitColumns(rs[0], b.splitAt(24, 48, 92), cs => {
          seq(ctx, cs[0], boxed(ctx, "仕事", data, "juuten-その他-仕事-mark"));
          seq(ctx, cs[1], boxed(ctx, "余暇", data, "juuten-その他-余暇-mark"));
          seq(ctx, cs[2], boxed(ctx, "睡眠の確保(質・量)", data, "juuten-その他-睡眠の確保-mark"));
          seq(ctx, cs[3], boxed(ctx, "減量", data, "juuten-その他-減量-mark"));
        });
        seq(ctx, rs[1], boxed(ctx, "家庭での計測(歩数、体重、血圧、腹囲等)", data, "juuten-その他-家庭での計測-mark"));
        seq(ctx, rs[2], [
          ...boxed(ctx, "その他(", data, "juuten-その他-その他-mark"),
          textBlock(ctx, value(data, "juuten-その他-その他"), { width: 88, valign: "center" }),
          textBlock(ctx, ")", { valign: "center" })
        ]);
      })
    })
  }
  )
}

function drawKensaSeq(ctx: DC, box: Box, data: RyouyouKeikakushoData) {
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
      seq(ctx, rs[0], [
        textBlock(ctx, "【血液検査項目】(採血日", { valign: "center" }),
        textBlock(ctx, value(data, "kensa-採血日-月"), { width: 8, valign: "center", halign: "center" }),
        textBlock(ctx, "月", { valign: "center" }),
        textBlock(ctx, value(data, "kensa-採血日-日"), { width: 8, halign: "center", valign: "center" }),
        textBlock(ctx, "日)", { valign: "center" }),
        textBlock(ctx, "", { rightAt: tab }),
        ...boxed(ctx, "総ｺﾚｽﾃﾛｰﾙ", data, "kensa-総コレステロール-mark"),
        textBlock(ctx, "", { rightAt: tab2 }),
        textBlock(ctx, "(", { valign: "center" }),
        textBlock(ctx, value(data, "kensa-総コレステロール"), { width: 40, halign: "center", valign: "center" }),
        textBlock(ctx, "mg/dl)", { valign: "center" })
      ]);
      {
        let cols = b.splitToColumns(rs[1], b.splitAt(tab, tab2));
        seq(ctx, cols[0], [
          ...boxed(ctx, "血糖", data, "kensa-血糖-mark"),
          textBlock(ctx, "(", { valign: "center" }),
          ...boxed(ctx, "空腹時", data, "kensa-血糖-空腹時-mark"),
          textBlock(ctx, "", { width: 3 }),
          ...boxed(ctx, "随時", data, "kensa-血糖-随時-mark"),
          textBlock(ctx, "", { width: 4 }),
          ...boxed(ctx, "食後", data, "kensa-血糖-食後-mark"),
          textBlock(ctx, "(", { valign: "center" }),
          textBlock(ctx, value(data, "kensa-血糖-食後"), { expand: true, valign: "center", halign: "center" }),
          textBlock(ctx, ")時間", { valign: "center" }),
          textBlock(ctx, ")", { valign: "center" }),
          textBlock(ctx, "", { width: 2 }),
        ]);
        seq(ctx, cols[1], [
          ...boxed(ctx, "中性脂肪", data, "kensa-中性脂肪-mark"),
        ]);
        seq(ctx, cols[2], [
          textBlock(ctx, "(", { valign: "center" }),
          textBlock(ctx, value(data, "kensa-中性脂肪"), { width: 40, halign: "center", valign: "center" }),
          textBlock(ctx, "mg/dl)", { valign: "center" })
        ])
      }
      {
        const cols = b.splitToColumns(rs[2], b.splitAt(tab, tab2));
        seq(ctx, cols[0], [
          textBlock(ctx, "", { width: 40 }),
          textBlock(ctx, "(", { valign: "center" }),
          textBlock(ctx, value(data, "kensa-血糖-値"), { expand: true, halign: "center", valign: "center" }),
          textBlock(ctx, "mg/dl)", { valign: "center" }),
          textBlock(ctx, "", { width: 2 }),
        ]);
        seq(ctx, cols[1], [
          ...boxed(ctx, "HDLｺﾚｽﾃﾛｰﾙ", data, "kensa-ＨＤＬコレステロール-mark"),
        ]);
        seq(ctx, cols[2], [
          textBlock(ctx, "(", { valign: "center" }),
          textBlock(ctx, value(data, "kensa-ＨＤＬコレステロール"), { width: 40, halign: "center", valign: "center" }),
          textBlock(ctx, "mg/dl)", { valign: "center" })
        ]);
      }
      {
        const cols = b.splitToColumns(rs[3], b.splitAt(tab, tab2));
        seq(ctx, cols[0], [
          ...boxed(ctx, "HbA1c:", data, "kensa-HbA1c-mark"),
          textBlock(ctx, "", { rightAt: 40 }),
          textBlock(ctx, "(", { valign: "center" }),
          textBlock(ctx, value(data, "kensa-HbA1c"), { expand: true, halign: "center", valign: "center" }),
          textBlock(ctx, "%)", { valign: "center" }),
          textBlock(ctx, "", { width: 2 }),
        ]);
        seq(ctx, cols[1], [
          ...boxed(ctx, "LDLｺﾚｽﾃﾛｰﾙ", data, "kensa-ＬＤＬコレステロール-mark"),
        ]);
        seq(ctx, cols[2], [
          textBlock(ctx, "(", { valign: "center" }),
          textBlock(ctx, value(data, "kensa-ＬＤＬコレステロール"), { width: 40, halign: "center", valign: "center" }),
          textBlock(ctx, "mg/dl)", { valign: "center" })
         
        ])
      }
      {
        const cols = b.splitToColumns(rs[4], b.splitAt(tab));
        seq(ctx, cols[0], [
          textBlock(ctx, "※血液検査結果を手交している場合は記載不要", { valign: "center" }),
        ]);
        seq(ctx, cols[1], [
          ...boxed(ctx, "その他", data, "kensa-血液検査項目-その他-mark"),
          textBlock(ctx, "(", { valign: "center" }),
          textBlock(ctx, value(data, "kensa-血液検査項目-その他"), { width: 62, halign: "center", valign: "center" }),
          textBlock(ctx, ")", { valign: "center" })
        ])
      }
    }, { rowModifiers: [b.shrinkHoriz(1, 1)] });
    b.withSplitRows(rs[1], b.evenSplitter(3), rs => {
      c.drawComposite(ctx, rs[0], [
        p.text("【その他】")
      ]);
      seq(ctx, rs[1], [
        ...boxed(ctx, "栄養状態", data, "kensa-栄養状態-mark"),
        textBlock(ctx, "", { rightAt: 24 }),
        textBlock(ctx, "(低栄養状態の恐れ", { valign: "center" }),
        textBlock(ctx, "", { width: 8 }),
        textBlock(ctx, "良好", { valign: "center" }),
        textBlock(ctx, "", { width: 8 }),
        textBlock(ctx, "肥満", { valign: "center" }),
        textBlock(ctx, ")", { valign: "center" }),
      ]);
      seq(ctx, rs[2], [
        ...boxed(ctx, "その他", data, "kensa-その他-その他-mark"),
        textBlock(ctx, "", { rightAt: 24 }),
        textBlock(ctx, "(", { valign: "center" }),
        textBlock(ctx, "", { width: 58 }),
        textBlock(ctx, ")", { valign: "center" }),
      ]);
    }, { rowModifiers: [b.shrinkHoriz(1, 1), b.shrinkVert(0, 0.5)] });
  });
}

function drawLowerAreaSeq(ctx: DC, box: Box, data: RyouyouKeikakushoData) {
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
      seq(ctx, rs[0], [
        ...boxed(ctx, lines[0], data, "患者署名省略-mark"),
      ]);
      seq(ctx, rs[1], [
        textBlock(ctx, lines[1], { valign: "center" }),
      ]);
    }, { boxModifiers: [b.shrinkHoriz(26, 0), b.shiftDown(1)] });
  });
}
