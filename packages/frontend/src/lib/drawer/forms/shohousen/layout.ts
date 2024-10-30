import type { Box } from "../../compiler/box";
import * as b from "../../compiler/box";
import { A5, type PaperSize } from "../../compiler/paper-size";

export interface Layout {
  wrap: Box;
  title: Box;
  kouhiHoken: Box;
  main: Box;
  pharma: Box;
}

export function mkLayout(): Layout {
  const wrap = b.modify(b.paperSizeToBox(A5), b.inset(3));
  let [title, kouhiHoken, , main, , pharma] = b.splitToRows(wrap, b.splitWidths(
    13, 10.5, 2, 154.5, 1, 24.5));
  return { wrap, title, kouhiHoken, main, pharma };
}

export function mkDenshiLayout(): Layout {
  const wrap = b.modify(b.paperSizeToBox(A5), b.inset(3));
  let [title, kouhiHoken, , main, , pharma] = b.splitToRows(wrap, b.splitWidths(
    13 + 10, 10.5, 2, 154.5 - 10, 1, 24.5));
  return { wrap, title, kouhiHoken, main, pharma };
}

export interface MainLayout {
  patientClinic: Box;
  issue: Box;
  drugs: Box;
  memo: Box;
  chouzai1: Box;
  chouzai2: Box;
}

export function mkMainLayout(box: Box): MainLayout {
  const [patientClinic, issue, rest] = 
    b.splitToRows(box, b.splitAt(18, 24.5));
  const [rest2, chouzai1, chouzai2] =
    b.splitToRows(rest, b.splitWidthsFromEnd(6.5, 5.0));
  const [drugs, memo] = b.splitToRows(rest2, b.splitAt(b.height(rest2) * 0.713));
  return { patientClinic, issue, drugs, memo, chouzai1, chouzai2 };
}


function mkMainLayoutOrig(box: Box): MainLayout {
  const [patientClinic, issue, drugs, memo, chouzai1, chouzai2] =
    b.splitToRows(box, b.splitAt(18, 24.5, 109, 143, 149.5));
  console.log("height", b.height(box));
  console.log("patientClinic", b.height(patientClinic));
  console.log("issue", b.height(issue));
  console.log("drugs", b.height(drugs));
  console.log("memo", b.height(memo));
  console.log("chouzai1", b.height(chouzai1));
  console.log("chouzai2", b.height(chouzai2));
  // 0.713

  return { patientClinic, issue, drugs, memo, chouzai1, chouzai2 };
}

