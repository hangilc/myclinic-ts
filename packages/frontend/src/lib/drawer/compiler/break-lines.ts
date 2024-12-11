import { charWidth } from "./char-width";

// returns length of nextr line
export function breakNextLine(start: number, str: string, fontSize: number, lineWidth: number): number {
  let w = 0;
  for (let i = start; i < str.length; i++) {
    const code = str.charCodeAt(i);
    const cw = charWidth(code, fontSize);
    if (cw + w > lineWidth) {
      return i;
    }
    w += cw;
  }
  return str.length;
}

export function breakLines(str: string, fontSize: number, lineWidth: number): string[] {
  const lines: string[] = [];
  let line: string[] = [];
  let curWidth: number = 0;
  Array.from(str).forEach(ch => {
    const code = ch.charCodeAt(0);
    const cw = charWidth(code, fontSize);
    if (line.length === 0) {
      line.push(ch);
      curWidth += cw;
    } else {
      if (curWidth + cw > lineWidth) {
        lines.push(line.join(""));
        line = [ch];
        curWidth = cw;
      } else {
        line.push(ch);
        curWidth += cw;
      }
    }
  });
  lines.push(line.join(""));
  return lines;
}

// breakParagraph -- splits str by newline then applies breakLines
export function breakParagraph(str: string, fontSize: number, lineWidth: number): string[] {
  return str.split(/\r?\n/).flatMap(line => breakLines(line, fontSize, lineWidth));
}

// returns end of extracted line
export function breakSingleLine(str: string, start: number, fontSize: number, lineWidth: number): number {
  let w = 0;
  let i = 0;
  for (i = start; i < str.length; i++) {
    const ch = str.charAt(i);
    if (ch === "\n") {
      i += 1;
      break;
    }
    const code = ch.charCodeAt(0);
    const cw = charWidth(code, fontSize);
    if (w + cw > lineWidth && i !== start) {
      return i - 1;
    }
    w += cw;
  }
  return i;
}

export function breakMultipleLines(str: string, fontSize: number, lineWidth: number): string[] {
  const lines: string[] = [];
  let start = 0;
  let iter = 0;
  while (start < str.length) {
    let end = breakSingleLine(str, start, fontSize, lineWidth);
    if( end === start ){
      break;
    } else {
      lines.push(str.substring(start, end));
      start = end;
    }
    if( ++iter >= 600 ){
      throw new Error("too many iteration (breakMultipleLines)");
    }
  }
  return lines;
}
