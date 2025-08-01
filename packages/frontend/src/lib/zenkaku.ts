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

export const digitMap: Record<string, string> = charMap("0", "9", zenkakuZero);
export const lowerMap: Record<string, string> = charMap("a", "z", zenkakuLower_a);
export const upperMap: Record<string, string> = charMap("A", "Z", zenkakuUpper_a);
export const customMap: Record<string, string> = {
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

export const spaceMap: Record<string, string> = { " ": "　" };

function extendRecords(...rs: Record<string, string>[]): Record<string, string> {
  const r: Record<string, string> = {};
  for(let a of rs){
    Object.assign(r, a);
  }
  return r;
}

export const zenkakuMap: Record<string, string> = extendRecords(digitMap, lowerMap, upperMap, customMap);

export function toZenkaku(src: string, except: string[] = []): string {
  return toZenkakuWith(zenkakuMap, src, except);
}

export function toZenkakuWith(
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

function convertWith(map: Record<string, string>, src: string): string {
  return src
    .split("")
    .map((s) => {
      const d = map[s];
      if (d === undefined) {
        return s;
      } else {
        return d;
      }
    })
    .join("");
}

function reverseMap(map: Record<string, string>): Record<string, string> {
  const r: Record<string, string> = {};
  for(let k in map){
    const v = map[k];
    r[v] = k;
  }
  return r;
}

export function fromZenkakuWith(
  alphaToZenkakuMap: Record<string, string>,
  src: string
): string {
  return convertWith(reverseMap(alphaToZenkakuMap), src);
}

const reverseZenkakuMap = Object.assign(reverseMap(zenkakuMap), {
  "－": "-",
});

export function toHankaku(src: string): string {
  return convertWith(reverseZenkakuMap, src.normalize("NFKC"));
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
  "ｯ": "ッ",
  "ｬ": "ャ",
  "ｭ": "ュ",
  "ｮ": "ョ",
}

const zenkakuKatakanaToHankakuKatakanaMap: Record<string, string> = reverseMap(kanaHankakuZenkakuMap);

const katakanaHiraganaZenkakuMap: Record<string, string> = {
  "ア": "あ",
  "イ": "い",
  "ウ": "う",
  "エ": "え",
  "オ": "お",
  "カ": "か",
  "キ": "き",
  "ク": "く",
  "ケ": "け",
  "コ": "こ",
  "サ": "さ",
  "シ": "し",
  "ス": "す",
  "セ": "せ",
  "ソ": "そ",
  "タ": "た",
  "チ": "ち",
  "ツ": "つ",
  "テ": "て",
  "ト": "と",
  "ナ": "な",
  "ニ": "に",
  "ヌ": "ぬ",
  "ネ": "ね",
  "ノ": "の",
  "ハ": "は",
  "ヒ": "ひ",
  "フ": "ふ",
  "ヘ": "へ",
  "ホ": "ほ",
  "マ": "ま",
  "ミ": "み",
  "ム": "む",
  "メ": "め",
  "モ": "も",
  "ヤ": "や",
  "ユ": "ゆ",
  "ヨ": "よ",
  "ラ": "ら",
  "リ": "り",
  "ル": "る",
  "レ": "れ",
  "ロ": "ろ",
  "ワ": "わ",
  "ヲ": "を",
  "ン": "ん",
  "ガ": "が",
  "ギ": "ぎ",
  "グ": "ぐ",
  "ゲ": "げ",
  "ゴ": "ご",
  "ザ": "ざ",
  "ジ": "じ",
  "ズ": "ず",
  "ゼ": "ぜ",
  "ゾ": "ぞ",
  "ダ": "だ",
  "ヂ": "ぢ",
  "ヅ": "づ",
  "デ": "で",
  "ド": "ど",
  "バ": "ば",
  "ビ": "び",
  "ブ": "ぶ",
  "ベ": "べ",
  "ボ": "ぼ",
  "パ": "ぱ",
  "ピ": "ぴ",
  "プ": "ぷ",
  "ペ": "ぺ",
  "ポ": "ぽ",
  "ッ": "っ",
  "ャ": "ゃ",
  "ュ": "ゅ",
  "ョ": "ょ",
}

export const hiraganaKatakanaZenkakuMap = reverseMap(katakanaHiraganaZenkakuMap);

export function hankakuKatakanaToZenkakuKatakana(h: string): string {
  const z = kanaHankakuZenkakuMap[h];
  if (z != undefined) {
    return z;
  } else {
    return h;
  }
}

export function zenkakuKatakanaToZenkakuHiragana(k: string): string {
  const h = katakanaHiraganaZenkakuMap[k];
  if (h != undefined) {
    return h;
  } else {
    return k;
  }
}

export function hankakuKatakanaToZenkakuHiragana(k: string): string {
  const a = hankakuKatakanaToZenkakuKatakana(k);
  return zenkakuKatakanaToZenkakuHiragana(a);
}

export function zenkakuHiraganaToHankakuKatakana(c: string): string {
  const p = hiraganaKatakanaZenkakuMap[c] ?? c;
  const q = zenkakuKatakanaToHankakuKatakanaMap[p] ?? p;
  const r = reverseZenkakuMap[q] ?? q;
  return r;
}

export function convertHankakuKatakanaToZenkakuHiragana(s: string): string {
  return s.normalize("NFKC").split("").map(hankakuKatakanaToZenkakuHiragana).join("");
}

export function convertZenkakuHiraganaToHankakuKatakana(s: string): string {
  return s.normalize("NFKC").split("").map(zenkakuHiraganaToHankakuKatakana).join("");
}

export function convertToHankakuIfDigits(s: string): string {
  if( /^\s*[0-9０-９]+\s*$/.test(s) ){
    return toHankaku(s);
  } else {
    return s;
  }
}