export interface DrugAmountLine {
  kind: "drug-amount";
  drug: string;
  amount: string;
  unit: string;
  tail?: string;
}

export interface RegularLine {
  kind: "regular";
  str: string;
}

export interface DaysLine {
  kind: "days";
  str: string;
  days: string;
  unit: string;
  extra: string;
}

export type ParsedLine = DrugAmountLine | RegularLine | DaysLine;

const tmplUnit = "錠|カプセル|ｇ|ｍｇ|包|ｍＬ|ブリスター|瓶|個|キット|枚|パック|袋|本";
const reFirstLine = new RegExp(`^\\s*(.*)\\s+([０-９．]+)(${tmplUnit})(（.+）)?\\s*$`);

export function parseFirstLine(line: string): DrugAmountLine | RegularLine {
  const m = line.match(reFirstLine);
  if (m) {
    return { kind: "drug-amount", drug: m[1], amount: m[2], unit: m[3], tail: m[4] };
  } else {
    return { kind: "regular", str: line };
  }
}

const reDays = /(.*\S)\s+([０-９]+)(日分|回分)(（.+）)?\s*$/;

export function parseNonFirstLine(line: string): RegularLine | DaysLine {
  const m = line.match(reDays);
  if (m) {
    // const str = m[1];
    // const days = m[2];
    // const unit = m[3];
    // const extra = m[4];
    return {
      kind: "days",
      str: m[1],
      days: m[2],
      unit: m[3],
      extra: m[4] ?? "",
    };
  } else {
    return { kind: "regular", str: line };
  }
}