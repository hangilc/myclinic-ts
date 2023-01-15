export class CutText {
  constructor(public text: string) {}
}

export function cut<T>(
  s: string,
  re: RegExp,
  handler: (m: string) => CutText | T
): (CutText | T)[] {
  let flags = re.flags.replace("g", "") + "g";
  re = new RegExp(re, flags);
  const ms = s.matchAll(re);
  const result: (CutText | T)[] = [];
  let i = 0;
  for (const m of ms) {
    const start = m.index;
    if (start === undefined) {
      continue;
    }
    const ts = s.substring(i, start);
    result.push(new CutText(ts));
    const end = start + m[0].length;
    const ms = s.substring(start, end);
    result.push(handler(ms));
    i = end;
  }
  result.push(new CutText(s.substring(i, s.length)));
  return result;
}

export function cutMulti(
  s: string,
  handlers: { re: RegExp; kind: string }[]
): { kind: string; text: string }[] {
  const re = new RegExp(
    handlers
      .map((h) => `(?<cut_multi_${h.kind}>` + h.re.source + ")")
      .join("|"),
    "g"
  );
  const result: { kind: string; text: string }[] = [];
  const matches = s.matchAll(re);
  let start = 0;
  if (matches != null) {
    for (let m of matches) {
      const gs = m.groups || {};
      for (let g in gs) {
        const t = gs[g];
        if (typeof t === "string" && g.startsWith("cut_multi_")) {
          const index = m.index;
          if (index != undefined) {
            if (index > start) {
              result.push({ kind: "", text: s.substring(start, index)})
            }
            const kind = g.substring(10);
            result.push({ kind, text: t});
            start = index + t.length;
          }
        }
      }
    }
  }
  if( start < s.length ){
    result.push({ kind: "", text: s.substring(start)})
  }
  return result;
}
