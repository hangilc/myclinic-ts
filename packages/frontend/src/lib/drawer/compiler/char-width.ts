function isHankaku(code: number): boolean {
  return (code >= 0xff61 && code <= 0xff64) ||
          (code >= 0xff65 && code <= 0xff9f) ||
          (code >= 0xffa0 && code <= 0xffdc) ||
          (code >= 0xffe8 && code <= 0xffee);
}

export function charWidth(code: number, fontSize: number): number {
  return ( code < 256 || isHankaku(code) ) ? fontSize/2 : fontSize;
}

export function stringToCharcodes(str: string): number[] {
  return Array.from(str).map(c => c.charCodeAt(0));
}

export function stringToCharWidths(str: string, fontSize: number): number[] {
  return stringToCharcodes(str).map(code => charWidth(code, fontSize));
}

export function stringDrawWidth(str: string, fontSize: number): number {
  return stringToCharWidths(str, fontSize).reduce((acc, ele) => acc + ele, 0);
}
