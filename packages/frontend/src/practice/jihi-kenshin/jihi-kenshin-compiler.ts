import { type Box } from "@/lib/drawer/compiler/box";
import * as b from "@/lib/drawer/compiler/box";
import * as c from "@/lib/drawer/compiler/compiler";
import { A4 } from "@/lib/drawer/compiler/paper-size";
import { mkDrawerContext, type DrawerContext } from "@/lib/drawer/compiler/context";
import { FontWeightBold } from "@/lib/drawer/compiler/font-weight";


const firstColWidth = 22;
const secondColWidth = 60;

// const Centered = { halign: HorizAlign.Center, valign: VertAlign.Center }

function compileShimei(ctx: DrawerContext, row: Box): void {
  // const cols = row.splitToCols(firstColWidth, secondColWidth, 17, 38, 17);
  const cols = b.splitToColumns(row, b.splitWidths(firstColWidth, secondColWidth, 17, 38, 17));
  cols.forEach(col => c.frame(ctx, col));
  c.drawText(ctx, "氏名", cols[0], "center", "center", { interCharsSpace: 4 });
  // c.addMark("氏名", cols[1]);
  c.mark(ctx, "氏名", cols[1]);
  // c.text(cols[2].inset(1), "生年月日", { halign: HorizAlign.Justify, valign: VertAlign.Center });
  c.drawTextJustified(ctx, "生年月日", b.modify(cols[2], b.shrinkHoriz(1, 1)), "center");
  // c.addMark("生年月日", cols[3]);
  c.mark(ctx, "生年月日", cols[3])
  // c.text(cols[4], "性別", Centered);
  c.drawText(ctx, "性別", cols[4], "center", "center");
  // c.addMark("性別", cols[5]);
  c.mark(ctx, "性別", cols[5]);
}

function compileJuusho(ctx: DrawerContext, row: Box): void {
  // const cols = row.splitToCols(firstColWidth);
  const cols = b.splitToColumns(row, b.splitWidths(firstColWidth));
  // cols.forEach((col) => c.frame(col));
  cols.forEach((col) => c.frame(ctx, col));
  // c.text(cols[0], "住所", { interCharsSpace: 4, ...Centered });
  c.drawText(ctx, "住所", cols[0], "center", "center", { interCharsSpace: 4 });
  // c.addMark("住所", cols[1]);
  c.mark(ctx, "住所", cols[1]);
}

function compileFormat1(ctx: DrawerContext, box: Box, label: string, mark: string = label) {
  const cols = b.splitToColumns(box, b.splitWidths(firstColWidth));
  cols.forEach((col) => c.frame(ctx, col));
  c.drawText(ctx, label, cols[0], "center", "center", { interCharsSpace: 4 });
  c.mark(ctx, mark, cols[1]);
}

function compileShincho(ctx: DrawerContext, row: Box): void {
  // const cols = row.splitToCols(firstColWidth);
  const cols = b.splitToColumns(row, b.splitWidths(firstColWidth));
  // cols.forEach((col) => c.frame(col));
  cols.forEach((col) => c.frame(ctx, col));
  // c.text(cols[0], "身長", { interCharsSpace: 4, ...Centered });
  c.drawText(ctx, "身長", cols[0], "center", "center", { interCharsSpace: 4 });
  // c.addMark("身長", cols[1]);
  c.mark(ctx, "身長", cols[1]);
}

function compileTaijuu(ctx: DrawerContext, row: Box): void {
  // const cols = row.splitToCols(firstColWidth);
  const cols = b.splitToColumns(row, b.splitWidths(firstColWidth));
  // cols.forEach((col) => c.frame(col));
  cols.forEach((col) => c.frame(ctx, col));
  // c.text(cols[0], "体重", { interCharsSpace: 4, ...Centered });
  c.drawText(ctx, "体重", cols[0], "center", "center", { interCharsSpace: 4 });
  // c.addMark("体重", cols[1]);
  c.mark(ctx, "体重", cols[1]);
}

function compileShiryoku(ctx: DrawerContext, row: Box): void {
  const cols = b.splitToColumns(row, b.splitWidths(firstColWidth));
  cols.forEach((col) => c.frame(ctx, col));
  c.drawText(ctx, "視力", cols[0], "center", "center", { interCharsSpace: 4 });
  c.mark(ctx, "視力", cols[1]);
  const cs = b.splitToColumns(cols[1], b.evenSplitter(2));
  c.mark(ctx, "視力左", cs[0]);
  c.mark(ctx, "視力右", cs[1]);
}

// function compileChouryoku(ctx: DrawerContext, row: Box): void {
//   const cols = row.splitToCols(firstColWidth);
//   cols.forEach((col) => c.frame(col));
//   c.text(cols[0], "聴力", { interCharsSpace: 4, ...Centered });
//   c.addMark("聴力", cols[1]);
// }

// function compileKetsuatsu(ctx: DrawerContext, row: Box): void {
//   const cols = row.splitToCols(firstColWidth);
//   cols.forEach((col) => c.frame(col));
//   c.text(cols[0], "血圧", { interCharsSpace: 4, ...Centered });
//   c.addMark("血圧", cols[1]);
// }

// function compileShindenzu(ctx: DrawerContext, row: Box): void {
//   const cols = row.splitToCols(firstColWidth);
//   cols.forEach((col) => c.frame(col));
//   c.text(cols[0], "心電図", Centered);
//   c.addMark("心電図", cols[1]);
// }

function compileKioureki(ctx: DrawerContext, row: Box): void {
  c.frame(ctx, row);
  c.drawText(ctx, "既往歴", b.modify(row, b.inset(1)), "left", "top");
  c.mark(ctx, "既往歴", b.modify(row, b.shrinkVert(6, 0)));
}

function compileXp(ctx: DrawerContext, row: Box): void {
  c.frame(ctx, row);
  c.drawText(ctx, "胸部Ｘ線（大角）", b.modify(row, b.inset(1)), "left", "top");
  c.mark(ctx, "Ｘ線", b.modify(row, b.shrinkVert(6, 6)));
  // const bottom = row.setHeight(6, VertDirection.Bottom).inset(1, 0, 0, 0);
  const bottom = b.modify(row, b.setHeight(6, "bottom"), b.shrinkHoriz(1, 0));
  const tw = c.textWidth(ctx, "撮影日");
  c.drawText(ctx, "撮影日", bottom, "left", "center");
  c.mark(ctx, "Ｘ線撮影日", b.modify(bottom, b.shrinkHoriz(tw + 4, 0)));
}

// function compileKensa(ctx: DrawerContext, box: Box): void {
//   const cols = box.splitToCols(firstColWidth, 84);
//   c.frame(cols[0]);
//   c.text(cols[0], "血液検査", Centered);
//   const rows = cols[1].splitToEvenRows(9);
//   rows.forEach((r, i) => {
//     const cs = r.splitToCols(32);
//     cs.forEach((col) => c.frame(col));
//     c.addMark(`血液検査名${i + 1}`, cs[0]);
//     c.addMark(`血液検査結果${i + 1}`, cs[1]);
//   });
//   compileKennyou(
//     c,
//     Box.combineRows(
//       rows
//         .slice(0, 3)
//         .map((r) =>
//           r.flipRight().setWidth(cols[2].width, HorizDirection.Left)
//         )
//     )
//   );
//   compileTokkijikou(
//     c,
//     Box.combineRows(
//       rows
//         .slice(3)
//         .map((r) =>
//           r.flipRight().setWidth(cols[2].width, HorizDirection.Left)
//         )
//     )
//   );
// }

function compileKensa(ctx: DrawerContext, box: Box): void {
  const cols = b.splitToColumns(box, b.splitWidths(firstColWidth, 84));
  c.frame(ctx, cols[0]);
  c.drawText(ctx, "血液検査", cols[0], "center", "center");
  const rows = b.splitToRows(cols[1], b.evenSplitter(9));
  rows.forEach((r, i) => {
    const cs = b.splitToColumns(r, b.splitWidths(32));
    cs.forEach((col) => c.frame(ctx, col));
    c.mark(ctx, `血液検査名${i + 1}`, cs[0]);
    c.mark(ctx, `血液検査結果${i + 1}`, cs[1]);
  });
  compileKennyou(
    ctx,
    b.modify(b.combine(rows.slice(0, 3)), b.flipRight(), b.setWidth(b.width(cols[2]), "left"))
  );
  compileTokkijikou(
    ctx,
    b.modify(b.combine(rows.slice(3)), b.flipRight(), b.setWidth(b.width(cols[2]), "left")),
  );
}

function compileKennyou(ctx: DrawerContext, box: Box): void {
  c.frame(ctx, box);
  const cols = b.splitToColumns(box, b.splitWidths(7));
  c.frame(ctx, cols[0]);
  c.drawTextVertically(ctx, "検尿", cols[0], "center", "center", { interCharsSpace: 4 });
  const rows = b.splitToRows(cols[1], b.evenSplitter(3));
  rows.forEach((r) => c.frame(ctx, r));
  c.drawComposite(ctx, rows[0], [
    { kind: "text", text: "蛋白（" },
    { kind: "gap", width: 11, mark: "尿蛋白" },
    { kind: "text", text: "）" },
  ], { halign: "center", valign: "center" });
  c.drawComposite(ctx, rows[1], [
    { kind: "text", text: "潜血（" },
    { kind: "gap", width: 11, mark: "尿潜血" },
    { kind: "text", text: "）" },
  ], { halign: "center", valign: "center" });
  c.drawComposite(ctx, rows[2], [
    { kind: "text", text: "糖　（" },
    { kind: "gap", width: 11, mark: "尿糖" },
    { kind: "text", text: "）" },
  ], { halign: "center", valign: "center" });
}

function compileTokkijikou(ctx: DrawerContext, box: Box): void {
  c.drawText(ctx, "その他特記事項", b.modify(box, b.inset(1, 1, 0, 0)), "left", "top");
  c.mark(ctx, "その他特記事項", b.modify(box, b.shrinkVert(6, 0)));
}

// function compileBottom(ctx: DrawerContext, box: Box): void {
//   c.frame(box);
//   c.text(box.inset(4, 4), "診断の結果上記の通り相違ないことを証明する。", {
//     halign: HorizAlign.Left,
//     valign: VertAlign.Top
//   });
//   const issueDate: Box = box.shift(16, 12)
//     .setWidth(46, HorizDirection.Left)
//     .setHeight(6, VertDirection.Top);
//   c.addMark("発行日", issueDate);
//   const addr1: Box = box.shift(72, 12)
//     .setWidth(72, HorizDirection.Left)
//     .setHeight(6, VertDirection.Top);
//   const addr2: Box = addr1.flipBottom().shift(0, 0);
//   c.addMark("住所1", addr1);
//   c.addMark("住所2", addr2);
//   const clinicName: Box = addr2.flipBottom().shift(0, 0)
//     .setHeight(7.5, VertDirection.Top);
//   c.addMark("クリニック名", clinicName);
//   const doctorName: Box = clinicName.flipBottom()
//     .shift(0, 3)
//     .setLeft(36)
//     .setHeight(6, VertDirection.Top);
//   c.text(doctorName, ["診断医師氏名", c.space(43,
//     {
//       mark: "医師名", modify: b => b.setTop(doctorName.top).setBottom(doctorName.bottom)
//     }), "印"], {
//     valign: VertAlign.Center
//   });
// }

function compileBottom(ctx: DrawerContext, box: Box): void {
  c.frame(ctx, box);
  c.drawText(ctx, "診断の結果上記の通り相違ないことを証明する。", b.modify(box, b.inset(4, 4)), "left", "top");
  c.mark(ctx, "発行日", b.modify(box, b.shift(16, 12), b.setWidth(46, "left"), b.setHeight(6, "top")));
  const addr1: Box = b.modify(box, b.shift(72, 12), b.setWidth(72, "left"), b.setHeight(6, "top"));
  const addr2: Box = b.modify(addr1, b.flipDown());
  c.mark(ctx, "住所1", addr1);
  c.mark(ctx, "住所2", addr2);
  const clinicName = b.modify(addr2, b.flipDown(), b.setHeight(7.5, "top"));
  c.mark(ctx, "クリニック名", clinicName);
  const doctorName = b.modify(clinicName, b.flipDown(), b.shift(0, 3), b.setLeft(36), b.setHeight(6, "top"));
  c.drawComposite(ctx, doctorName, [
    { kind: "text", text: "診断医師氏名" },
    { kind: "gap", width: 43, mark: "医師名", modifiers: [b.setTop(doctorName.top), b.setBottom(doctorName.bottom)] },
    { kind: "text", text: "印" }
  ]);
}

export function createJihiKenshinCompiler(): DrawerContext {
  const ctx: DrawerContext = mkDrawerContext();
  const paper: Box = b.paperSizeToBox(A4);
  c.createFont(ctx, "title", "MS Gothic", 7, FontWeightBold);
  c.createFont(ctx, "regular", "MS Mincho", 4);
  c.createFont(ctx, "large", "MS Mincho", 5.5);
  c.createFont(ctx, "entry", "MS Gothic", 4);
  c.createFont(ctx, "small-entry", "MS Gothic", 3);
  c.createFont(ctx, "large-entry", "MS Gothic", 5.5);
  c.createPen(ctx, "regular", 0, 0, 0, 0.1);
  c.setPen(ctx, "regular");
  const frame = b.modify(paper, b.inset(16, 42, 26, 42));
  c.setFont(ctx, "title");
  c.drawText(ctx, "健康診断書", b.modify(frame, b.flipUp(), b.shiftUp(7)), "center", "bottom", {
    interCharsSpace: 1,
  });

  c.setFont(ctx, "regular");
  c.frame(ctx, frame);
  // const rows = frame.splitToRows(...Array(9).fill(9), 9 * 9);
  const rows = b.splitToRows(frame, b.splitHeights(...Array(9).fill(9), 9 * 9));
  compileShimei(ctx, rows[0]);
  compileJuusho(ctx, rows[1]);
  compileFormat1(ctx, b.modify(rows[2], b.setWidth(firstColWidth + secondColWidth, "left")), "身長");
  compileFormat1(ctx, b.modify(rows[3], b.setWidth(firstColWidth + secondColWidth, "left")), "体重");
  compileFormat1(ctx, b.modify(rows[4], b.setWidth(firstColWidth + secondColWidth, "left")), "診察");
  compileShiryoku(
    ctx,
    // rows[5].setWidth(firstColWidth + secondColWidth, HorizDirection.Left),
    b.modify(rows[5], b.setWidth(firstColWidth + secondColWidth, "left")),
  );
  compileFormat1(ctx, b.modify(rows[6], b.setWidth(firstColWidth + secondColWidth, "left")), "聴力");
  compileFormat1(ctx, b.modify(rows[7], b.setWidth(firstColWidth + secondColWidth, "left")), "血圧");
  compileFormat1(ctx, b.modify(rows[8], b.setWidth(firstColWidth + secondColWidth, "left")), "心電図");
  compileKioureki(
    ctx,
    b.modify(b.combine(rows.slice(2, 4)), b.shrinkHoriz(firstColWidth + secondColWidth, 0))
  );
  compileXp(
    ctx,
    b.modify(b.combine(rows.slice(4, 9)), b.shrinkHoriz(firstColWidth + secondColWidth, 0))
  );
  compileKensa(ctx, rows[9]);
  compileBottom(ctx, rows[10]);
  return ctx;
}
