import { charWidth } from "./char-width";

export function breakLines(str: string, fontSize: number, lineWidth: number): string[] {
  const lines: string[] = [];
  let line: string[] = [];
  let curWidth: number = 0;
  Array.from(str).forEach(ch => {
    const code = ch.charCodeAt(0);
    const cw = charWidth(code, fontSize);
    if( line.length === 0 ){
      line.push(ch);
      curWidth += cw;
    } else {
      if( curWidth + cw > lineWidth ){
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
