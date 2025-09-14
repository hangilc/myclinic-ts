import type { Op } from "../../compiler/op";
import * as c from "../../compiler/compiler";
import * as b from "../../compiler/box";
import type { Box } from "../../compiler/box";
import * as r from "./row-renderer";
import { A4 } from "../../compiler/paper-size";
import { mkDrawerContext, type DrawerContext } from "../../compiler/context";
import { circleMark } from "./decorators";

// {
//   let [upper, lower] = b.splitToRows(b.modify(keyBox, b.shrinkVert(0.5, 0.5)), b.evenSplitter(2));
//   c.drawTextJustified(ctx, "筋麻痺", b.modify(upper, b.shrinkHoriz(1.5, 1.5)), "center");
//   c.drawTextJustified(ctx, "筋委縮", b.modify(lower, b.shrinkHoriz(1.5, 1.5)), "center");
// }
// r.renderRow(ctx, b.modify(bodyBox, b.shrinkHoriz(7, 18)),
//   r.t("躯幹"), r.gap(), r.t("・"), r.gap(),
//   r.t("右上肢"), r.gap(), r.t("・"), r.gap(),
//   r.t("左上肢"), r.gap(), r.t("・"), r.gap(),
//   r.t("右下肢"), r.gap(), r.t("・"), r.gap(),
//   r.t("左下肢"));

export interface SymptomWeakness {
  "躯幹"?: boolean;
  "右上肢"?: boolean;
  "左上肢"?: boolean;
  "右下肢"?: boolean;
  "左下肢"?: boolean;
};


export interface RyouyouhiDouishoDrawerData {
  "patient-address": string;
  "patient-name": string;
  "birth-date": string;
  "condition-name": string;
  "onset-date": string;
  "consent-type": "初回の同意" | "再同意";
  "examination-date": string;
  "symptom-weakness": SymptomWeakness;
  "issue-date": string;
  "clinic-name": string;
  "clinic-address": string;
  "doctor-name": string;
}

export function mkRyouyouhiDouishoDrawerData(): RyouyouhiDouishoDrawerData {
  return {
    "patient-address": "",
    "patient-name": "",
    "birth-date": "",
    "condition-name": "",
    "onset-date": "",
    "consent-type": "初回の同意",
    "symptom-weakness": { "躯幹": true },
    "examination-date": "",
    "issue-date": "",
    "clinic-name": "",
    "clinic-address": "",
    "doctor-name": "",
  };
}

const leftColumnWidth = 26.5;

export function ryouyouhiDouishoDrawerContext(): DrawerContext {
  const ctx = mkDrawerContext(initContext);
  c.setPen(ctx, "regular");
  c.setFont(ctx, "regular");
  return ctx;
}

export function drawRyouyouhiDouisho(data: RyouyouhiDouishoDrawerData): Op[] {
  const ctx = ryouyouhiDouishoDrawerContext();
  const paper = b.paperSizeToBox(A4);
  const wrappingBox = b.modify(paper, b.shift(17, 28), b.setWidth(178, "left"), b.setHeight(238, "top"));
  const [titleBox, patientBox, byoumeiBox, hatubyouDateBox, douiKubunBox,
    shinsatubiBox, shoujouBox, sejutuBox, ouryouBox, chuuiBox, bottomBox
  ] = b.splitToRows(wrappingBox, b.splitWidths(9.5, 19, 11, 8, 8, 8, 40, 17, 40, 20));

  c.rect(ctx, wrappingBox);
  c.frameBottom(ctx, titleBox);
  c.frameBottom(ctx, patientBox);
  c.frameBottom(ctx, byoumeiBox);
  c.frameBottom(ctx, hatubyouDateBox);
  c.frameBottom(ctx, douiKubunBox);
  c.frameBottom(ctx, shinsatubiBox);
  c.frameBottom(ctx, shoujouBox);
  c.frameBottom(ctx, sejutuBox);
  c.frameBottom(ctx, ouryouBox);
  c.frameBottom(ctx, chuuiBox);

  drawTitle(ctx, titleBox, data);
  drawPatient(ctx, patientBox, data);
  drawByoumei(ctx, byoumeiBox, data);
  drawHatubyouDate(ctx, hatubyouDateBox, data);
  drawDouiKubun(ctx, douiKubunBox, data);
  drawShinsatuDate(ctx, shinsatubiBox, data);
  drawShoujou(ctx, shoujouBox, data);
  drawSejutu(ctx, sejutuBox, data);
  drawOuryou(ctx, ouryouBox, data);
  drawChuui(ctx, chuuiBox, data);
  drawBottom(ctx, bottomBox, data);
  return c.getOps(ctx);
}

function initContext(ctx: DrawerContext) {
  c.createFont(ctx, "title", "MS Mincho", 7);
  c.createFont(ctx, "regular", "MS Mincho", 4);
  c.createFont(ctx, "large", "MS Mincho", 5.7);
  c.createFont(ctx, "small", "MS Mincho", 3.5);
  c.createPen(ctx, "regular", 0, 0, 0, 0.1);
  c.createPen(ctx, "data-thin", 0, 0, 0, 0.2);
}

function drawTitle(ctx: DrawerContext, box: Box, data: RyouyouhiDouishoDrawerData) {
  c.withFont(ctx, "title", () => {
    c.drawText(ctx, "同意書", b.modify(box),
      "center", "top", { interCharsSpace: 13 })
  });
  c.withFont(ctx, "small", () => {
    c.drawText(ctx, "(あん摩マッサージ指圧療養費用)", b.modify(box, b.shrinkHoriz(123, 0), b.shrinkVert(3.5, 0)),
      "left", "top");
  })
}

function drawPatient(ctx: DrawerContext, box: Box, data: RyouyouhiDouishoDrawerData) {
  let [left, right] = b.splitToColumns(box, b.splitAt(leftColumnWidth));
  c.frameRight(ctx, left);
  c.drawTextJustified(ctx, "患者", b.modify(left, b.shrinkHoriz(3, 3)), "center");
  let rows = b.splitToRows(right, b.evenSplitter(3));
  let middleWidth = 37;
  let keyMargin = 7;
  {
    let row = rows[0];
    c.frameBottom(ctx, row);
    let [keyBox, bodyBox] = b.splitToColumns(row, b.splitAt(middleWidth));
    c.frameRight(ctx, keyBox);
    c.drawTextJustified(ctx, "住所", b.modify(keyBox, b.shrinkHoriz(keyMargin, keyMargin)), "center");
    c.drawText(ctx, data["patient-address"], b.modify(bodyBox, b.shrinkHoriz(2, 2)), "left", "center");
  }
  {
    let row = rows[1];
    c.frameBottom(ctx, row);
    let [keyBox, bodyBox] = b.splitToColumns(row, b.splitAt(middleWidth));
    c.frameRight(ctx, keyBox);
    c.drawTextJustified(ctx, "氏名", b.modify(keyBox, b.shrinkHoriz(keyMargin, keyMargin)), "center");
    c.drawText(ctx, data["patient-name"], b.modify(bodyBox, b.shrinkHoriz(2, 2)), "left", "center");
  }
  {
    let row = rows[2];
    c.frameBottom(ctx, row);
    let [keyBox, bodyBox] = b.splitToColumns(row, b.splitAt(middleWidth));
    c.frameRight(ctx, keyBox);
    c.drawTextJustified(ctx, "生年月日", b.modify(keyBox, b.shrinkHoriz(keyMargin, keyMargin)), "center");
    c.drawText(ctx, data["birth-date"], b.modify(bodyBox, b.shrinkHoriz(2, 2)), "left", "center");
  }
}

function drawByoumei(ctx: DrawerContext, box: Box, data: RyouyouhiDouishoDrawerData) {
  let [left, right] = b.splitToColumns(box, b.splitAt(leftColumnWidth));
  c.frameRight(ctx, left);
  c.drawTextJustified(ctx, "傷病名", b.modify(left, b.shrinkHoriz(3, 3)), "center");
  c.drawText(ctx, data["condition-name"], b.modify(right, b.shrinkHoriz(2, 2)), "left", "center");
}

function drawHatubyouDate(ctx: DrawerContext, box: Box, data: RyouyouhiDouishoDrawerData) {
  let [left, right] = b.splitToColumns(box, b.splitAt(leftColumnWidth));
  c.frameRight(ctx, left);
  c.drawText(ctx, "発病年月日", left, "center", "center");
  c.drawText(ctx, data["onset-date"], b.modify(right, b.shrinkHoriz(2, 2)), "left", "center");
}

function drawDouiKubun(ctx: DrawerContext, box: Box, data: RyouyouhiDouishoDrawerData) {
  let [left, right] = b.splitToColumns(box, b.splitAt(leftColumnWidth));
  c.frameRight(ctx, left);
  c.drawText(ctx, "同意区分", left, "center", "center");
  // c.drawText(ctx, data["consent-type"], b.modify(right, b.shrinkHoriz(2, 2)), "left", "center");
  right = b.modify(right, b.shrinkHoriz(2, 2));
  const consentType = data["consent-type"];
  r.renderRow(ctx, right,
    r.t("初回の同意", circleMark(consentType === "初回の同意")),
    r.t("・"),
    r.t("再 同 意", circleMark(consentType === "再同意")));
}

function drawShinsatuDate(ctx: DrawerContext, box: Box, data: RyouyouhiDouishoDrawerData) {
  let [left, right] = b.splitToColumns(box, b.splitAt(leftColumnWidth));
  c.frameRight(ctx, left);
  c.drawTextJustified(ctx, "診察日", b.modify(left, b.shrinkHoriz(3, 3)), "center");
  c.drawText(ctx, data["examination-date"], b.modify(right, b.shrinkHoriz(2, 2)), "left", "center");
}

function drawShoujou(ctx: DrawerContext, box: Box, data: RyouyouhiDouishoDrawerData) {
  let [left, right] = b.splitToColumns(box, b.splitAt(leftColumnWidth));
  c.frameRight(ctx, left);
  c.drawTextJustified(ctx, "症状", b.modify(left, b.shrinkHoriz(3, 3)), "center");
  let rows = b.splitToRows(right, b.splitWidths(10.5, 16));
  c.frameBottom(ctx, rows[0]);
  c.frameBottom(ctx, rows[1]);
  let middleWidth = 20;
  {
    let row = rows[0];
    let [keyBox, bodyBox] = b.splitToColumns(row, b.splitAt(middleWidth));
    c.frameRight(ctx, keyBox);
    {
      let [upper, lower] = b.splitToRows(b.modify(keyBox, b.shrinkVert(0.5, 0.5)), b.evenSplitter(2));
      c.drawTextJustified(ctx, "筋麻痺", b.modify(upper, b.shrinkHoriz(1.5, 1.5)), "center");
      c.drawTextJustified(ctx, "筋委縮", b.modify(lower, b.shrinkHoriz(1.5, 1.5)), "center");
    }
    r.renderRow(ctx, b.modify(bodyBox, b.shrinkHoriz(7, 18)),
      r.t("躯幹", circleMark(data["symptom-weakness"]["躯幹"] ?? false)), r.gap(), r.t("・"), r.gap(),
      r.t("右上肢", circleMark(data["symptom-weakness"]["右上肢"] ?? false)), r.gap(), r.t("・"), r.gap(),
      r.t("左上肢", circleMark(data["symptom-weakness"]["左上肢"] ?? false)), r.gap(), r.t("・"), r.gap(),
      r.t("右下肢", circleMark(data["symptom-weakness"]["右下肢"] ?? false)), r.gap(), r.t("・"), r.gap(),
      r.t("左下肢", circleMark(data["symptom-weakness"]["左下肢"] ?? false)));
  }
  {
    let row = rows[1];
    let [keyBox, bodyBox] = b.splitToColumns(row, b.splitAt(middleWidth));
    c.frameRight(ctx, keyBox);
    c.drawText(ctx, "関節拘縮", keyBox, "center", "center");
    let [upper, lower] = b.splitToRows(b.modify(bodyBox, b.shrinkVert(1.5, 1.5), b.shrinkHoriz(7, 0)), b.evenSplitter(2));
    r.renderRow(ctx, upper,
      r.t("右肩"), r.t("・"),
      r.t("右肘"), r.t("・"),
      r.t("右手首"), r.t("・"),
      r.t("右股関節"), r.t("・"),
      r.t("右膝"), r.t("・"),
      r.t("右足首"), r.t("　　"),
      r.t("その他"));
    r.renderRow(ctx, lower,
      r.t("左肩"), r.t("・"),
      r.t("左肘"), r.t("・"),
      r.t("左手首"), r.t("・"),
      r.t("左股関節"), r.t("・"),
      r.t("左膝"), r.t("・"),
      r.t("左足首"), r.t("　"),
      r.t("（　　　　　　）"));
  }
  {
    let row = rows[2];
    let [keyBox, bodyBox] = b.splitToColumns(row, b.splitAt(middleWidth));
    c.frameRight(ctx, keyBox);
    c.drawTextJustified(ctx, "その他", b.modify(keyBox, b.shrinkHoriz(1.5, 1.5)), "center");
  }
}

function drawSejutu(ctx: DrawerContext, box: Box, data: RyouyouhiDouishoDrawerData) {
  let [left, right] = b.splitToColumns(box, b.splitAt(leftColumnWidth));
  c.frameRight(ctx, left);
  {
    let dbox = b.modify(left, b.setHeight(10, "center"), b.shrinkHoriz(3, 3));
    c.drawText(ctx, "施術の種類", dbox, "center", "top");
    c.drawText(ctx, "施術部位", dbox, "center", "bottom");
  }
  {
    let [upper, lower] = b.splitToRows(b.modify(right, b.shrinkHoriz(1, 1)), b.evenSplitter(2));
    c.frameBottom(ctx, upper);
    r.renderRow(ctx, upper, r.t("マッサージ"), r.t("　　（　"),
      r.t("躯幹"), r.t("　"),
      r.t("右上肢"), r.t("　"),
      r.t("左上肢"), r.t("　"),
      r.t("右下肢"), r.t("　"),
      r.t("左下肢"), r.t("　）"),
    );
    r.renderRow(ctx, lower, r.t("変形徒手矯正術"), r.t("（　　"),
      r.t("右上肢"), r.t("　"),
      r.t("左上肢"), r.t("　"),
      r.t("右下肢"), r.t("　"),
      r.t("左下肢"), r.t("　　）"),
    )
  }
}

function drawOuryou(ctx: DrawerContext, box: Box, data: RyouyouhiDouishoDrawerData) {
  let [left, right] = b.splitToColumns(box, b.splitAt(leftColumnWidth));
  c.frameRight(ctx, left);
  c.drawTextJustified(ctx, "往療", b.modify(left, b.shrinkHoriz(3, 3)), "center");
  let [upper, lower] = b.splitToRows(right, b.splitAt(8));
  c.frameBottom(ctx, upper);
  {
    r.renderRow(ctx, b.modify(upper, b.shrinkHoriz(3.5, 0)),
      r.t("１"), r.t("．必要とする　　"),
      r.t("２"), r.t("．必要としない"))
  }
  {
    let rows = b.splitToRows(lower, b.evenSplitter(5));
    {
      let row = rows[0];
      r.renderRow(ctx, b.modify(row, b.shrinkHoriz(1, 30)),
        r.t("往療を必要とする理由　　介護保険の要介護度　（"),
        r.gap(),
        r.t("）"));
    }
    {
      let row = rows[1];
      r.renderRow(ctx, b.modify(row, b.shrinkHoriz(3.5, 0)),
        r.t("１"), r.t("．独歩による公共交通機関を使っての外出が困難"),
      )
    }
    {
      let row = rows[2];
      r.renderRow(ctx, b.modify(row, b.shrinkHoriz(3.5, 0)),
        r.t("２"), r.t("．認知症や視覚、内部、精神障害などにより単独での外出が困難"),
      )
    }
    {
      let row = rows[3];
      r.renderRow(ctx, b.modify(row, b.shrinkHoriz(3.5, 0)),
        r.t("３"), r.t("．その他"),
      )
    }
    {
      let row = rows[4];
      r.renderRow(ctx, b.modify(row, b.shrinkHoriz(7, 7)), r.t("（"), r.gap(), r.t("）"));
    }
  }
}

function drawChuui(ctx: DrawerContext, box: Box, data: RyouyouhiDouishoDrawerData) {
  let [left, right] = b.splitToColumns(box, b.splitAt(leftColumnWidth));
  c.frameRight(ctx, left);
  c.drawText(ctx, "注意事項等", left, "center", "center");
}

function drawBottom(ctx: DrawerContext, box: Box, data: RyouyouhiDouishoDrawerData) {
  c.withFont(ctx, "large", () => {
    let fontSize = c.currentFontSize(ctx);
    c.drawText(ctx, "上記の者については、頭書の疾病により療養のための医療上の",
      b.modify(box, b.shift(11, 3.5)), "left", "top");
    c.drawText(ctx, "マッサージが必要と認め、マッサージの施術に同意する。",
      b.modify(box, b.shift(11 - fontSize, 10)), "left", "top");
  });
  let dbox = b.modify(box, b.shrinkHoriz(13, 10), b.shrinkVert(17, 0));
  let rows = b.splitToRows(dbox, b.evenSplitter(4));
  c.withFont(ctx, "small", () => {
    let issueDateParts = data["issue-date"].replace(/[年月日]/g, " ").trim().split(/\s+/);
    if (issueDateParts.length >= 3 && issueDateParts[0].startsWith("令和")) {
      let year = issueDateParts[0].replace("令和", "");
      let month = issueDateParts[1];
      let day = issueDateParts[2];
      r.renderRow(ctx, rows[0], r.t("令"), r.fixed(8), r.t("和"),
        r.fixed(12), r.t(year + "年"),
        r.fixed(12), r.t(month + "月"),
        r.fixed(12), r.t(day + "日"),
      );
    } else {
      c.drawText(ctx, data["issue-date"], rows[0], "left", "center");
    }
    {
      let [keyBox, bodyBox] = b.splitToColumns(rows[1], b.splitAt(38));
      c.drawTextJustified(ctx, "保険医療機関名", keyBox, "center");
      c.drawText(ctx, data["clinic-name"], bodyBox, "left", "center");
    }
    {
      let [keyBox, bodyBox] = b.splitToColumns(rows[2], b.splitAt(38));
      c.drawTextJustified(ctx, "所在地", keyBox, "center");
      c.drawText(ctx, data["clinic-address"], bodyBox, "left", "center");
    }
    {
      let [keyBox, bodyBox] = b.splitToColumns(rows[3], b.splitAt(38));
      c.drawTextJustified(ctx, "保険医氏名", keyBox, "center");
      c.drawText(ctx, data["doctor-name"], b.modify(bodyBox, b.shrinkHoriz(0, 10)), "left", "center");
      c.drawText(ctx, "印", b.modify(bodyBox, b.setWidth(4, "right")), "center", "center");
    }
  })
}

