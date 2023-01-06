export const zenkakuSpace = "　";
export const zenkakuZero = "０";
export const zenkakuLower_a = "ａ";
export const zenkakuUpper_a = "Ａ";
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
  return new Map(
    range(0, charCodeOf(alphaLast) - alphaCode + 1).map((i) => [
      String.fromCharCode(alphaCode + i),
      String.fromCharCode(zenkakuCode + i),
    ])
  );
}

export const digitMap: Map<string, string> = charMap("0", "9", zenkakuZero);
export const lowerMap: Map<string, string> = charMap("a", "z", zenkakuLower_a);
export const upperMap: Map<string, string> = charMap("A", "Z", zenkakuUpper_a);
export const customMap: Map<string, string> = new Map([
  [".", "．"],
  [" ", "　"],
  ["-", "ー"],
  ["(", "（"],
  [")", "）"],
  [",", "、"],
  ["%", "％"],
  ["@", "＠"],
  [":", "："],
  [";", "；"],
]);

export const spaceMap: Map<string, string> = new Map([[" ", "　"]]);

export const zenkakuMap: Map<string, string> = new Map([
  ...digitMap.entries(),
  ...lowerMap.entries(),
  ...upperMap.entries(),
  ...customMap.entries(),
]);

export function toZenkaku(src: string, except: string[] = []): string {
  return toZenkakuWith(zenkakuMap, src, except);
}

// export function toZenkakuWith(
//   map: Map<string, string>,
//   src: string,
//   except: string[] = []
// ): string {
//   let m = map;
//   if (except.length > 0) {
//     m = new Map();
//     for (let e of map.entries()) {
//       if( !except.includes(e[0]) ){
//         m.set(...e);
//       }
//     }
//   }
//   return convertWith(m, src);
// }

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

function convertWith(map: Map<string, string>, src: string): string {
  return src
    .split("")
    .map((s) => {
      const d = map.get(s);
      if (d === undefined) {
        return s;
      } else {
        return d;
      }
    })
    .join("");
}

function reverseMap(map: Map<string, string>): Map<string, string> {
  const r = new Map<string, string>();
  for (let e of map.entries()) {
    r.set(e[1], e[0]);
  }
  return r;
}

export function fromZenkakuWith(
  alphaToZenkakuMap: Map<string, string>,
  src: string
): string {
  return convertWith(reverseMap(alphaToZenkakuMap), src);
}
