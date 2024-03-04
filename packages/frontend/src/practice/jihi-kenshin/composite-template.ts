import type { CompositeItem } from "@/lib/drawer/compiler/compiler";

let startSeq = "[[";
let endSeq = "]]";

export function hasCompTmpl(s: string): boolean {
  return s.indexOf(startSeq) >= 0;
}

export function parseCompTmpl(s: string, f: (key: string) => CompositeItem[]): CompositeItem[] {
  const items: CompositeItem[] = [];
  let pos = 0;
  let iter = 0;

  while (true) {
    if (++iter > 30) {
      throw new Error("Too many interations (parseCompTmpl).");
    }
    const i = s.indexOf(startSeq, pos);
    if (i < 0) {
      if (pos < s.length) {
        items.push({
          kind: "text",
          text: s.substring(pos, s.length)
        })
      }
      break;
    } else {
      items.push({
        kind: "text",
        text: s.substring(pos, i)
      });
      const j = s.indexOf(endSeq, i);
      if (j < 0) {
        throw new Error(`Cannot find closing sequence (${endSeq}).`)
      }
      const key = s.substring(i + startSeq.length, j);
      items.push(...f(key));
      pos = j + endSeq.length;

    }
  }
  return items;
}

