import type { ParsedLine } from "./parsed-line";

export function renderDrug(drug: ParsedLine[], maxLine: number): string[] {
  const lines: string[] = [];
  drug.forEach(line => {
    switch(line.kind) {
      case "first": {
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