import { DateWrapper } from "myclinic-util";
import { toHankaku } from "./zenkaku";

export interface Shohou {
  groups: DrugGroup[];
  // shohouComments: string[];
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

// export function parseShohouOrig(text: string, debug: boolean = false): Shohou {
//   const shohou: Shohou = {
//     groups: [],
//     shohouComments: [],
//     bikou: [],
//   };
//   const comhandlers: Record<string, { f: (value: string) => void, needValue: boolean }> = {
//     "memo": {
//       needValue: true,
//       f: (value) => shohou.bikou.push(value),
//     },
//     "有効期限": {
//       needValue: true,
//       f: (value) => shohou.kigen = value,
//     },
//     "オンライン対応": {
//       needValue: false,
//       f: () => shohou.bikou.push("オンライン対応（原本郵送）"),
//     },
//     "comment": {
//       needValue: true,
//       f: (value) => shohou.shohouComments.push(value),
//     },
//   }
//   function handleCommand(cmd: string) {
//     handleComment(cmd, comhandlers);
//   }
//   let end = seq(
//     prolog(),
//     repeat(
//       drugGroup(g => shohou.groups.push(g))
//     ),
//     repeat(
//       command(s => {
//         handleCommand(s);
//       })
//     ),
//     repeatUntil(blankLine(), eof())
//   )(text, 0);
//   if (end === undefined) {
//     throw new Error("cannot parse shohou");
//   }
//   return shohou;
// }

// function prolog(): Tokenizer {
//   return seq(
//     optional(
//       seq(
//         str("院外処方"),
//         blankLine(),
//       )
//     ),
//     or(
//       str("Rp)"),
//       str("Ｒｐ）"),
//     ),
//     whitespaces(),
//     eol(),
//   );
// }

// function parseComment(com: string): { key: string, value: string } {
//   let key: string;
//   let value: string;
//   let colon = com.indexOf(":");
//   if (colon < 0) {
//     colon = com.indexOf("：");
//   }
//   if (colon >= 0) {
//     key = com.substring(0, colon).trim();
//     value = com.substring(colon + 1).trim();
//   } else {
//     key = com;
//     value = "";
//   }
//   return { key, value };
// }

// function handleComment(com: string, handlers: Record<string, { f: (value: string) => void, needValue: boolean }>) {
//   com = com.trim();
//   const { key, value } = parseComment(com);
//   const bind = handlers[key];
//   if (bind) {
//     bind.f(value);
//   } else {
//     const msg = `Invalid drug comment (${com})`;
//     alert([
//       msg,
//       "Allowed comments are:",
//       ...(Object.entries(handlers).map(([k, v]) => v.needValue ? `@${k}:...` : `@${k}`))
//     ].join("\n"));
//     throw new Error(msg);
//   }
// }

// function drugGroup(cb?: (g: DrugGroup) => void): Tokenizer {
//   return (src: string, start: number): number | undefined => {
//     let drugs: Drug[] = [];
//     let usage: Usage | undefined = undefined;
//     let comments: string[] = [];
//     const comhandlers: Record<string, { f: (value: string) => void, needValue: boolean }> = {
//       "comment": {
//         needValue: true,
//         f: (value) => comments.push(value)
//       }
//     }
//     function addComment(com: string) {
//       handleComment(com, comhandlers);
//     }
//     let end = seq(
//       whitespaces(),
//       groupIndex(),
//       whitespaces(),
//       drugNameAndAmount(d => {
//         drugs.push(d);
//       }),
//       repeat(
//         seq(
//           whitespaces(1),
//           drugNameAndAmount(d => drugs.push(d)),
//         )),
//       whitespaces(1),
//       or(
//         usageDays(d => {
//           usage = d;
//         }),
//         usageTimes(d => {
//           usage = d;
//         }),
//         usageOther(d => {
//           usage = d;
//         }),
//       ),
//       whitespaces(),
//       eol(),
//       repeat(
//         seq(
//           whitespaces(1),
//           atMark(),
//           withCallback(untilEol(), addComment)
//         )
//       ),
//     )(src, start);
//     if (end !== undefined) {
//       if (usage === undefined) {
//         throw new Error("usage not found");
//       }
//       if (cb) {
//         cb({ drugs, usage, groupComments: comments });
//       }
//     }
//     return end;
//   }
// }

// function groupIndex(cb?: Callback): Tokenizer {
//   return seq(
//     digits(1, undefined, cb),
//     or(str(")"), str("）"))
//   )
// }

// function drugNameAndAmount(cb?: (data: Drug) => void): Tokenizer {
//   return (src: string, start: number): number | undefined => {
//     let data: Drug = {
//       name: "", amount: "", unit: "", senpatsu: undefined, drugComments: [],
//     }
//     const comhandlers: Record<string, { f: (value: string) => void, needValue: boolean }> = {
//       "変更不可": {
//         f: () => data.senpatsu = "henkoufuka",
//         needValue: false,
//       },
//       "患者希望": {
//         f: () => data.senpatsu = "kanjakibou",
//         needValue: false,
//       },
//       "comment": {
//         needValue: true,
//         f: (value) => data.drugComments.push(value.trim()),
//       }
//     };
//     function addComment(com: string) {
//       handleComment(com, comhandlers);
//     }
//     let end = seq(
//       nonWhitespaces(1, undefined, s => data.name += s),
//       repeatUntil(
//         seq(
//           whitespaces(0, undefined, s => data.name += s),
//           nonWhitespaces(1, undefined, s => data.name += s),
//         ),
//         seq(
//           whitespaces(),
//           drugAmount(d => { Object.assign(data, d) }),
//           whitespaces(),
//           peek(eol()),
//         )
//       ),
//       whitespaces(),
//       eol(),
//       repeat(
//         seq(
//           whitespaces(1),
//           atMark(),
//           withCallback(untilEol(), addComment),
//         ),
//       ),
//     )(src, start);
//     if (end !== undefined) {
//       if (cb) { cb(data) }
//     }
//     return end;
//   }
// }

// function drugAmount(cb?: (data: { amount: string, unit: string }) => void): Tokenizer {
//   return (src: string, start: number): number | undefined => {
//     let amount = "";
//     let unit = "";
//     let end = seq(
//       optional(
//         seq(
//           or(str("1"), str("１")),
//           str("回"),
//           whitespaces(),
//         )
//       ),
//       digits(1, undefined, cs => amount += cs),
//       optional(
//         seq(
//           withCallback(or(str("."), str("．")), s => amount += s),
//           digits(1, undefined, s => amount += s),
//         )
//       ),
//       report("drugUnit", false, drugUnit(s => unit += s)),
//       peek(seq(
//         whitespaces(),
//         eol(),
//       ))
//     )(src, start);
//     if (end !== undefined) {
//       if (cb) {
//         cb({ amount, unit });
//       }
//     }
//     return end;
//   }
// }

// function drugUnit(cb?: Callback): Tokenizer {
//   return (src: string, start: number): number | undefined => {
//     let end = or(
//       str("錠"), str("カプセル"), str("ｇ"), str("ｍｇ"), str("包"), str("ｍＬ"), str("ブリスター"),
//       str("瓶"), str("個"), str("キット"), str("枚"), str("パック"), str("袋"), str("本"),
//     )(src, start);
//     if (end !== undefined) {
//       if (cb) { cb(src.substring(start, end)) }
//     }
//     return end;
//   }
// }

// function usageDays(cb?: (data: Usage) => void): Tokenizer {
//   return (src: string, start: number): number | undefined => {
//     const data = {
//       kind: "days" as const,
//       usage: "",
//       days: "",
//     };
//     let end = seq(
//       nonWhitespaces(1, undefined, s => data.usage += s),
//       repeatUntil(
//         one(ch => ch !== "\n", s => data.usage += s),
//         seq(
//           whitespaces(1),
//           digits(1, undefined, s => { data.days += s; }),
//           str("日分")
//         )
//       )
//     )(src, start);
//     if (end !== undefined) {
//       if (cb) { cb(data) }
//     }
//     return end;
//   }
// }

// function usageTimes(cb?: (data: Usage) => void): Tokenizer {
//   return (src: string, start: number): number | undefined => {
//     let usage = "";
//     let times = "";
//     let end = seq(
//       nonWhitespaces(1, undefined, s => usage += s),
//       repeatUntil(
//         one(ch => ch !== "\n", s => usage += s),
//         seq(
//           whitespaces(1),
//           digits(1, undefined, s => times += s),
//           str("回分")
//         )
//       )
//     )(src, start);
//     if (end !== undefined && cb) {
//       cb({ kind: "times", usage, times });
//     }
//     return end;
//   }
// }

// function usageOther(cb?: (data: Usage) => void): Tokenizer {
//   return (src: string, start: number): number | undefined => {
//     let usage = "";
//     let end = seq(
//       repeat(one(ch => ch !== "\n", s => usage += s), 1)
//     )(src, start);
//     if (end !== undefined && cb) {
//       cb({ kind: "other", usage: usage.trim() })
//     }
//     return end;
//   }
// }

// function command(cb?: (command: string) => void): Tokenizer {
//   return (src: string, start: number): number | undefined => {
//     let command = "";
//     let end = seq(
//       atMark(),
//       repeat(one(ch => ch !== "\n", s => command += s)),
//       eol(),
//     )(src, start);
//     if (end !== undefined && cb) {
//       cb(command);
//     }
//     return end;
//   }
// }

// function eof(): Tokenizer {
//   return (src: string, start: number): number | undefined => {
//     if (start === src.length) {
//       return start;
//     } else {
//       return undefined;
//     }
//   }
// }

// function blankLine(): Tokenizer {
//   return repeatUntil(one(isWhitespace), eol());
// }

// function untilEol(cb?: (s: string) => void): Tokenizer {
//   return (src: string, start: number): number | undefined => {
//     const chars: string[] = [];
//     let end = repeatUntil(
//       one((ch) => ch !== "\n", (ch) => chars.push(ch)),
//       eol(),
//     )(src, start);
//     if (end !== undefined) {
//       if (cb) {
//         cb(chars.join(""));
//       }
//     }
//     return end;
//   }
// }

// function atMark(): Tokenizer {
//   return or(str("@"), str("＠"));
// }

// // Parser //////////////////////////////////////////////////////////////////////////////////////////////////

// type Tokenizer = (src: string, start: number) => number | undefined;
// type Callback = (m: string) => void;

// function withCallback(tok: Tokenizer, cb?: Callback): Tokenizer {
//   return (src: string, start: number): number | undefined => {
//     let end = tok(src, start);
//     if (end !== undefined) {
//       if (cb) { cb(src.substring(start, end)) }
//     }
//     return end;
//   }
// }

// function str(s: string, cb?: Callback): Tokenizer {
//   return (src: string, start: number): number | undefined => {
//     if (src.substring(start).startsWith(s)) {
//       if (cb) { cb(s) }
//       return start + s.length;
//     } else {
//       return undefined;
//     }
//   }
// }

// function regexp(re: RegExp): Tokenizer {
//   return (src: string, start: number): number | undefined => {
//     const m = re.exec(src.substring(start));
//     if (m) {
//       if (m.index === 0) {
//         return start + m[0].length;
//       } else {
//         return undefined;
//       }
//     } else {
//       return undefined;
//     }
//   }
// }

// function one(pred: (ch: string) => boolean, cb?: Callback): Tokenizer {
//   return (src: string, start: number): number | undefined => {
//     if (start < src.length) {
//       const ch = src[start];
//       if (pred(ch)) {
//         if (cb) { cb(ch) }
//         return start + 1;
//       } else {
//         undefined;
//       }
//     } else {
//       return undefined;
//     }
//   }
// }

// function seq(...toks: Tokenizer[]): Tokenizer {
//   return (src: string, start: number): number | undefined => {
//     for (let tok of toks) {
//       const end = tok(src, start);
//       if (end === undefined) {
//         return undefined;
//       } else {
//         start = end;
//       }
//     }
//     return start;
//   }
// }

// function repeat(tok: Tokenizer, atLeast: number = 0, atMost: number | undefined = undefined, cb?: Callback): Tokenizer {
//   return (src: string, start: number): number | undefined => {
//     let iter = 0;
//     const init = start;
//     while (true) {
//       let end = tok(src, start);
//       if (end === undefined) {
//         if (iter >= atLeast) {
//           if (cb) { cb(src.substring(init, start)) }
//           return start;
//         } else {
//           return end;
//         }
//       }
//       start = end;
//       iter += 1;
//       if (iter === atMost) {
//         if (cb) { cb(src.substring(init, start)) }
//         return start;
//       }
//       if (iter > 100) {
//         throw new Error("too many iter");
//       }
//     }
//   }
// }

// function repeatUntil(tok: Tokenizer, terminal: Tokenizer): Tokenizer {
//   return (src: string, start: number): number | undefined => {
//     let iter = 0;
//     while (true) {
//       let end = terminal(src, start);
//       if (end !== undefined) {
//         return end;
//       }
//       end = tok(src, start);
//       if (end === undefined) {
//         return undefined;
//       }
//       start = end;
//       iter += 1;
//       if (iter > 100) {
//         throw new Error("too many iter");
//       }
//     }
//   }
// }

// function optional(tok: Tokenizer): Tokenizer {
//   return repeat(tok, 0, 1);
// }

// function or(...toks: Tokenizer[]): Tokenizer {
//   return (src: string, start: number): number | undefined => {
//     for (let tok of toks) {
//       let end = tok(src, start);
//       if (end !== undefined) {
//         return end;
//       }
//     }
//     return undefined;
//   }
// }

// function isWhitespace(ch: string): boolean {
//   return ch === " " || ch === "\t" || ch === "　";
// }

// function whitespaces(atLeast: number = 0, atMost: number | undefined = undefined, cb?: Callback): Tokenizer {
//   return repeat(one(isWhitespace), atLeast, atMost, cb);
// }

// function nonWhitespaces(atLeast: number = 0, atMost: number | undefined = undefined, cb?: Callback): Tokenizer {
//   return repeat(one(ch => ch !== "\n" && !isWhitespace(ch)), atLeast, atMost, cb);
// }

// function isDigit(ch: string): boolean {
//   return (ch >= "0" && ch <= "9") || (ch >= "０" && ch <= "９");
// }

// function digits(atLeast: number = 0, atMost: number | undefined = undefined, cb?: Callback): Tokenizer {
//   return repeat(one(isDigit), atLeast, atMost, cb);
// }

// function eol(): Tokenizer {
//   return or(str("\n"), str("\r\n"), eof());
// }

// function peek(tok: Tokenizer): Tokenizer {
//   return (src: string, start: number): number | undefined => {
//     let end = tok(src, start);
//     if (end !== undefined) {
//       return start;
//     } else {
//       return end;
//     }
//   }
// }

// function dbg(message: string): Tokenizer {
//   return (src: string, start: number): number | undefined => {
//     console.log(`DEBUG: ${message} ${src.substring(start, start + 10)}`);
//     return start;
//   }
// }

// function nop(f: (src: string, start: number) => void): Tokenizer {
//   return (src: string, start: number): number | undefined => {
//     f(src, start);
//     return start;
//   }
// }

// function report(label: string, active: boolean, tok: Tokenizer): Tokenizer {
//   return (src: string, start: number): number | undefined => {
//     if (active) {
//       console.log(`matching ${label}: ${src.substring(start, start + 10)}`);
//     }
//     let end = tok(src, start);
//     if (active) {
//       if (end !== undefined) {
//         console.log(`success ${label}: ${src.substring(start, end)}`);
//       } else {
//         console.log(`failure ${label} failed`);
//       }
//     }
//     return end;
//   }
// }

// Parser /////////////////////////////////////////////////////////////////////

type Probe = (src: string, i: number) => number | undefined;
type Proceed = (src: string, i: number) => number;

function seq(...probes: (Probe | Proceed)[]): Probe {
  return (src: string, i: number) => {
    for (let probe of probes) {
      const j = probe(src, i);
      if (j !== undefined) {
        i = j;
      } else {
        return undefined;
      }
    }
    return i;
  }
}

function or(...probes: Probe[]): Probe {
  return (src: string, i: number) => {
    for (let probe of probes) {
      let j = probe(src, i);
      if (j !== undefined) {
        return j;
      }
    }
    return undefined;
  }
}

function proceedWhile(f: (ch: string) => boolean, cb: (s: string) => void = _ => { },
  matchCount: (matches: number) => void = _ => { }): Proceed {
  return (src: string, i: number) => {
    let acc = "";
    let matches = 0;
    while (i < src.length) {
      if (f(src[i])) {
        acc += src[i];
        i += 1;
        matches += 1;
      } else {
        break;
      }
    }
    cb(acc);
    matchCount(matches);
    return i;
  }
}

function probeWhile(f: (ch: string) => boolean, cb: (s: string) => void = _ => { }): Probe {
  return (src: string, i: number) => {
    let matches = 0;
    let j: number | undefined = proceedWhile(f, cb, (n) => matches = n)(src, i);
    if (j !== undefined && matches > 0) {
      return j;
    } else {
      return undefined;
    }
  }
}

function repeat(item: Probe): Proceed {
  return (src: string, i: number) => {
    let j: number | undefined;
    while (i < src.length) {
      j = item(src, i);
      if (j !== undefined) {
        i = j;
      } else {
        return i;
      }
    }
    return i;
  }
}

function repeatUntil(item: Probe, cond: Probe): Probe {
  return (src: string, i: number) => {
    let j: number | undefined;
    while (i < src.length) {
      j = cond(src, i);
      if (j !== undefined) {
        return j;
      }
      j = item(src, i);
      if (j === undefined) {
        return undefined;
      } else {
        i = j;
      }
    }
    return undefined;
  }
}

function not(probe: Probe): Probe {
  return (src: string, i: number) => {
    let j: number | undefined = probe(src, i);
    if (j !== undefined) {
      return undefined;
    } else {
      return i;
    }
  }
}

function peek(probe: Probe): Probe {
  return (src: string, i: number) => {
    let j: number | undefined = probe(src, i);
    if (j !== undefined) {
      return i;
    } else {
      return undefined;
    }
  }
}

function isSpace(ch: string): boolean {
  return ch === " " || ch === "　" || ch === "\t";
}

function proceedSpaces(cb: (s: string) => void = _ => { }): Proceed {
  return proceedWhile(isSpace, cb);
}

function probeSpaces(cb: (s: string) => void = __ => { }): Probe {
  return probeWhile(isSpace, cb);
}

function isNonSpace(ch: string): boolean {
  return !isSpace(ch) && ch !== "\n";
}

function proceedNonSpaces(cb: (found: string) => void = _ => { }): Proceed {
  return proceedWhile(isNonSpace, cb);
}

function probeNonSpaces(cb: (s: string) => void = _ => { }): Probe {
  return probeWhile(isNonSpace, cb);
}

function probeEol(): Probe {
  return (src: string, i: number) => {
    if (i < src.length) {
      const ch = src[i];
      if (ch === "\n") {
        return i + 1;
      } else {
        undefined;
      }
    } else if (i < src.length - 1) {
      if (src[i] === "\r" && src[i + 1] == "\n") {
        return i + 2;
      } else {
        return undefined;
      }
    } else {
      return i;
    }
  }
}

function probeEndOfSource(): Probe {
  return (src: string, i: number) => {
    if (i < src.length) {
      return undefined;
    } else {
      return i;
    }
  }
}

function optional(probe: Probe): Probe {
  return (src: string, i: number) => {
    let j = probe(src, i);
    if (j !== undefined) {
      return j;
    } else {
      return i;
    }
  }
}

function blankLineEnd(): Probe {
  return seq(proceedSpaces(), probeEol());
}

function probeImmediate(
  immediate: string,
  cb: (s: string) => void = _ => { },
  conv: (chS: string, chI: string) => [string, string] = (s, i) => [s, i]
): Probe {
  return (src: string, i: number) => {
    let acc = "";
    for (let imm of immediate) {
      let chS = src[i];
      let chI = imm;
      [chS, chI] = conv(chS, chI);
      if (chS === chI) {
        acc += src[i];
        i += 1;
      } else {
        return undefined;
      }
    }
    cb(acc);
    return i;
  }
}

function probeNoCaseImmediate(immediate: string, cb: (s: string) => void = _ => { }): Probe {
  return probeImmediate(immediate, cb, (chS, chI) => [chS.toLowerCase(), chI.toLowerCase()]);
}

function probeNoKakuImmediate(immediate: string, cb: (s: string) => void = _ => { }): Probe {
  return probeImmediate(immediate, cb, (chS, chI) => [toHankaku(chS), toHankaku(chI)]);
}

function isDigit(ch: string): boolean {
  ch = toHankaku(ch);
  return "0" <= ch && ch <= "9";
}

function proceedDigits(cb: (found: string) => void = _ => { }): Proceed {
  return proceedWhile(isDigit, cb);
}

function probeDigits(cb: (s: string) => void = _ => { }): Probe {
  return probeWhile(isDigit, cb);
}

function probeFloat(cb: (s: string) => void = _ => { }): Probe {
  return (src: string, i: number) => {
    let digits = "";
    let j: number | undefined = probeDigits(s => digits = s)(src, i);
    if (j === undefined) {
      return undefined;
    }
    if (src[j] === "." || src[j] === "．") {
      digits += src[j];
      j += 1;
      j = probeDigits(s => digits += s)(src, j);
      if (j === undefined) {
        return undefined;
      }
    }
    cb(digits);
    return j;
  }
}

function proc(f: (src: string, i: number) => void): Proceed {
  return (src: string, i: number) => {
    f(src, i);
    return i;
  }
}

function debug(name: string = "debug"): Probe {
  return (src: string, i: number) => {
    console.log(name, src.substring(i, i + 8));
    return i;
  }
}

function probeBlankLine(): Probe {
  return seq(proceedSpaces(), probeEol());
}


function probePrologLines(): Probe {
  return seq(
    optional(
      seq(probeImmediate("院外処方"), blankLineEnd())
    ),
    seq(probeNoKakuImmediate("Rp)"), blankLineEnd()),
  )
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

function probeDrugUnit(cb: (s: string) => void = _ => { }): Probe {
  const probes: Probe[] = drugUnits.map(u => probeImmediate(u, cb));
  return or(...probes);
}


function probeAmountAndUnit(cbAmount: (
  cbAmount: string) => void = _ => { },
  cbUnit: (unit: string) => void = _ => { }): Probe {
  return (src: string, i: number) => {
    let amount = "";
    let unit = "";
    let j: number | undefined = seq(probeFloat(s => amount = s), probeDrugUnit(s => unit = s))(src, i);
    if (j !== undefined) {
      cbAmount(amount);
      cbUnit(unit);
    }
    return j;
  }
}

function probeDrugNameAndAmount(cb: (d: { name: string, amount: string, unit: string }) => void = _ => { }): Probe {
  return (src: string, i: number) => {
    let name = "";
    let amount = "";
    let unit = "";
    let j: number | undefined = repeatUntil(
      seq(probeNonSpaces(s => name += s), probeSpaces(s => name += s)),
      seq(probeAmountAndUnit(s => amount = s, s => unit = s), peek(blankLineEnd())),
    )(src, i);
    if (j !== undefined) {
      cb({ name: name.trim(), amount, unit })
    }
    return j;
  }
}

function probeUsageDays(cb: (d: { usage: string, days: string }) => void = _ => { }): Probe {
  return (src: string, i: number) => {
    let usage = "";
    let days = "";
    let j: number | undefined = repeatUntil(
      seq(probeNonSpaces(s => usage += s), probeSpaces(s => usage += s)),
      seq(probeDigits(s => days = s), probeImmediate("日分"), peek(blankLineEnd()))
    )(src, i);
    if (j !== undefined) {
      cb({ usage, days })
    }
    return j;
  }
}

function probeUsageTimes(cb: (d: { usage: string, times: string }) => void = _ => { }): Probe {
  return (src: string, i: number) => {
    let usage = "";
    let times = "";
    let j: number | undefined = repeatUntil(
      seq(probeNonSpaces(s => usage += s), probeSpaces(s => usage += s)),
      seq(probeDigits(s => times = s), probeImmediate("回分"), peek(blankLineEnd()))
    )(src, i);
    if (j !== undefined) {
      cb({ usage, times })
    }
    return j;
  }
}

function probeUsageOther(cb: (d: { usage: string }) => void = _ => { }): Probe {
  return (src: string, i: number) => {
    let usage = "";
    let j: number | undefined = seq(
      probeWhile(ch => ch != "\n", s => usage = s),
      proc(() => console.log("usage", usage)),
    )(src, i);
    if( j !== undefined ){
      cb({ usage: usage.trim() })
    }
    return j;
  }
}

function probeDrugIndex(): Probe {
  return seq(
    probeDigits(),
    probeNoKakuImmediate(")"),
  )
}

function drugTemplate(): Drug {
  return {
    name: "",
    amount: "",
    unit: "",
    drugComments: []
  };
}

function probeDrugGroup(cb: (drugGroup: DrugGroup) => void = _ => { }): Probe {
  return (src: string, i: number) => {
    let dg: DrugGroup = {
      drugs: [],
      usage: { kind: "other", usage: "" },
      groupComments: []
    };
    let drug: Drug = drugTemplate();
    let j: number | undefined = seq(
      proceedSpaces(),
      probeDrugIndex(),
      proceedSpaces(),
      seq(probeDrugNameAndAmount(d => {
        drug.name = d.name, drug.amount = d.amount, drug.unit = d.unit
      }), blankLineEnd()),
      proc(() => {
        dg.drugs.push(drug);
        drug = drugTemplate();
      }),
      seq(probeSpaces(), or(
        probeUsageDays(d => dg.usage = { kind: "days", days: d.days, usage: d.usage }),
        probeUsageTimes(d => dg.usage = { kind: "times", times: d.times, usage: d.usage }),
        probeUsageOther(d => dg.usage = { kind: "other", usage: d.usage }),
      ), blankLineEnd()),
      peek(or(
        probeEndOfSource(),
        probeDrugIndex(),
        probeNonSpaces(),
      )),
    )(src, i);
    if (j !== undefined) {
      cb(dg);
    }
    return j;
  }
}

function probeShohouCommand(cb: (s: string) => void = _ => { }): Probe {
  return (src: string, i: number) => {
    let command = "";
    let j: number | undefined = seq(
      probeNoKakuImmediate("@"),
      proceedWhile(ch => ch != "\n", s => command = s),
      probeEol(),
    )(src, i);
    if (j !== undefined) {
      cb(command);
    }
    return j;
  }
}

function parseCommand(command: string): { key: string, value: string } {
  let key: string;
  let value: string;
  let i: number;
  i = command.indexOf(":");
  if (i < 0) {
    i = command.indexOf("：");
  }
  if (i >= 0) {
    key = command.substring(0, i);
    value = command.substring(i + 1);
  } else {
    key = command;
    value = "";
  }
  return { key, value };
}

function handleShohouCommand(shohou: Shohou, command: string) {
  let cmd = parseCommand(command);
  switch (cmd.key) {
    case "memo": {
      shohou.bikou.push(cmd.value);
      break;
    }
    case "有効期限": {
      shohou.kigen = DateWrapper.from(cmd.value).asSqlDate();
      break;
    }
    default: {
      throw new Error(`unknown command: ${command}`)
    }
  }
}

export function parseShohou(src: string, debug: boolean): Shohou {
  const shohou: Shohou = {
    groups: [],
    // shohouComments: [],
    bikou: [],
  };
  const shohouCommands: string[] = [];
  let j: number | undefined = seq(
    probePrologLines(),
    repeat(probeDrugGroup(dg => shohou.groups.push(dg))),
    repeat(probeBlankLine()),
    repeat(probeShohouCommand(s => shohouCommands.push(s))),
    repeat(probeBlankLine()),
  )(src, 0);
  if (j === undefined || j != src.length) {
    alert("処方箋の解析に失敗しました。");
    if (j !== undefined) {
      console.log("rest", src.substring(j));
    }
    throw new Error("failed to parse shohou");
  }
  if (j !== undefined) {
    shohouCommands.forEach(c => handleShohouCommand(shohou, c));
    console.log("shohou", shohou, shohouCommands,)
  }
  return shohou;
}