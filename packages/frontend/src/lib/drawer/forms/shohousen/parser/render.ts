import type { ParsedLine } from "./parsed-line";

export class RenderDrugContext {
  maxLine: number = 30;
  amountUnitTab: number = 21;
  daysTab: number = 18;

  constructor(arg: { maxLine?: number, amountUnitTab?: number, daysTab?: number } = {}) {
    if (arg.maxLine !== undefined) {
      this.maxLine = arg.maxLine;
    }
    if (arg.amountUnitTab !== undefined) {
      this.amountUnitTab = arg.amountUnitTab;
    }
    if (arg.daysTab !== undefined) {
      this.daysTab = arg.daysTab;
    }
  }
}

export function renderDrug(drug: ParsedLine[], ctx: RenderDrugContext = new RenderDrugContext()): string[] {
  const lines: string[] = [];
  const indexLen = drug.length < 10 ? 2 : 3;
  const maxLine = ctx.maxLine - indexLen;
  const amountTab = ctx.amountUnitTab;
  const daysTab = ctx.daysTab;
  drug.forEach(line => {
    switch (line.kind) {
      case "drug-amount": {
        lines.push(...renderDrugAmount(line.drug, line.amount, line.unit, line.tail, maxLine, amountTab));
        break;
      }
      case "days": {
        lines.push(...renderDays(line.str, line.days, line.unit, maxLine, daysTab));
        break;
      }
      default: {
        lines.push(...breakToLines(line.str, maxLine));
        break;
      }
    }
  });
  return lines;
}

function renderWithTab(
  pre: string, amount: string, unit: string, tail: string | undefined, maxLine: number, tab: number
): string[] {
  let tail_str = tail ?? "";
  const lines: string[] = [];
  pre = pre.trim();
  if( tail_str.length > maxLine - tab ){
    return breakToLines(`${pre}　${amount}${unit}${tail_str}`, maxLine);
  }
  let iter = 1;
  while (true) {
    if (iter++ > 5) {
      throw new Error(`Too long pre: ${pre} (in renderWithTab).`);
    }
    const rem = tab - pre.length - amount.length;
    if (rem > 0) {
      const pad = "　".repeat(rem);
      lines.push(`${pre}${pad}${amount}${unit}${tail_str}`);
      break;
    } else {
      lines.push(pre.substring(0, maxLine));
      pre = pre.substring(maxLine);
    }
  }
  return lines;
}

export function renderDrugAmount(
  drug: string, amount: string, unit: string, tail: string | undefined, maxLine: number, tab: number
): string[] {
  return renderWithTab(drug, amount, unit, tail, maxLine, tab);
}

export function renderDays(str: string, days: string, unit: string, maxLine: number, tab: number): string[] {
  return renderWithTab(str, days, unit, undefined, maxLine, tab);
}

export function breakToLines(str: string, lineSize: number): string[] {
  const lines: string[] = [];
  while (str !== "") {
    str = str.trimStart();
    if (str.length <= lineSize) {
      lines.push(str);
      break;
    } else {
      lines.push(str.substring(0, lineSize));
      str = str.substring(lineSize);
    }
  }
  return lines;
}