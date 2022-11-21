export class CutText {
  constructor(
    public text: string
  ) {}
}

export class CutMatch {
  constructor(
    public match: string
  ) {}
}

export function cut(s: string, re: RegExp): (CutText | CutMatch)[] {
  let flags = re.flags.replace("g", "") + "g";
  re = new RegExp(re, flags);
  const ms = s.matchAll(re);
  const result: (CutText | CutMatch)[] = [];
  let i = 0;
  for (const m of ms) {
    const start = m.index;
    if( start === undefined ){
      continue;
    }
    const ts = s.substring(i, start);
    result.push(new CutText(ts));
    const end = start + m[0].length
    const ms = s.substring(start, end);
    result.push(new CutMatch(ms));
    i = end;
  }
  result.push(new CutText(s.substring(i, s.length)));
  return result;
}
