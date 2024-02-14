import { mkDrawerContext, type DrawerContext } from "../../compiler/context";
import type { Op } from "../../compiler/op";
import type { ReceiptDrawerData } from "../../receipt-drawer-data";
import * as c from "../../compiler/compiler";
import * as b from "../../compiler/box";
import type { Box } from "../../compiler/box";
import { A6 } from "../../compiler/paper-size";
import { mkLayout } from "./layout";

export function drawReceipt(data: ReceiptDrawerData): Op[] {
  const ctx = mkDrawerContext();
  setupFonts(ctx);
  c.createPen(ctx, "regular", 0, 0, 0, 0.1);
  c.setPen(ctx, "regular");
  const layout = mkLayout();
  drawTitle(ctx, layout.title);
  drawName(ctx, layout.name);
  drawCharge(ctx, layout.charge);
  drawDate(ctx, layout.date);
  drawIssue(ctx, layout.issue);
  drawRow3(ctx, layout.row3);
  drawRow4(ctx, layout.row4);
  drawRow5(ctx, layout.row5);
  drawHokengai(ctx, layout.hokengai);
  drawInstitute(ctx, layout.institute);
  drawRyoushuu(ctx, layout.ryoushuu);
  return c.getOps(ctx, { scale: 1, offsetX: 0, offsetY: 0 });
}

function setupFonts(ctx: DrawerContext) {
  c.createFont(ctx, "mincho-6", "MS Mincho", 6);
  c.createFont(ctx, "mincho-4", "MS Mincho", 4);
  c.createFont(ctx, "gothic-5", "MS Gothic", 5);
  c.createFont(ctx, "gothic-4", "MS Gothic", 4);
  c.createFont(ctx, "gothic-2.6", "MS Gothic", 2.6);
  c.createFont(ctx, "name-smaller-font", "MS Mincho", 4.2);
  c.createFont(ctx, "name-multiline-font", "MS Mincho", 3);
}

function drawTitle(ctx: DrawerContext, box: Box) {
  c.setFont(ctx, "mincho-6");
  c.drawTextJustified(ctx, "領収証", box, "top");
}

function drawName(ctx: DrawerContext, box: Box) {
  c.setFont(ctx, "mincho-6");
  c.frameBottom(ctx, box);
  c.drawText(ctx, "様", box, "right", "bottom");
  c.mark(ctx, "nameBox", b.modify(box, b.shrinkHoriz(0, 8)));
}

function drawCharge(ctx: DrawerContext, box: Box) {
  c.drawText(ctx, "領収金額", box, "left", "bottom");
  c.drawText(ctx, "円", box, "right", "bottom");
  c.frameBottom(ctx, box);
  c.mark(ctx, "kingakuBox", b.modify(box, b.shrinkHoriz(24, 6.9)));
}

function drawDate(ctx: DrawerContext, box: Box) {
  c.setFont(ctx, "mincho-4");
  c.drawText(ctx, "診察日", box, "left", "center");
  c.mark(ctx, "dateBox", b.modify(box, b.shrinkHoriz(16, 0)));
}

function drawIssue(ctx: DrawerContext, box: Box) {
  c.setFont(ctx, "mincho-4");
  c.drawText(ctx, "発効日", box, "left", "center");
  c.mark(ctx, "issueBox", b.modify(box, b.shrinkHoriz(16, 0)));
}

function drawRow3(ctx: DrawerContext, box: Box) {
  c.setFont(ctx, "mincho-4");
  c.withGrid(ctx, box, 2, 3, cells => {
    c.drawText(ctx, "患者番号", cells[0][0], "center", "center");
    c.drawText(ctx, "保険種別", cells[0][1], "center", "center");
    c.drawText(ctx, "負担割合", cells[0][2], "center", "center");
    c.mark(ctx, "patientIdBox", cells[1][0]);
    c.mark(ctx, "hokenBox", cells[1][1]);
    c.mark(ctx, "futanWariBox", cells[1][2]);
  });
}

function drawRow4(ctx: DrawerContext, box: Box) {
  c.setFont(ctx, "mincho-4");
  c.withGrid(ctx, box, 2, 5, cells => {
    c.drawText(ctx, "初・再診料", cells[0][0], "center", "center");
    c.drawText(ctx, "医学管理等", cells[0][1], "center", "center");
    c.drawText(ctx, "在宅医療", cells[0][2], "center", "center");
    c.drawText(ctx, "検査", cells[0][3], "center", "center");
    c.drawText(ctx, "画像診断", cells[0][4], "center", "center");
    c.mark(ctx, "shoshinBox", cells[1][0]);
    c.mark(ctx, "kanriBox", cells[1][1]);
    c.mark(ctx, "zaitakuBox", cells[1][2]);
    c.mark(ctx, "kensaBox", cells[1][3]);
    c.mark(ctx, "gazouBox", cells[1][4]);
  });
}

function drawRow5(ctx: DrawerContext, box: Box) {
  c.setFont(ctx, "mincho-4");
  c.withGrid(ctx, box, 2, 5, cells => {
    c.drawText(ctx, "投薬", cells[0][0], "center", "center");
    c.drawText(ctx, "注射", cells[0][1], "center", "center");
    c.drawText(ctx, "処置", cells[0][2], "center", "center");
    c.drawText(ctx, "その他", cells[0][3], "center", "center");
    c.drawText(ctx, "診療総点数", cells[0][4], "center", "center");
    c.mark(ctx, "touyakuBox", cells[1][0]);
    c.mark(ctx, "chuushaBox", cells[1][1]);
    c.mark(ctx, "shochiBox", cells[1][2]);
    c.mark(ctx, "sonotaBox", cells[1][3]);
    c.mark(ctx, "soutenBox", cells[1][4]);
  });
}

function drawHokengai(ctx: DrawerContext, box: Box) {
  c.setFont(ctx, "mincho-4");
  c.withGrid(ctx, box, 5, 1, cells => {
    c.drawText(ctx, "保険外", cells[0][0], "center", "center");
    for(let i=1;i<5;i++){
      c.mark(ctx, `hokengai${i}Box`, cells[i][0]);
    }
  })
}

function drawInstitute(ctx: DrawerContext, box: Box) {
  c.mark(ctx, "instituteBox", box);
}

function drawRyoushuu(ctx: DrawerContext, box: Box) {
  c.rect(ctx, box);
  const h = b.height(box) / 5.0;
  const rows = b.splitToRows(box, b.splitAt(h));
  c.frameBottom(ctx, rows[0]);
  c.setFont(ctx, "mincho-4");
  c.drawText(ctx, "領収印", rows[0], "center", "center");
  c.mark(ctx, "ryoushuuBox", rows[1]);
}


