import type { DrawerContext } from "../../compiler/context";
import type { ReceiptDrawerData } from "./receipt-drawer-data";
import * as c from "../../compiler/compiler";
import * as b from "../../compiler/box";
import type { Box } from "../../compiler/box";
import { stringDrawWidth } from "../../compiler/char-width";
import * as kanjidate from "kanjidate";

export function drawData(ctx: DrawerContext, data: ReceiptDrawerData) {
  renderPatient(ctx, data.patientName ?? "", c.getMark(ctx, "nameBox").box);
  renderKingaku(ctx, data.charge ?? 0, c.getMark(ctx, "kingakuBox").box);
  renderVisitDate(ctx, data.visitDate ?? "", c.getMark(ctx, "dateBox").box);
  renderIssueDate(ctx, data.issueDate ?? "", c.getMark(ctx, "issueBox").box);
  renderDetail(ctx, data.patientId ?? "", c.getMark(ctx, "patientIdBox").box);
  renderDetail(ctx, data.hoken ?? "", c.getMark(ctx, "hokenBox").box);
  renderDetail(ctx, formatFutanWari(data.futanWari ?? ""), c.getMark(ctx, "futanWariBox").box);
  renderDetail(ctx, data.shoshin ?? "", c.getMark(ctx, "shoshinBox").box);
  renderDetail(ctx, data.kanri ?? "", c.getMark(ctx, "kanriBox").box);
  renderDetail(ctx, data.zaitaku ?? "", c.getMark(ctx, "zaitakuBox").box);
  renderDetail(ctx, data.kensa ?? "", c.getMark(ctx, "kensaBox").box);
  renderDetail(ctx, data.gazou ?? "", c.getMark(ctx, "gazouBox").box);
  renderDetail(ctx, data.touyaku ?? "", c.getMark(ctx, "touyakuBox").box);
  renderDetail(ctx, data.chuusha ?? "", c.getMark(ctx, "chuushaBox").box);
  renderDetail(ctx, data.shochi ?? "", c.getMark(ctx, "shochiBox").box);
  renderDetail(ctx, data.sonota ?? "", c.getMark(ctx, "sonotaBox").box);
  renderDetail(ctx, data.souten ?? "", c.getMark(ctx, "soutenBox").box);
  renderHokengai(ctx, data.hokengai ?? [], [1,2,3,4].map(i => c.getMark(ctx, `hokengai${i}Box`).box));
  renderInstitute(ctx, data.clinicName ?? "", data.addressLines ?? [], c.getMark(ctx, "instituteBox").box);
}

function formatFutanWari(futanWari: string) {
  if( futanWari ){
    futanWari = futanWari.replace(/割$/, "");
    futanWari = futanWari + "割";
  }
  return futanWari
}

function renderPatient(ctx: DrawerContext, name: string, box: Box) {
  const font = "mincho-6"
  c.setFont(ctx, font);
  let fontSize = c.currentFontSize(ctx);
  if (stringDrawWidth(name, fontSize) <= b.width(box)) {
    c.drawText(ctx, name, box, "center", "bottom");
  } else {
    c.setFont(ctx, "mincho-4");
    c.paragraph(ctx, name, box, { valign: "bottom" });
    c.setFont(ctx, font);
  }
}

function renderKingaku(ctx: DrawerContext, kingaku: number, box: Box) {
  if (kingaku > 0) {
    c.setFont(ctx, "gothic-5");
    const s = kingaku.toLocaleString();
    c.drawText(ctx, s, box, "right", "bottom");
  }
}

function renderDate(ctx: DrawerContext, date: string, box: Box) {
  const m = date.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if( m ){
    // const year = m[1];
    // const month = m[2].replace(/^0/, "");
    // const day = m[3].replace(/^0/, "");
    // const s = `${year}年${month}月${day}日`;
    const d = new Date(date);
    const s = kanjidate.format(kanjidate.f2, d);
    c.setFont(ctx, "mincho-4");
    c.drawText(ctx, s, box, "left", "center");
  } else {
    c.setFont(ctx, "mincho-4");
    c.drawText(ctx, date, box, "left", "center");
  }
}

function renderVisitDate(ctx: DrawerContext, date: string, box: Box) {
  renderDate(ctx, date, box);
}

function renderIssueDate(ctx: DrawerContext, date: string, box: Box) {
  renderDate(ctx, date, box);
}

function renderDetail(ctx: DrawerContext, text: string, box: Box) {
  c.setFont(ctx, "mincho-4");
  c.drawText(ctx, text, box, "center", "center");
}

function renderHokengai(ctx: DrawerContext, hokengai: string[], boxes: Box[] ){
  c.setFont(ctx, "mincho-4");
  for(let i=0;i<hokengai.length;i++){
    const str = hokengai[i];
    if( i < boxes.length ){
      const box = b.modify(boxes[i], b.shrinkHoriz(1, 0));
      if( str.length < 12 ){
        c.drawText(ctx, str, box, "left", "center");
      } else {
        c.setFont(ctx, "mincho-2.6");
        c.drawText(ctx, str, box, "left", "center");
        c.setFont(ctx, "mincho-4");
      }
    }
  }
}

function renderInstitute(ctx: DrawerContext, name: string, addressLines: string[], box: Box) {
  const rows = b.splitToRows(box, b.splitAt(5));
  c.setFont(ctx, "gothic-4");
  c.drawText(ctx, name, rows[0], "left", "top");
  c.setFont(ctx, "gothic-2.6");
  c.drawTexts(ctx, addressLines, rows[1], { leading: 1 });
}