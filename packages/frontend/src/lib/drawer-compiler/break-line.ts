import { charWidth } from "./char-width";

export function breakLine(s: string, fontSize: number, lineWidth: number): string[] {
  const lines: string[] = [];
  let chars: string[] = [];
  let charsWidth: number = 0;

  function flush(): void {
    lines.push(chars.join(""));
    chars = [];
    charsWidth = 0;
  }

  for(let c of s) {
    if( ["、", ",", " ", "　", "。", "."].includes(c) ){
      chars.push(c);
      charsWidth += charWidth(c, fontSize);
      continue;
    }
    if( chars.length === 0 ){
      chars.push(c);
      charsWidth = charWidth(c, fontSize);
      if( charsWidth > lineWidth ){
        flush();
      }
    } else {
      const cw = charWidth(c, fontSize);
      if( charsWidth + cw > lineWidth ){
        flush();
      }
      chars.push(c);
      charsWidth += cw;
    }
  }
  if( chars.length > 0 ){
    flush();
  }
  return lines;
}

