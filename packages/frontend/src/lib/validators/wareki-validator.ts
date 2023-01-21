import {
  convert,
  ensure,
  isInInclusiveRange,
  isInt,
  isNotEmpty,
  isNotNull,
  isPositive,
  toInt,
  valid,
  validated2,
  validated3,
  type VError,
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

export function validateWareki(input: WarekiInput): Date | VError[] {
  const gengou = input.gengou
    .validate(isValidGengouKanji)
    .mark("gengou");
  const nen = input.nen
    .validate(isInt)
    .validate(isPositive)
    .mark("nen");
  const year = validated2(gengou, nen).validate(gengouToYear).mark("year");
  const month = input.month
    .validate(isInt)
    .validate(isInInclusiveRange(1, 12))
    .mark("month");
  const day = input.day
    .validate(isInt)
    .validate(isInInclusiveRange(1, 31))
    .mark("month");
  const vs = validated3(year, month, day);
  if (vs.isValid) {
    const [y, m, d] = vs.value;
    return new Date(y, m - 1, d);
  } else {
    return vs.errors;
  }
}
