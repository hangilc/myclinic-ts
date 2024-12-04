export interface Shohou {
  groups: DrugGroup[];
  commands: string[];
}

export function parseShohou(text: string): Shohou {
  const shohou: Shohou = {
    groups: [],
    commands: []
  };
  let end = seq(
    prolog(),
    repeat(
      drugGroup(g => shohou.groups.push(g))
    ),
    repeat(
      command(s => shohou.commands.push(s))
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

type Usage = ({
  kind: "days"; days: string;
} | {
  kind: "times"; times: string;
} | {
  kind: "other";
}) & { usage: string }

interface Drug {
  name: string, amount: string, unit: string
}

interface DrugGroup {
  drugs: Drug[],
  usage: Usage,
}

function drugGroup(cb?: (g: DrugGroup) => void): Tokenizer {
  return (src: string, start: number): number | undefined => {
    let drugs: Drug[] = [];
    let usage: Usage | undefined = undefined;
    let end = seq(
      whitespaces(),
      groupIndex(),
      whitespaces(),
      drugNameAndAmount(d => drugs.push(d)),
      whitespaces(),
      eol(),
      repeat(
        seq(
          whitespaces(1),
          drugNameAndAmount(d => drugs.push(d)),
          whitespaces(),
          eol(),
        )),
      whitespaces(1),
      or(
        usageDays(d => usage = d),
        usageTimes(d => usage = d),
        usageOther(d => usage = d),
      ),
      whitespaces(),
      eolOrEof(),
    )(src, start);
    if (end !== undefined) {
      if (usage === undefined) {
        throw new Error("usage not found");
      }
      if (cb) {
        cb({ drugs, usage });
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

function drugNameAndAmount(cb?: (data: { name: string, amount: string, unit: string }) => void): Tokenizer {
  return (src: string, start: number): number | undefined => {
    let data = {
      name: "", amount: "", unit: ""
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
        )
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
      digits(1, undefined, cs => amount += cs),
      optional(
        seq(
          withCallback(or(str("."), str("．")), s => amount += s),
          digits(1, undefined, s => amount += s),
        )
      ),
      drugUnit(s => unit += s)
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
  return withCallback(or(
    str("錠"), str("カプセル"), str("ｇ"), str("ｍｇ"), str("包"), str("ｍＬ"), str("ブリスター"),
    str("瓶"), str("個"), str("キット"), str("枚"), str("パック"), str("袋"), str("本"),
  ), cb);
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
          digits(1, 2, s => { data.days += s; }),
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
      str("@"),
      repeat(one(ch => ch !== "\n", s => command += s)),
      eolOrEof(),
    )(src, start);
    if (end !== undefined && cb) {
      cb(command);
    }
    return end;
  }
}

function eof(): Tokenizer {
  return (src: string, start: number): number | undefined => {
    if( start === src.length ){
      return start;
    } else {
      return undefined;
    }
  }
}

function eolOrEof(): Tokenizer {
  return or(eof(), eol())
}

function blankLine(): Tokenizer {
  return repeatUntil(one(isWhitespace), eol());
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
  return or(str("\n"), str("\r\n"));
}

function peek(src: string, start: number): string | undefined {
  return start < src.length ? src[start] : undefined;
}

// function prolog(): Tokenizer {
//   return seq(
//     or(
//       matches("Rp)"),
//       matches("Ｒｐ）"),
//     ),
//     whitespaces(),
//     eol(),
//   );
// }

// function drugGroup(): Tokenizer {
//   return seq(
//     groupIndex(),
//     // drugNameAndAmount(console.log, console.log),
//   )
// }

// function groupIndex(cb?: Callback): Tokenizer {
//   return seq(
//     whitespaces(),
//     // digits(cb),
//     // or(matches(")"), matches("）"))
//   );
// }

// function drugNameAndAmount(nameCallback: Callback, amountCallback: Callback): Tokenizer {
//   return seq(
//     whitespaces(),
//     nonWhitespaces(console.log),
//     eol(),
//   );
// }

// type Tokenizer = (src: string, start: number) => number | undefined;
// type Callback = (m: string) => void;

// function eolOrEof(): Tokenizer {
//   return or(eof(), eol());
// }

// function eof(): Tokenizer {
//   return (src: string, start: number): number | undefined => {
//     if (src.length === start) {
//       return start;
//     } else {
//       return undefined;
//     }

//   }
// }

// function isWhitespace(ch: string): boolean {
//   return ch === " " || ch === "\t" || ch === "　";
// }

// function whitespaces(): Tokenizer {
//   return eatWhile(isWhitespace);
// }

// function nonWhitespaces(cb?: Callback): Tokenizer {
//   return eatWhile(ch => !isWhitespace(ch));
// }

// function digits(cb?: Callback): Tokenizer {
//   return eatWhile(ch => (ch >= "0" && ch <= "9") || (ch >= "１" && ch <= "９"), cb);
// }

// function matches(s: string | RegExp, cb?: Callback): Tokenizer {
//   if (typeof s === "string") {
//     return matchesString(s, cb);
//   } else {
//     return matchesRegExp(s, cb);
//   }
// }

// function matchesString(s: string, cb?: Callback): Tokenizer {
//   return (src: string, start: number): number[] => {
//     if (src.substring(start).startsWith(s)) {
//       if (cb) { cb(s) }
//       return [start + s.length];
//     } else {
//       return [];
//     }
//   }
// }

// function matchesRegExp(re: RegExp, cb?: Callback): Tokenizer {
//   return (src: string, start: number): number[] => {
//     const m = re.exec(src.substring(start));
//     if (m) {
//       if (m.index === 0) {
//         if (cb) { cb(m[0]); }
//         return [start + m[0].length];
//       } else {
//         return [];
//       }
//     } else {
//       return [];
//     }
//   }
// }

// function eol(): Tokenizer {
//   return or(matches("\n"), matches("\r\n"));
// }

// function seq(...tokenizers: Tokenizer[]): Tokenizer {
//   return (src: string, start: number): number[] => {
//     let from: number[] = [start];
//     for (let tok of tokenizers) {
//       let to: Set<number> = new Set();
//       for(let start of from) {
//         const ends = tok(src, start);
//         ends.forEach(end => to.add(end));
//       }
//       from = Array.from(to);
//     }
//     return from;
//   }
// }

// function or(...tokenizers: Tokenizer[]): Tokenizer {
//   return (src: string, start: number): number[] => {
//     const to: Set<number> = new Set();
//     for (let tok of tokenizers) {
//       const ends = tok(src, start);
//       ends.forEach(end => to.add(end));
//     }
//     return Array.from(to);
//   }
// }

// function repeat(tok: Tokenizer): Tokenizer {
//   return (src: string, start: number): number[] => {
//     const result: Set<number> = new Set([start]);
//     let from: number[] = [start];
//     let iter = 0;
//     while (true) {
//       if( iter++ > 100 ){
//         throw new Error("too many repeat");
//       }
//       const to: number[] = [];
//       let ends = tok(src, start);
//       if( ends.length === 0 ){
//         break;
//       }
//       result.push(...ends);
//       from = ends;
//     }
//     return result;
//   }
// }

// function nop(cb?: () => void): Tokenizer {
//   return (src: string, start: number): number[] => {
//     if( cb ){ cb(); }
//     return [start];
//   }
// }

// function eatWhile(pred: (ch: string) => boolean, cb?: Callback): Tokenizer {
//   return repeat((src: string, start: number): number[] => {
//     if( start < src.length ){
//       const ch = src[start];
//       if( pred(ch) ){
//         return [start + 1];
//       } else {
//         return [];
//       }
//     } else {
//       return [];
//     }
//   })
// }

// function optional(tok: Tokenizer): Tokenizer {
//   return (src: string, start: number): number[] => {
//     return [start, ...tok(src, start)];
//   }
// }
