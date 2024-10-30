const zenkakuZero = "０";
const zenkakuLower_a = "ａ";
const zenkakuUpper_a = "Ａ";

function range(start: number, end: number): number[] {
  return [...Array(end - start)].map((_, i) => start + i);
}

function charCodeOf(s: string): number {
  return s.charCodeAt(0);
}

function charMap(
  alphaStart: string,
  alphaLast: string,
  zenkakuStart: string
): Record<string, string> {
  const alphaCode = charCodeOf(alphaStart);
  const zenkakuCode = charCodeOf(zenkakuStart);
  const r: Record<string, string> = {};
  range(0, charCodeOf(alphaLast) - alphaCode + 1).forEach((i) => {
    const key = String.fromCharCode(alphaCode + i);
    const val = String.fromCharCode(zenkakuCode + i);
    r[key] = val;
  });
  return r;
}

const digitMap: Record<string, string> = charMap("0", "9", zenkakuZero);
const lowerMap: Record<string, string> = charMap("a", "z", zenkakuLower_a);
const upperMap: Record<string, string> = charMap("A", "Z", zenkakuUpper_a);
const customMap: Record<string, string> = {
  ".": "．",
  " ": "　",
  "-": "ー",
  "(": "（",
  ")": "）",
  ",": "、",
  "%": "％",
  "@": "＠",
  ":": "：",
  ";": "；",
};

function extendRecords(...rs: Record<string, string>[]): Record<string, string> {
  const r: Record<string, string> = {};
  for (let a of rs) {
    Object.assign(r, a);
  }
  return r;
}

const zenkakuMap: Record<string, string> = extendRecords(digitMap, lowerMap, upperMap, customMap);
const hankakuMap: Record<string, string> = reverseMap(zenkakuMap);

function reverseMap(map: Record<string, string>): Record<string, string> {
  const r: Record<string, string> = {};
  for(const key in map){
    let value = map[key];
    r[value] = key;
  }
  return r;
}

function mapWith(
  map: Record<string, string>,
  src: string,
  except: string[] = []): string {
  return src.split("").map(c => {
    if (except.indexOf(c) >= 0) {
      return c;
    } else {
      const z = map[c];
      return z || c;
    }
  }).join("");
}

export function toZenkaku(src: string, except: string[] = []): string {
  return mapWith(zenkakuMap, src, except);
}

export function toHankaku(src: string, except: string[] = []): string {
  return mapWith(hankakuMap, src, except);
}
