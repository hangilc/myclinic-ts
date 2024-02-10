import type { ParsedLine } from "./parsed-line";

export class RenderDrugContext {
  maxLine: number = 31;
  amountUnitTabStop: number = 21;
  daysTabStop: number = 19;
}

export function renderDrug(drug: ParsedLine[], ctx: RenderDrugContext = new RenderDrugContext()): string[] {
  const lines: string[] = [];
  const maxLine = ctx.maxLine;
  const amountTab = ctx.amountUnitTabStop;
  const daysTab = ctx.daysTabStop;
  drug.forEach(line => {
    switch(line.kind) {
      case "drug-amount": {
        lines.push(...renderDrugAmount(line.drug, line.amount, line.unit, maxLine, amountTab));
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

export function renderDrugAmount(drug: string, amount: string, unit: string, maxLine: number, tab: number): string[] {
  drug = drug.trim();
  const rem = tab - drug.length - amount.length;
  if( rem > 0 && unit.length <= (maxLine - tab) ){
    const pad = "　".repeat(rem);
    return [`${drug}${pad}${amount}${unit}`];
  } else {
    return breakToLines(`${drug}　${amount}${unit}`, maxLine);
  }
}

export function renderDays(str: string, days: string, unit: string, maxLine: number, tab: number): string[] {
  str = str.trim();
  const rem = tab - str.length - days.length;
  if( rem > 0 && unit.length <= (maxLine - tab) ){
    const pad = "　".repeat(rem);
    return [`${str}${pad}${days}${unit}`];
  } else {
    return breakToLines(`${str}　${days}${unit}`, maxLine);
  }
}

export function breakToLines(str: string, lineSize: number): string[] {
  const lines: string[] = [];
  while( str !== "" ){
    str = str.trimStart();
    if( str.length <= lineSize ){
      lines.push(str);
      break;
    } else {
      lines.push(str.substring(0, lineSize));
      str = str.substring(lineSize);
    }
  }
  return lines;
}