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

const kanaHankakuZenkakuMap: Record<string, string> = {
  "ｱ": "ア",
  "ｲ": "イ",
  "ｳ": "ウ",
  "ｴ": "エ",
  "ｵ": "オ",
  "ｶ": "カ",
  "ｷ": "キ",
  "ｸ": "ク",
  "ｹ": "ケ",
  "ｺ": "コ",
  "ｻ": "サ",
  "ｼ": "シ",
  "ｽ": "ス",
  "ｾ": "セ",
  "ｿ": "ソ",
  "ﾀ": "タ",
  "ﾁ": "チ",
  "ﾂ": "ツ",
  "ﾃ": "テ",
  "ﾄ": "ト",
  "ﾅ": "ナ",
  "ﾆ": "ニ",
  "ﾇ": "ヌ",
  "ﾈ": "ネ",
  "ﾉ": "ノ",
  "ﾊ": "ハ",
  "ﾋ": "ヒ",
  "ﾌ": "フ",
  "ﾍ": "ヘ",
  "ﾎ": "ホ",
  "ﾏ": "マ",
  "ﾐ": "ミ",
  "ﾑ": "ム",
  "ﾒ": "メ",
  "ﾓ": "モ",
  "ﾔ": "ヤ",
  "ﾕ": "ユ",
  "ﾖ": "ヨ",
  "ﾗ": "ラ",
  "ﾘ": "リ",
  "ﾙ": "ル",
  "ﾚ": "レ",
  "ﾛ": "ロ",
  "ﾜ": "ワ",
  "ｦ": "ヲ",
  "ﾝ": "ン",
  "ｶﾞ": "ガ",
  "ｷﾞ": "ギ",
  "ｸﾞ": "グ",
  "ｹﾞ": "ゲ",
  "ｺﾞ": "ゴ",
  "ｻﾞ": "ザ",
  "ｼﾞ": "ジ",
  "ｽﾞ": "ズ",
  "ｾﾞ": "ゼ",
  "ｿﾞ": "ゾ",
  "ﾀﾞ": "ダ",
  "ﾁﾞ": "ヂ",
  "ﾂﾞ": "ヅ",
  "ﾃﾞ": "デ",
  "ﾄﾞ": "ド",
  "ﾊﾞ": "バ",
  "ﾋﾞ": "ビ",
  "ﾌﾞ": "ブ",
  "ﾍﾞ": "ベ",
  "ﾎﾞ": "ボ",
  "ﾊﾟ": "パ",
  "ﾋﾟ": "ピ",
  "ﾌﾟ": "プ",
  "ﾍﾟ": "ペ",
  "ﾎﾟ": "ポ",
}

const zenkakuKatakanaList = Object.values(kanaHankakuZenkakuMap);

export function hankakuKatakanaToZenkakuKatakana(h: string): string {
  const z = kanaHankakuZenkakuMap[h];
  if( z != undefined ) {
    return z;
  } else {
    return h;
  }
}

export function zenkakuKatakanaToZenkakuHiragana(k: string): string {
  if( zenkakuKatakanaList.includes(k) ) {
    return String.fromCodePoint(k.codePointAt(0)! - 96);
  } else {
    return k;
  }
}

export function hankakuKatakanaToZenkakuHiragana(k: string): string {
  return zenkakuKatakanaToZenkakuHiragana(hankakuKatakanaToZenkakuKatakana(k));
}

export function convertHankakuKatakanaToZenkakuHiraKana(s: string): string {
  return s.split("").map(hankakuKatakanaToZenkakuHiragana).join("");
}
