export class CutText {
  constructor(public text: string) {}
}

export class CutMatch<T> {
  constructor(public match: T) {}
}

export function cut<T>(
  s: string,
  re: RegExp,
  handler: (t: string) => T
): (CutText | CutMatch<T>)[] {
  let flags = re.flags.replace("g", "") + "g";
  re = new RegExp(re, flags);
  const ms = s.matchAll(re);
  const result: (CutText | CutMatch<T>)[] = [];
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
    result.push(new CutMatch(handler(ms)));
    i = end;
  }
  result.push(new CutText(s.substring(i, s.length)));
  return result;
}
