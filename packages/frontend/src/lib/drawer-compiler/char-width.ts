export function charWidth(codePoint: number | string, fontSize: number): number {
  if( typeof codePoint === "string" ){
    codePoint = codePoint.codePointAt(0)!;
  }
  if( codePoint <= 255 || isHankaku(codePoint) ) {
    return fontSize / 2;
  } else {
    return fontSize;
  }
}

function isHankaku(code: number): boolean {
  return (code >= 0xff61 && code <= 0xff64) ||
    (code >= 0xff65 && code <= 0xff9f) ||
    (code >= 0xffa0 && code <= 0xffdc) ||
    (code >= 0xffe8 && code <= 0xffee);
}
