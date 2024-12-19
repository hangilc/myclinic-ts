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

export function parseShohou(text: string, debug: boolean = false): Shohou {
  const shohou: Shohou = {
    groups: [],
    shohouComments: [],
    bikou: [],
  };
  function handleCommand(cmd: string) {
    cmd = cmd.trim();
    let key: string;
    let value: string;
    const colon = cmd.indexOf(":");
    if( colon >= 0 ){
      key = cmd.substring(0, colon).trim();
      value = cmd.substring(colon+1).trim();
    } else {
      key = cmd;
      value = "";
    }
    switch(key){
      case "memo": {
        shohou.bikou.push(value);
        break;
      }
      case "有効期限": {
        shohou.kigen = value;
        break;
      }
      case "オンライン対応": {
        shohou.bikou.push("オンライン対応（原本郵送）");
        break;
      }
      case "comment": {
        shohou.shohouComments.push(value);
        break;
      }
      default: {
        alert(`Unknown shohou comment (${cmd})\n` + "Allowed comments are:\n@memo:...\n@有効期限:YYYY-MM-DD\n" +
          "@オンライン対応\n@comment:..."
        );
        throw new Error(`Invalid shohou comment (${cmd})`)
      }
    }
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



function drugGroup(cb?: (g: DrugGroup) => void): Tokenizer {
  return (src: string, start: number): number | undefined => {
    let drugs: Drug[] = [];
    let usage: Usage | undefined = undefined;
    let comments: string[] = [];
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
          str("comment:"),
          untilEol((com) => comments.push(com.trim()))
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
    function addComment(s: string) {
      s = s.trim();
      if( s === "変更不可" ){
        data.senpatsu = "henkoufuka";
      } else if( s === "患者希望" ){
        data.senpatsu = "kanjakibou";
      } else if( s.startsWith("comment:") ){
        const com = s.substring("comment:".length).trim();
        data.drugComments.push(com);
      } else {
        alert(`Invalid drug comment (${s})` + "Allowed comments are:\n@変更不可\n@患者希望\n@comment:...");
        throw new Error("invalid drug comment");
      }
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
          withCallback(seq(
            or(str("comment:"), str("変更不可"), str("患者希望")),
            untilEol()
          ), (s) => addComment(s)),
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
