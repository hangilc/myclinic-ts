import type { ParsedLine } from "./parsed-line";

export class RenderDrugContext {
  maxLine: number = 31;
  amountUnitTabStop: number = 21;
}

export function renderDrug(drug: ParsedLine[], ctx: RenderDrugContext = new RenderDrugContext()): string[] {
  const lines: string[] = [];
  const maxLine = ctx.maxLine;
  const tab = ctx.amountUnitTabStop;
  drug.forEach(line => {
    switch(line.kind) {
      case "drug-amount": {
        lines.push(...renderDrugAmount(line.drug, line.amount, line.unit, maxLine, tab));
        break;
      }
      case "days": {
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

function renderDrugAmount(drug: string, amount: string, unit: string, maxLine: number, tab: number): string[] {
  const rem = tab - drug.length - amount.length;
  if( rem > 0 && unit.length <= (maxLine - tab) ){

  } else {
    
  }
}

function breakToLines(str: string, lineSize: number): string[] {
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