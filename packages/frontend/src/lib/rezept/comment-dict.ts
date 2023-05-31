import { pad } from "@/lib/pad";
import { toZenkaku } from "@/lib/zenkaku";
import * as kanjidate from "kanjidate";

export const CommentDict = {
  "850100090": "交付年月日（療養費同意書交付料）",
  "830100083": "同意書又は診断書に記載した病名（療養費同意書交付料）；",
}

// コメントパターン 50 （年月日情報）
// 令和５年４月２９日は、５０５０４２９（全部全角）とコメント分に記載する。

export const CommentWareki: Record<string, number> = {
  "明治": 1,
  "大正": 2,
  "昭和": 3,
  "平成": 4,
  "令和": 5,
}

export function dateToCommentDate(date: string | Date): string {
  if( typeof date === "string" ){
    date = new Date(date.substring(0, 10));
  }
  const wareki = kanjidate.toGengou(date.getFullYear(), date.getMonth() + 1, date.getDate());
  const gengou = wareki.gengou;
  const gengouCode = CommentWareki[gengou];
  if( !gengouCode ){
    throw new Error("Invalid gengou: " + date);
  }
  const nen = pad(wareki.nen, 2, "0");
  const mon = pad(date.getMonth() + 1, 2, "0");
  const day = pad(date.getDate(), 2, "0");
  return toZenkaku(`${gengouCode}${nen}${mon}${day}`);
}