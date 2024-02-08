interface FirstLine {
  kind: "first";
  drug: string;
  amountPart?: {
    amount: string;
    unit: string;
  }
}

interface RegularLine {
  kind: "regular";
  str: string;
}

interface DaysLine {
  kind: "days";
  days: string;
  unit: string;
  extra?: string;
}

export type ParsedLine = FirstLine | RegularLine | DaysLine;

const tmplUnit = "錠|カプセル|ｇ|ｍｇ|包|ｍＬ|ブリスター|瓶|個|キット|枚|パック|袋|本";
const reFirstLine = new RegExp(`^\\s*(.*)\\s+([０-９．]+)(${tmplUnit})\\s*$`);

export function parseFirstLine(line: string): FirstLine {
  const m = line.match(reFirstLine);
  if( m ){
    return { kind: "first", drug: m[1], amountPart: { amount: m[2], unit: m[3]}}
  } else {
    return { kind: "first", drug: line };
  }
}

const reDays = /.*([０-９]+)(日分|回分)(（.+）)?\s*$/;

export function parseNonFirstLine(line: string): RegularLine | DaysLine {
  const m = line.match(reDays);
  if( m ){
    const days = m[1];
    const unit = m[2];
    const extra = m[3];
  }
}