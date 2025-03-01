import { toHankaku } from "./zenkaku";

export interface Shohou {
  groups: DrugGroup[];
  shohouComments: string[];
  bikou: string[];
  kigen?: string;
}

export type Usage = ({
  kind: "days"; days: string;
} | {
  kind: "times"; times: string;
} | {
  kind: "other";
}) & { usage: string }

export type Senpatsu = "henkoufuka" | "kanjakibou";

export interface Drug {
  name: string,
  amount: string,
  unit: string,
  senpatsu?: Senpatsu,
  drugComments: string[],
}

export interface DrugGroup {
  drugs: Drug[],
  usage: Usage,
  groupComments: string[],
}

export function parseShohouOrig(text: string, debug: boolean = false): Shohou {
  const shohou: Shohou = {
    groups: [],
    shohouComments: [],
    bikou: [],
  };
  const comhandlers: Record<string, { f: (value: string) => void, needValue: boolean }> = {
    "memo": {
      needValue: true,
      f: (value) => shohou.bikou.push(value),
    },
    "有効期限": {
      needValue: true,
      f: (value) => shohou.kigen = value,
    },
    "オンライン対応": {
      needValue: false,
      f: () => shohou.bikou.push("オンライン対応（原本郵送）"),
    },
    "comment": {
      needValue: true,
      f: (value) => shohou.shohouComments.push(value),
    },
  }
  function handleCommand(cmd: string) {
    handleComment(cmd, comhandlers);
  }
  let end = seq(
    prolog(),
    repeat(
      drugGroup(g => shohou.groups.push(g))
    ),
    repeat(
      command(s => {
        handleCommand(s);
      })
    ),
    repeatUntil(blankLine(), eof())
  )(text, 0);
  if (end === undefined) {
    throw new Error("cannot parse shohou");
  }
  return shohou;
}

function prolog(): Tokenizer {
  return seq(
    optional(
      seq(
        str("院外処方"),
        blankLine(),
      )
    ),
    or(
      str("Rp)"),
      str("Ｒｐ）"),
    ),
    whitespaces(),
    eol(),
  );
}

function parseComment(com: string): { key: string, value: string } {
  let key: string;
  let value: string;
  let colon = com.indexOf(":");
  if (colon < 0) {
    colon = com.indexOf("：");
  }
  if (colon >= 0) {
    key = com.substring(0, colon).trim();
    value = com.substring(colon + 1).trim();
  } else {
    key = com;
    value = "";
  }
  return { key, value };
}

function handleComment(com: string, handlers: Record<string, { f: (value: string) => void, needValue: boolean }>) {
  com = com.trim();
  const { key, value } = parseComment(com);
  const bind = handlers[key];
  if (bind) {
    bind.f(value);
  } else {
    const msg = `Invalid drug comment (${com})`;
    alert([
      msg,
      "Allowed comments are:",
      ...(Object.entries(handlers).map(([k, v]) => v.needValue ? `@${k}:...` : `@${k}`))
    ].join("\n"));
    throw new Error(msg);
  }
}

function drugGroup(cb?: (g: DrugGroup) => void): Tokenizer {
  return (src: string, start: number): number | undefined => {
    let drugs: Drug[] = [];
    let usage: Usage | undefined = undefined;
    let comments: string[] = [];
    const comhandlers: Record<string, { f: (value: string) => void, needValue: boolean }> = {
      "comment": {
        needValue: true,
        f: (value) => comments.push(value)
      }
    }
    function addComment(com: string) {
      handleComment(com, comhandlers);
    }
    let end = seq(
      whitespaces(),
      groupIndex(),
      whitespaces(),
      drugNameAndAmount(d => {
        drugs.push(d);
      }),
      repeat(
        seq(
          whitespaces(1),
          drugNameAndAmount(d => drugs.push(d)),
        )),
      whitespaces(1),
      or(
        usageDays(d => {
          usage = d;
        }),
        usageTimes(d => {
          usage = d;
        }),
        usageOther(d => {
          usage = d;
        }),
      ),
      whitespaces(),
      eol(),
      repeat(
        seq(
          whitespaces(1),
          atMark(),
          withCallback(untilEol(), addComment)
        )
      ),
    )(src, start);
    if (end !== undefined) {
      if (usage === undefined) {
        throw new Error("usage not found");
      }
      if (cb) {
        cb({ drugs, usage, groupComments: comments });
      }
    }
    return end;
  }
}

function groupIndex(cb?: Callback): Tokenizer {
  return seq(
    digits(1, undefined, cb),
    or(str(")"), str("）"))
  )
}

function drugNameAndAmount(cb?: (data: Drug) => void): Tokenizer {
  return (src: string, start: number): number | undefined => {
    let data: Drug = {
      name: "", amount: "", unit: "", senpatsu: undefined, drugComments: [],
    }
    const comhandlers: Record<string, { f: (value: string) => void, needValue: boolean }> = {
      "変更不可": {
        f: () => data.senpatsu = "henkoufuka",
        needValue: false,
      },
      "患者希望": {
        f: () => data.senpatsu = "kanjakibou",
        needValue: false,
      },
      "comment": {
        needValue: true,
        f: (value) => data.drugComments.push(value.trim()),
      }
    };
    function addComment(com: string) {
      handleComment(com, comhandlers);
    }
    let end = seq(
      nonWhitespaces(1, undefined, s => data.name += s),
      repeatUntil(
        seq(
          whitespaces(0, undefined, s => data.name += s),
          nonWhitespaces(1, undefined, s => data.name += s),
        ),
        seq(
          whitespaces(),
          drugAmount(d => { Object.assign(data, d) }),
          whitespaces(),
          peek(eol()),
        )
      ),
      whitespaces(),
      eol(),
      repeat(
        seq(
          whitespaces(1),
          atMark(),
          withCallback(untilEol(), addComment),
        ),
      ),
    )(src, start);
    if (end !== undefined) {
      if (cb) { cb(data) }
    }
    return end;
  }
}

function drugAmount(cb?: (data: { amount: string, unit: string }) => void): Tokenizer {
  return (src: string, start: number): number | undefined => {
    let amount = "";
    let unit = "";
    let end = seq(
      optional(
        seq(
          or(str("1"), str("１")),
          str("回"),
          whitespaces(),
        )
      ),
      digits(1, undefined, cs => amount += cs),
      optional(
        seq(
          withCallback(or(str("."), str("．")), s => amount += s),
          digits(1, undefined, s => amount += s),
        )
      ),
      report("drugUnit", false, drugUnit(s => unit += s)),
      peek(seq(
        whitespaces(),
        eol(),
      ))
    )(src, start);
    if (end !== undefined) {
      if (cb) {
        cb({ amount, unit });
      }
    }
    return end;
  }
}

function drugUnit(cb?: Callback): Tokenizer {
  return (src: string, start: number): number | undefined => {
    let end = or(
      str("錠"), str("カプセル"), str("ｇ"), str("ｍｇ"), str("包"), str("ｍＬ"), str("ブリスター"),
      str("瓶"), str("個"), str("キット"), str("枚"), str("パック"), str("袋"), str("本"),
    )(src, start);
    if (end !== undefined) {
      if (cb) { cb(src.substring(start, end)) }
    }
    return end;
  }
}

function usageDays(cb?: (data: Usage) => void): Tokenizer {
  return (src: string, start: number): number | undefined => {
    const data = {
      kind: "days" as const,
      usage: "",
      days: "",
    };
    let end = seq(
      nonWhitespaces(1, undefined, s => data.usage += s),
      repeatUntil(
        one(ch => ch !== "\n", s => data.usage += s),
        seq(
          whitespaces(1),
          digits(1, undefined, s => { data.days += s; }),
          str("日分")
        )
      )
    )(src, start);
    if (end !== undefined) {
      if (cb) { cb(data) }
    }
    return end;
  }
}

function usageTimes(cb?: (data: Usage) => void): Tokenizer {
  return (src: string, start: number): number | undefined => {
    let usage = "";
    let times = "";
    let end = seq(
      nonWhitespaces(1, undefined, s => usage += s),
      repeatUntil(
        one(ch => ch !== "\n", s => usage += s),
        seq(
          whitespaces(1),
          digits(1, undefined, s => times += s),
          str("回分")
        )
      )
    )(src, start);
    if (end !== undefined && cb) {
      cb({ kind: "times", usage, times });
    }
    return end;
  }
}

function usageOther(cb?: (data: Usage) => void): Tokenizer {
  return (src: string, start: number): number | undefined => {
    let usage = "";
    let end = seq(
      repeat(one(ch => ch !== "\n", s => usage += s), 1)
    )(src, start);
    if (end !== undefined && cb) {
      cb({ kind: "other", usage: usage.trim() })
    }
    return end;
  }
}

function command(cb?: (command: string) => void): Tokenizer {
  return (src: string, start: number): number | undefined => {
    let command = "";
    let end = seq(
      atMark(),
      repeat(one(ch => ch !== "\n", s => command += s)),
      eol(),
    )(src, start);
    if (end !== undefined && cb) {
      cb(command);
    }
    return end;
  }
}

function eof(): Tokenizer {
  return (src: string, start: number): number | undefined => {
    if (start === src.length) {
      return start;
    } else {
      return undefined;
    }
  }
}

function blankLine(): Tokenizer {
  return repeatUntil(one(isWhitespace), eol());
}

function untilEol(cb?: (s: string) => void): Tokenizer {
  return (src: string, start: number): number | undefined => {
    const chars: string[] = [];
    let end = repeatUntil(
      one((ch) => ch !== "\n", (ch) => chars.push(ch)),
      eol(),
    )(src, start);
    if (end !== undefined) {
      if (cb) {
        cb(chars.join(""));
      }
    }
    return end;
  }
}

function atMark(): Tokenizer {
  return or(str("@"), str("＠"));
}

// Parser //////////////////////////////////////////////////////////////////////////////////////////////////

type Tokenizer = (src: string, start: number) => number | undefined;
type Callback = (m: string) => void;

function withCallback(tok: Tokenizer, cb?: Callback): Tokenizer {
  return (src: string, start: number): number | undefined => {
    let end = tok(src, start);
    if (end !== undefined) {
      if (cb) { cb(src.substring(start, end)) }
    }
    return end;
  }
}

function str(s: string, cb?: Callback): Tokenizer {
  return (src: string, start: number): number | undefined => {
    if (src.substring(start).startsWith(s)) {
      if (cb) { cb(s) }
      return start + s.length;
    } else {
      return undefined;
    }
  }
}

function regexp(re: RegExp): Tokenizer {
  return (src: string, start: number): number | undefined => {
    const m = re.exec(src.substring(start));
    if (m) {
      if (m.index === 0) {
        return start + m[0].length;
      } else {
        return undefined;
      }
    } else {
      return undefined;
    }
  }
}

function one(pred: (ch: string) => boolean, cb?: Callback): Tokenizer {
  return (src: string, start: number): number | undefined => {
    if (start < src.length) {
      const ch = src[start];
      if (pred(ch)) {
        if (cb) { cb(ch) }
        return start + 1;
      } else {
        undefined;
      }
    } else {
      return undefined;
    }
  }
}

function seq(...toks: Tokenizer[]): Tokenizer {
  return (src: string, start: number): number | undefined => {
    for (let tok of toks) {
      const end = tok(src, start);
      if (end === undefined) {
        return undefined;
      } else {
        start = end;
      }
    }
    return start;
  }
}

function repeat(tok: Tokenizer, atLeast: number = 0, atMost: number | undefined = undefined, cb?: Callback): Tokenizer {
  return (src: string, start: number): number | undefined => {
    let iter = 0;
    const init = start;
    while (true) {
      let end = tok(src, start);
      if (end === undefined) {
        if (iter >= atLeast) {
          if (cb) { cb(src.substring(init, start)) }
          return start;
        } else {
          return end;
        }
      }
      start = end;
      iter += 1;
      if (iter === atMost) {
        if (cb) { cb(src.substring(init, start)) }
        return start;
      }
      if (iter > 100) {
        throw new Error("too many iter");
      }
    }
  }
}

function repeatUntil(tok: Tokenizer, terminal: Tokenizer): Tokenizer {
  return (src: string, start: number): number | undefined => {
    let iter = 0;
    while (true) {
      let end = terminal(src, start);
      if (end !== undefined) {
        return end;
      }
      end = tok(src, start);
      if (end === undefined) {
        return undefined;
      }
      start = end;
      iter += 1;
      if (iter > 100) {
        throw new Error("too many iter");
      }
    }
  }
}

function optional(tok: Tokenizer): Tokenizer {
  return repeat(tok, 0, 1);
}

function or(...toks: Tokenizer[]): Tokenizer {
  return (src: string, start: number): number | undefined => {
    for (let tok of toks) {
      let end = tok(src, start);
      if (end !== undefined) {
        return end;
      }
    }
    return undefined;
  }
}

function isWhitespace(ch: string): boolean {
  return ch === " " || ch === "\t" || ch === "　";
}

function whitespaces(atLeast: number = 0, atMost: number | undefined = undefined, cb?: Callback): Tokenizer {
  return repeat(one(isWhitespace), atLeast, atMost, cb);
}

function nonWhitespaces(atLeast: number = 0, atMost: number | undefined = undefined, cb?: Callback): Tokenizer {
  return repeat(one(ch => ch !== "\n" && !isWhitespace(ch)), atLeast, atMost, cb);
}

function isDigit(ch: string): boolean {
  return (ch >= "0" && ch <= "9") || (ch >= "０" && ch <= "９");
}

function digits(atLeast: number = 0, atMost: number | undefined = undefined, cb?: Callback): Tokenizer {
  return repeat(one(isDigit), atLeast, atMost, cb);
}

function eol(): Tokenizer {
  return or(str("\n"), str("\r\n"), eof());
}

function peek(tok: Tokenizer): Tokenizer {
  return (src: string, start: number): number | undefined => {
    let end = tok(src, start);
    if (end !== undefined) {
      return start;
    } else {
      return end;
    }
  }
}

function dbg(message: string): Tokenizer {
  return (src: string, start: number): number | undefined => {
    console.log(`DEBUG: ${message} ${src.substring(start, start + 10)}`);
    return start;
  }
}

function nop(f: (src: string, start: number) => void): Tokenizer {
  return (src: string, start: number): number | undefined => {
    f(src, start);
    return start;
  }
}

function report(label: string, active: boolean, tok: Tokenizer): Tokenizer {
  return (src: string, start: number): number | undefined => {
    if (active) {
      console.log(`matching ${label}: ${src.substring(start, start + 10)}`);
    }
    let end = tok(src, start);
    if (active) {
      if (end !== undefined) {
        console.log(`success ${label}: ${src.substring(start, end)}`);
      } else {
        console.log(`failure ${label} failed`);
      }
    }
    return end;
  }
}

// Parser /////////////////////////////////////////////////////////////////////

type Probe = (src: string) => string | undefined;

function probeSeq(...probes: Probe[]): Probe {
  return (src: string) => {
    for (let probe of probes) {
      const rest = probe(src);
      if (rest !== undefined) {
        src = rest;
      } else {
        return undefined;
      }
    }
    return src;
  }
}

function probeOr(...probes: Probe[]): Probe {
  return (src: string) => {
    for(let probe of probes) {
      let rest: string | undefined = probe(src);
      if( rest !== undefined ){
        return rest;
      }
    }
    return undefined;
  }
}

function probeWhile(probe: Probe, atLeast: number = 0): Probe {
  return (src: string) => {
    let rest: string | undefined = src;
    let success = 0;
    while (true) {
      const r = probe(rest);
      if (r !== undefined) {
        rest = r;
        success += 1;
      } else {
        if (success >= atLeast) {
          return rest;
        } else {
          return undefined;
        }
      }
    }
  }
}

function probeOne(pred: (c: string) => boolean, cb: (ch: string) => void = _ => { }): Probe {
  return src => {
    if (src.length > 0 && pred(src[0])) {
      cb(src[0]);
      return src.substring(1);
    }
  }
}

function isSpace(ch: string): boolean {
  return ch === " " || ch === "　" || ch === "\t";
}

function probeSpaces(atLeast: number = 0, cb: (s: string) => void = _ => { }): Probe {
  return (src: string) => {
    let rest: string | undefined = src;
    let found = "";
    rest = probeWhile(probeOne(isSpace, ch => found += ch), atLeast)(rest);
    if (rest !== undefined) {
      cb(found);
    }
    return rest;
  }
}

function probeNonSpaces(cb: (found: string) => void, atLeast = 1): Probe {
  return (src: string) => {
    let rest: string | undefined = src;
    let found = "";
    rest = probeWhile(probeOne(ch => !isSpace(ch) && ch !== "\n", ch => {
      found += ch
    }), atLeast)(rest);
    if (rest !== undefined) {
      cb(found);
    }
    return rest;
  }
}

const probeEol: Probe = (src: string) => {
  if (src === "") {
    return "";
  } else if (src[0] === "\n") {
    return src.substring(1);
  } else if (src[0] === "\r" && src[1] === "\n") {
    return src.substring(2);
  } else {
    return undefined;
  }
}

function probeOptional(probe: Probe): Probe {
  return (src: string) => {
    let rest = probe(src);
    if (rest !== undefined) {
      return rest;
    } else {
      return src;
    }
  }
}

function probeUntil(repeatProbe: Probe, condProbe: Probe): Probe {
  return (src: string) => {
    let rest: string | undefined = src;
    while (true) {
      let r = condProbe(rest);
      if (r !== undefined) {
        return r;
      }
      r = repeatProbe(rest);
      if (r !== undefined) {
        rest = r;
      } else {
        return undefined;
      }
    }
  }
}

function probeImmediate(immediate: string, cb: (s: string) => void = _ => {}): Probe {
  return src => {
    if (src.startsWith(immediate)) {
      cb(immediate);
      return src.substring(immediate.length);
    } else {
      return undefined;
    }
  }
}

function probeNoCase(immediate: string): Probe {
  let probes: Probe[] = Array.from(immediate).map(ch => {
    return probeOne(c => c.toLowerCase() === ch.toLowerCase());
  });
  return probeSeq(...probes);
}

function probeNoKaku(immediate: string): Probe {
  let probes: Probe[] = Array.from(immediate).map(ch => {
    return probeOne(c => toHankaku(c) === toHankaku(ch));
  });
  return probeSeq(...probes);
}

function probeDigit(cb: (ch: string) => void): Probe {
  return probeOne(ch => {
    const d = toHankaku(ch);
    return "0" <= d && d <= "9";
  }, cb);
}

function probeDigits(cb: (found: string) => void = _ => { }): Probe {
  let found = "";
  return probeWhile(probeDigit(ch => (found += ch)));
}

function probeProlog(): Probe {
  const probeLine1 = probeSeq(probeImmediate("院外処方"), probeSpaces(), probeEol);
  const probeLine2 = probeSeq(probeNoKaku("Rp)"), probeSpaces(), probeEol);
  return probeSeq(probeOptional(probeLine1), probeLine2);
}

const drugUnits = [
  "錠",
  "カプセル",
  "ｇ",
  "ｍｇ",
  "包",
  "ｍＬ",
  "ブリスター",
  "瓶",
  "個",
  "キット",
  "枚",
  "パック",
  "袋",
  "本",
];

function probeDrugUnit(cb: (s: string) => void): Probe {
  const probes: Probe[] = drugUnits.map(u => probeImmediate(u, cb));
  return probeOr(...probes);
}

function probeAmount(cb: (s: string) => void): Probe {
  return (src: string) => {
    let rest: string | undefined = src;
    let digits: string = "";
    rest = probeDigits(s => digits = s)(rest);
    if (rest === undefined) {
      return undefined;
    }
    if (rest[0] === "." || rest[0] === "．") {
      digits += rest[0];
      rest = rest.substring(1);
    }
    rest = probeDigits(s => digits += s)(rest);
    if (rest !== undefined) {
      cb(digits);
    }
    return rest;
  }
}

function probeDrugNameAndAmount(cb: (r: { name: string, amount: string, unit: string }) => void): Probe {
  return (src: string) => {
    let rest: string | undefined = src;
    let name: string = "";
    rest = probeNonSpaces(found => name = found)(rest);
    if (rest === undefined) {
      return undefined;
    }
    rest = probeSpaces(1, sp => name += sp)(rest);
    if (rest === undefined) {
      return undefined;
    }
    let amount = "";
    let unit = "";
    while (true) {
      const r = probeSeq(
        probeAmount(s => amount = s), 
        probeDrugUnit(s => unit = s),
        probeSpaces(0),
        probeEol,
      )(rest);
      if (r !== undefined) {
        rest = r;
        break;
      } else {
        rest = probeNonSpaces(s => name += s)(rest);
        if (rest === undefined) {
          return undefined;
        }
      }
    }
    if( rest !== undefined ){
      cb({ name, amount, unit })
    }
    return rest;
  }


}

function probeDrugGroup(cb: (drugGroup: DrugGroup) => void): Probe {
  return (src: string) => {
    let rest: string | undefined = src;
    let nameAndAmount: { name: string, amount: string, unit: string } | undefined = undefined;
    rest = probeSeq(
      probeSpaces(0),
      probeDigits(),
      probeNoKaku(")"),
      probeSpaces(0),
      probeDrugNameAndAmount(r => nameAndAmount = r),
    )(rest);
    console.log("nameAndAmount", nameAndAmount);
    return rest;
  }
}

export function parseShohou(text: string, debug: boolean = false): Shohou {
  const shohou: Shohou = {
    groups: [],
    shohouComments: [],
    bikou: [],
  };
  let src: string | undefined = text;
  src = probeProlog()(src);
  if (src === undefined) {
    throw new Error("failed to read prolog");
  }
  let g: DrugGroup | undefined;
  src = probeDrugGroup(found => g = found)(src);
  console.log("src", src);
  return shohou;
}