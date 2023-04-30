const encodeMap: Record<string, string> = {
  "＋": "+",
  "±": "+/-",
  "－": "-",
  "２": "2",
  "３": "3",
  "４": "4",
}

const decodeMap: Record<string, string> = {
  "+": "＋",
  "-": "－",
}

export function encodeUrineResult(result: string): string {
  return Array.from(result).map(c => {
    const e = encodeMap[c];
    if( e ){
      return e; 
    } else {
      return c;
    }
  }).join("");
}

export function decodeUrineResult(code: string): string {
  return Array.from(code).map(c => {
    const e = decodeMap[c];
    if( e ){
      return e; 
    } else {
      return c;
    }
  }).join("");
}

export function normalizeUrineResult(src: string): string {
  return decodeUrineResult(encodeUrineResult(src));
}
