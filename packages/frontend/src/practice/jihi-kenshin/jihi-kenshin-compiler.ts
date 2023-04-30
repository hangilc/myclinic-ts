import { Box } from "@/lib/drawer-compiler/box";
import { DrawerCompiler } from "@/lib/drawer-compiler/drawer-compiler";
import {
  HorizAlign,
  HorizDirection,
  VertAlign,
  VertDirection,
} from "@/lib/drawer-compiler/enums";
import { FontWeightBold } from "@/lib/drawer-compiler/weight-consts";
import { A4 } from "@/lib/drawer-compiler/paper-size";


const firstColWidth = 22;
const secondColWidth = 60;

const Centered = { halign: HorizAlign.Center, valign: VertAlign.Center }

function compileShimei(c: DrawerCompiler, row: Box): void {
  const cols = row.splitToCols(firstColWidth, secondColWidth, 17, 38, 17);
  cols.forEach((col) => c.frame(col));
  c.text(cols[0], "氏名", { interCharsSpace: 4, ...Centered });
  c.addMark("氏名", cols[1]);
  c.text(cols[2].inset(1), "生年月日", { halign: HorizAlign.Justify, valign: VertAlign.Center });
  c.addMark("生年月日", cols[3]);
  c.text(cols[4], "性別", Centered);
  c.addMark("性別", cols[5]);
}

function compileJuusho(c: DrawerCompiler, row: Box): void {
  const cols = row.splitToCols(firstColWidth);
  cols.forEach((col) => c.frame(col));
  c.text(cols[0], "住所", { interCharsSpace: 4, ...Centered });
  c.addMark("住所", cols[1]);
}

function compileShincho(c: DrawerCompiler, row: Box): void {
  const cols = row.splitToCols(firstColWidth);
  cols.forEach((col) => c.frame(col));
  c.text(cols[0], "身長", { interCharsSpace: 4, ...Centered });
  c.addMark("身長", cols[1]);
}

function compileTaijuu(c: DrawerCompiler, row: Box): void {
  const cols = row.splitToCols(firstColWidth);
  cols.forEach((col) => c.frame(col));
  c.text(cols[0], "体重", { interCharsSpace: 4, ...Centered });
  c.addMark("体重", cols[1]);
}

function compileShinsatsu(c: DrawerCompiler, row: Box): void {
  const cols = row.splitToCols(firstColWidth);
  cols.forEach((col) => c.frame(col));
  c.text(cols[0], "診察", { interCharsSpace: 4, ...Centered });
  c.addMark("診察", cols[1]);
}

function compileShiryoku(c: DrawerCompiler, row: Box): void {
  const cols = row.splitToCols(firstColWidth);
  cols.forEach((col) => c.frame(col));
  c.text(cols[0], "視力", { interCharsSpace: 4, ...Centered });
  c.addMark("視力", cols[1]);
  const cs = cols[1].splitToEvenCols(2);
  c.addMark("視力左", cs[0]);
  c.addMark("視力右", cs[1]);
}

function compileChouryoku(c: DrawerCompiler, row: Box): void {
  const cols = row.splitToCols(firstColWidth);
  cols.forEach((col) => c.frame(col));
  c.text(cols[0], "聴力", { interCharsSpace: 4, ...Centered });
  c.addMark("聴力", cols[1]);
}

function compileKetsuatsu(c: DrawerCompiler, row: Box): void {
  const cols = row.splitToCols(firstColWidth);
  cols.forEach((col) => c.frame(col));
  c.text(cols[0], "血圧", { interCharsSpace: 4, ...Centered });
  c.addMark("血圧", cols[1]);
}

function compileShindenzu(c: DrawerCompiler, row: Box): void {
  const cols = row.splitToCols(firstColWidth);
  cols.forEach((col) => c.frame(col));
  c.text(cols[0], "心電図", Centered);
  c.addMark("心電図", cols[1]);
}

function compileKioureki(c: DrawerCompiler, row: Box): void {
  c.frame(row);
  c.text(row.inset(1), "既往歴", {
    halign: HorizAlign.Left,
    valign: VertAlign.Top
  });
  c.addMark("既往歴", row.shiftTopValue(6));
}

function compileXp(c: DrawerCompiler, row: Box): void {
  c.frame(row);
  c.text(row.inset(1), "胸部Ｘ線（大角）", {
    halign: HorizAlign.Left,
    valign: VertAlign.Top
  });
  c.addMark("Ｘ線", row.shiftTopValue(6).shiftBottomValue(-6));
  const bottom = row.setHeight(6, VertDirection.Bottom).inset(1, 0, 0, 0);
  const b = c.text(bottom, "撮影日", { halign: HorizAlign.Left, valign: VertAlign.Center });
  c.addMark("Ｘ線撮影日", bottom.setLeft(b.right).inset(4, 0, 0, 0));
}

function compileKensa(c: DrawerCompiler, box: Box): void {
  const cols = box.splitToCols(firstColWidth, 90);
  c.frame(cols[0]);
  c.text(cols[0], "血液検査", Centered);
  const rows = cols[1].splitToEvenRows(9);
  rows.forEach((r, i) => {
    const cs = r.splitToCols(37);
    cs.forEach((col) => c.frame(col));
    c.addMark(`血液検査名${i + 1}`, cs[0]);
    c.addMark(`血液検査結果${i + 1}`, cs[1]);
  });
  compileKennyou(
    c,
    Box.combineRows(
      rows
        .slice(0, 3)
        .map((r) =>
          r.flipRight().setWidth(cols[2].width, HorizDirection.Left)
        )
    )
  );
  compileTokkijikou(
    c,
    Box.combineRows(
      rows
        .slice(3)
        .map((r) =>
          r.flipRight().setWidth(cols[2].width, HorizDirection.Left)
        )
    )
  );
}

function compileKennyou(c: DrawerCompiler, box: Box): void {
  c.frame(box);
  const cols = box.splitToCols(7);
  c.frame(cols[0]);
  c.vertText(cols[0], "検尿", { interCharsSpace: 4 });
  const rows = cols[1].splitToEvenRows(3);
  rows.forEach((r) => c.frame(r));
  c.text(rows[0], ["蛋白（", c.space(11, { mark: "尿蛋白" }), "）"], Centered);
  c.text(rows[1], ["潜血（", c.space(11, { mark: "尿潜血" }), "）"], Centered);
  c.text(rows[2], ["糖　（", c.space(11, { mark: "尿糖" }), "）"], Centered);
}

function compileTokkijikou(c: DrawerCompiler, box: Box): void {
  c.text(box.inset(1, 1, 0, 0), "その他特記事項", {
    halign: HorizAlign.Left,
    valign: VertAlign.Top
  });
  c.addMark("その他特記事項", box.shiftTopValue(6));
}

function compileBottom(c: DrawerCompiler, box: Box): void {
  c.frame(box);
  c.text(box.inset(4, 4), "診断の結果上記の通り相違ないことを証明する。", {
    halign: HorizAlign.Left,
    valign: VertAlign.Top
  });
  const issueDate: Box = box.shift(16, 12)
    .setWidth(46, HorizDirection.Left)
    .setHeight(6, VertDirection.Top);
  c.addMark("発行日", issueDate);
  const addr1: Box = box.shift(72, 12)
    .setWidth(72, HorizDirection.Left)
    .setHeight(6, VertDirection.Top);
  const addr2: Box = addr1.flipBottom().shift(0, 1);
  c.addMark("住所1", addr1);
  c.addMark("住所2", addr2);
  const clinicName: Box = addr2.flipBottom().shift(0, 2)
    .setHeight(7.5, VertDirection.Top);
  c.addMark("クリニック名", clinicName);
  const doctorName: Box = clinicName.flipBottom()
    .shift(0, 3)
    .setLeft(36)
    .setHeight(6, VertDirection.Top);
  c.text(doctorName, ["診断医師氏名", c.space(43, { mark: "医師名", height: doctorName.height }), "印"]);
}

export function createJihiKenshinCompiler(): DrawerCompiler {
  const comp = new DrawerCompiler();
  const paper: Box = Box.fromPaperSize(A4);
  comp.createFont("title", "sans-serif", 7, FontWeightBold);
  comp.createFont("regular", "serif", 4);
  comp.createFont("large", "serif", 5.5);
  comp.createFont("entry", "sans-serif", 4);
  comp.createFont("small-entry", "sans-serif", 3);
  comp.createFont("large-entry", "sans-serif", 5.5);
  comp.createPen("regular", 0, 0, 0, 0.1);
  comp.setPen("regular");
  const frame = paper.inset(16, 42, 26, 42);
  comp.setFont("title");
  comp.textAt(frame.cx, frame.top - 7, "健康診断書", {
    halign: HorizAlign.Center,
    valign: VertAlign.Bottom,
    interCharsSpace: 1,
  });
  comp.setFont("regular");
  comp.frame(frame);
  const rows = frame.splitToRows(...Array(9).fill(9), 9 * 9);
  compileShimei(comp, rows[0]);
  compileJuusho(comp, rows[1]);
  compileShincho(
    comp,
    rows[2].setWidth(firstColWidth + secondColWidth, HorizDirection.Left)
  );
  compileTaijuu(
    comp,
    rows[3].setWidth(firstColWidth + secondColWidth, HorizDirection.Left)
  );
  compileShinsatsu(
    comp,
    rows[4].setWidth(firstColWidth + secondColWidth, HorizDirection.Left)
  );
  compileShiryoku(
    comp,
    rows[5].setWidth(firstColWidth + secondColWidth, HorizDirection.Left)
  );
  compileChouryoku(
    comp,
    rows[6].setWidth(firstColWidth + secondColWidth, HorizDirection.Left)
  );
  compileKetsuatsu(
    comp,
    rows[7].setWidth(firstColWidth + secondColWidth, HorizDirection.Left)
  );
  compileShindenzu(
    comp,
    rows[8].setWidth(firstColWidth + secondColWidth, HorizDirection.Left)
  );
  compileKioureki(
    comp,
    Box.combineRows(
      rows
        .slice(2, 4)
        .map((row) => row.inset(firstColWidth + secondColWidth, 0, 0, 0))
    )
  );
  compileXp(
    comp,
    Box.combineRows(
      rows
        .slice(4, 9)
        .map((row) => row.inset(firstColWidth + secondColWidth, 0, 0, 0))
    )
  );
  compileKensa(comp, rows[9]);
  compileBottom(comp, rows[10]);
  return comp;
}
