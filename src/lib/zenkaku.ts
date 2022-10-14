export const zenkakuSpace = "　";
export const zenkakuZero = "０";
export const zenkakuLower_a = "ａ"
export const zenkakuUpper_a = "Ａ"
export const zenkakuPeriod = "．";

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
  ): Map<string, string> {
  const alphaCode = charCodeOf(alphaStart);
  const zenkakuCode = charCodeOf(zenkakuStart);
  return new Map(range(0, charCodeOf(alphaLast) - alphaCode + 1).map(i => [
    String.fromCharCode(alphaCode + i),
    String.fromCharCode(zenkakuCode + i)
  ]))
}

export const digitMap: Map<string, string> = charMap("0", "9", zenkakuZero);
export const lowerMap: Map<string, string> = charMap("a", "z", zenkakuLower_a);
export const upperMap: Map<string, string> = charMap("A", "Z", zenkakuUpper_a);
export const customMap: Map<string, string> = new Map([
  ['.', '．'],
  [' ', '　'],
  ['-', 'ー'],
  ['(', '（'],
  [')', '）'],
  [',', '、'],
  ['%', '％'],
  ['@', '＠'],
  [':', '：'],
  [';', '；'],
]);

export const zenkakuMap: Map<string, string> = 
  new Map([...digitMap.entries(), ...lowerMap.entries(), ...upperMap.entries(),
    ...customMap.entries()]);

export function toZenkaku(src: string, except: string[] = []): string {
  return toZenkakuWith(zenkakuMap, src, except);
}

export function toZenkakuWith(
    map: Map<string, string>, 
    src: string, 
    except: string[] = []): string {
      return src.split("").map(c => {
        if( except.indexOf(c) >= 0 ){
          return c;
        } else {
          const z = map.get(c);
          return z || c;
        }
      }).join("");
}


