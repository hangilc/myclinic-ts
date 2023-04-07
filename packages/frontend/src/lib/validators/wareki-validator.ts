import {
  convert,
  ensure,
  isInInclusiveRange,
  // isInInclusiveRange,
  isInt,
  isPositive,
  validated2,
  validated3,
  type VResult,
} from "../validation";
import * as kanjidate from "kanjidate";

export interface WarekiInput {
  gengou: VResult<string>;
  nen: VResult<number>;
  month: VResult<number>;
  day: VResult<number>;
}

const gengouList = kanjidate.GengouList.map((g) => g.kanji);

const isValidGengouKanji = ensure<string>(
  (g) => gengouList.includes(g),
  "入力が元号名でありません"
);

const gengouToYear = convert<[string, number], number>(
  ([gen, nen], resolve, reject) => {
    try {
      const year = kanjidate.fromGengou(gen, nen);
      return resolve(year);
    } catch (_ex) {
      return reject("元号・年を西暦に変換できません");
    }
  }
);

export function validateWareki(input: WarekiInput): VResult<Date> {
  const gengou = input.gengou
    .validate(isValidGengouKanji)
    .mark("元号");
  const nen = input.nen
    .validate(isInt)
    .validate(isPositive)
    .mark("年");
  const year = validated2(gengou, nen).validate(gengouToYear).mark("");
  const month = input.month
    .validate(isInt)
    .validate(isInInclusiveRange(1, 12))
    .mark("月");
  const day = input.day
    .validate(isInt)
    .validate(isInInclusiveRange(1, 31))
    .mark("日");
  return validated3(year, month, day)
    .map(([y, m, d]) => new Date(y, m-1, d));
}
