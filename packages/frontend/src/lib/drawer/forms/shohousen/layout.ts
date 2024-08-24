import type { Box } from "../../compiler/box";
import * as b from "../../compiler/box";
import { A5, type PaperSize } from "../../compiler/paper-size";

export interface Layout {
  wrap: Box;
  title: Box;
  denshiTitle: Box;
  kouhiHoken: Box;
  main: Box;
  pharma: Box;
}

export function mkLayout(): Layout {
  const wrap = b.modify(b.paperSizeToBox(A5), b.inset(3));
  let [title, kouhiHoken, , main, , pharma] = b.splitToRows(wrap, b.splitWidths(
    13, 10.5, 2, 154.5, 1, 24.5));
  let denshiTitle = b.modify(title, b.shrinkVert(0, 2), b.setLeft(wrap.left), b.setRight(wrap.right));
  return { wrap, title, denshiTitle, kouhiHoken, main, pharma };
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
  const [patientClinic, issue, drugs, memo, chouzai1, chouzai2 ] = b.splitToRows(box, b.splitAt(18, 24.5, 109, 143, 149.5))

  return { patientClinic, issue, drugs, memo, chouzai1, chouzai2 };
}

