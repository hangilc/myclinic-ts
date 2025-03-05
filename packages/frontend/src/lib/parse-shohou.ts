import { DateWrapper } from "myclinic-util";
import { toHankaku, toZenkaku } from "./zenkaku";

export interface Shohou {
  groups: DrugGroup[];
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

// type Probe = (src: string, i: number) => number | undefined;
// type Proceed = (src: string, i: number) => number;

// function seq(...probes: (Probe | Proceed)[]): Probe {
//   return (src: string, i: number) => {
//     for (let probe of probes) {
//       const j = probe(src, i);
//       if (j !== undefined) {
//         i = j;
//       } else {
//         return undefined;
//       }
//     }
//     return i;
//   }
// }

// function or(...probes: Probe[]): Probe {
//   return (src: string, i: number) => {
//     for (let probe of probes) {
//       let j = probe(src, i);
//       if (j !== undefined) {
//         return j;
//       }
//     }
//     return undefined;
//   }
// }

// function proceedWhile(f: (ch: string) => boolean, cb: (s: string) => void = _ => { },
//   matchCount: (matches: number) => void = _ => { }): Proceed {
//   return (src: string, i: number) => {
//     let acc = "";
//     let matches = 0;
//     while (i < src.length) {
//       if (f(src[i])) {
//         acc += src[i];
//         i += 1;
//         matches += 1;
//       } else {
//         break;
//       }
//     }
//     cb(acc);
//     matchCount(matches);
//     return i;
//   }
// }

// function probeWhile(f: (ch: string) => boolean, cb: (s: string) => void = _ => { }): Probe {
//   return (src: string, i: number) => {
//     let matches = 0;
//     let j: number | undefined = proceedWhile(f, cb, (n) => matches = n)(src, i);
//     if (j !== undefined && matches > 0) {
//       return j;
//     } else {
//       return undefined;
//     }
//   }
// }

// function repeat(item: Probe): Proceed {
//   return (src: string, i: number) => {
//     let j: number | undefined;
//     while (i < src.length) {
//       j = item(src, i);
//       if (j !== undefined) {
//         i = j;
//       } else {
//         return i;
//       }
//     }
//     return i;
//   }
// }

// function repeatUntil(item: Probe, cond: Probe): Probe {
//   return (src: string, i: number) => {
//     let j: number | undefined;
//     while (i < src.length) {
//       j = cond(src, i);
//       if (j !== undefined) {
//         return j;
//       }
//       j = item(src, i);
//       if (j === undefined) {
//         return undefined;
//       } else {
//         i = j;
//       }
//     }
//     return undefined;
//   }
// }

// function not(probe: Probe): Probe {
//   return (src: string, i: number) => {
//     let j: number | undefined = probe(src, i);
//     if (j !== undefined) {
//       return undefined;
//     } else {
//       return i;
//     }
//   }
// }

// function peek(probe: Probe): Probe {
//   return (src: string, i: number) => {
//     let j: number | undefined = probe(src, i);
//     if (j !== undefined) {
//       return i;
//     } else {
//       return undefined;
//     }
//   }
// }

// function isSpace(ch: string): boolean {
//   return ch === " " || ch === "　" || ch === "\t";
// }

// function proceedSpaces(cb: (s: string) => void = _ => { }): Proceed {
//   return proceedWhile(isSpace, cb);
// }

// function probeSpaces(cb: (s: string) => void = __ => { }): Probe {
//   return probeWhile(isSpace, cb);
// }

// function isNonSpace(ch: string): boolean {
//   return !isSpace(ch) && ch !== "\n";
// }

// function proceedNonSpaces(cb: (found: string) => void = _ => { }): Proceed {
//   return proceedWhile(isNonSpace, cb);
// }

// function probeNonSpaces(cb: (s: string) => void = _ => { }): Probe {
//   return probeWhile(isNonSpace, cb);
// }

// function probeEol(): Probe {
//   return (src: string, i: number) => {
//     if (i < src.length) {
//       const ch = src[i];
//       if (ch === "\n") {
//         return i + 1;
//       } else {
//         undefined;
//       }
//     } else if (i < src.length - 1) {
//       if (src[i] === "\r" && src[i + 1] == "\n") {
//         return i + 2;
//       } else {
//         return undefined;
//       }
//     } else {
//       return i;
//     }
//   }
// }

// // probes whether it is at start of line
// function probeSol(): Probe {
//   return (src: string, i: number) => {
//     if (i === 0) {
//       return i;
//     } else if (i >= 1) {
//       if (src[i - 1] === "\n") {
//         return i;
//       }
//     }
//     return undefined;
//   }
// }

// function ensureSol(): Probe {
//   return or(probeEol(), probeSol());
// }

// function probeEndOfSource(): Probe {
//   return (src: string, i: number) => {
//     if (i < src.length) {
//       return undefined;
//     } else {
//       return i;
//     }
//   }
// }

// function optional(probe: Probe): Probe {
//   return (src: string, i: number) => {
//     let j = probe(src, i);
//     if (j !== undefined) {
//       return j;
//     } else {
//       return i;
//     }
//   }
// }

// function blankLineEnd(): Probe {
//   return seq(proceedSpaces(), probeEol());
// }

// function probeImmediate(
//   immediate: string,
//   cb: (s: string) => void = _ => { },
//   conv: (chS: string, chI: string) => [string, string] = (s, i) => [s, i]
// ): Probe {
//   return (src: string, i: number) => {
//     let acc = "";
//     for (let imm of immediate) {
//       let chS = src[i];
//       let chI = imm;
//       [chS, chI] = conv(chS, chI);
//       if (chS === chI) {
//         acc += src[i];
//         i += 1;
//       } else {
//         return undefined;
//       }
//     }
//     cb(acc);
//     return i;
//   }
// }

// function probeNoCaseImmediate(immediate: string, cb: (s: string) => void = _ => { }): Probe {
//   return probeImmediate(immediate, cb, (chS, chI) => [chS.toLowerCase(), chI.toLowerCase()]);
// }

// function probeNoKakuImmediate(immediate: string, cb: (s: string) => void = _ => { }): Probe {
//   return probeImmediate(immediate, cb, (chS, chI) => [toHankaku(chS), toHankaku(chI)]);
// }

// function isDigit(ch: string): boolean {
//   ch = toHankaku(ch);
//   return "0" <= ch && ch <= "9";
// }

// function proceedDigits(cb: (found: string) => void = _ => { }): Proceed {
//   return proceedWhile(isDigit, cb);
// }

// function probeDigits(cb: (s: string) => void = _ => { }): Probe {
//   return probeWhile(isDigit, cb);
// }

// function probeFloat(cb: (s: string) => void = _ => { }): Probe {
//   return (src: string, i: number) => {
//     let digits = "";
//     let j: number | undefined = probeDigits(s => digits = s)(src, i);
//     if (j === undefined) {
//       return undefined;
//     }
//     if (src[j] === "." || src[j] === "．") {
//       digits += src[j];
//       j += 1;
//       j = probeDigits(s => digits += s)(src, j);
//       if (j === undefined) {
//         return undefined;
//       }
//     }
//     cb(digits);
//     return j;
//   }
// }

// function proc(f: (src: string, i: number) => void): Proceed {
//   return (src: string, i: number) => {
//     f(src, i);
//     return i;
//   }
// }

// function debug(name: string = "debug"): Probe {
//   return (src: string, i: number) => {
//     console.log(name, src.substring(i, i + 8));
//     return i;
//   }
// }

// function probeBlankLine(): Probe {
//   return seq(proceedSpaces(), probeEol());
// }


// function probePrologLines(): Probe {
//   return seq(
//     optional(
//       seq(probeImmediate("院外処方"), blankLineEnd())
//     ),
//     seq(probeNoKakuImmediate("Rp)"), blankLineEnd()),
//   )
// }


// const drugUnits = [
//   "錠",
//   "カプセル",
//   "ｇ",
//   "ｍｇ",
//   "包",
//   "ｍＬ",
//   "ブリスター",
//   "瓶",
//   "個",
//   "キット",
//   "枚",
//   "パック",
//   "袋",
//   "本",
// ];

// function probeDrugUnit(cb: (s: string) => void = _ => { }): Probe {
//   const probes: Probe[] = drugUnits.map(u => probeImmediate(u, cb));
//   return or(...probes);
// }


// function probeAmountAndUnit(cbAmount: (
//   cbAmount: string) => void = _ => { },
//   cbUnit: (unit: string) => void = _ => { }): Probe {
//   return (src: string, i: number) => {
//     let amount = "";
//     let unit = "";
//     let j: number | undefined = seq(probeFloat(s => amount = s), probeDrugUnit(s => unit = s))(src, i);
//     if (j !== undefined) {
//       cbAmount(amount);
//       cbUnit(unit);
//     }
//     return j;
//   }
// }

// function probeDrugNameAndAmount(cb: (d: { name: string, amount: string, unit: string }) => void = _ => { }): Probe {
//   return (src: string, i: number) => {
//     let name = "";
//     let amount = "";
//     let unit = "";
//     let j: number | undefined = repeatUntil(
//       seq(probeNonSpaces(s => name += s), probeSpaces(s => name += s)),
//       seq(probeAmountAndUnit(s => amount = s, s => unit = s), peek(blankLineEnd())),
//     )(src, i);
//     if (j !== undefined) {
//       cb({ name: name.trim(), amount, unit })
//     }
//     return j;
//   }
// }

// function probeUsageDays(cb: (d: { usage: string, days: string }) => void = _ => { }): Probe {
//   return (src: string, i: number) => {
//     let usage = "";
//     let days = "";
//     let j: number | undefined = repeatUntil(
//       seq(probeNonSpaces(s => usage += s), probeSpaces(s => usage += s)),
//       seq(probeDigits(s => days = s), probeImmediate("日分"), peek(blankLineEnd()))
//     )(src, i);
//     if (j !== undefined) {
//       cb({ usage, days })
//     }
//     return j;
//   }
// }

// function probeUsageTimes(cb: (d: { usage: string, times: string }) => void = _ => { }): Probe {
//   return (src: string, i: number) => {
//     let usage = "";
//     let times = "";
//     let j: number | undefined = repeatUntil(
//       seq(probeNonSpaces(s => usage += s), probeSpaces(s => usage += s)),
//       seq(probeDigits(s => times = s), probeImmediate("回分"), peek(blankLineEnd()))
//     )(src, i);
//     if (j !== undefined) {
//       cb({ usage, times })
//     }
//     return j;
//   }
// }

// function probeUsageOther(cb: (d: { usage: string }) => void = _ => { }): Probe {
//   return (src: string, i: number) => {
//     let usage = "";
//     let j: number | undefined = seq(
//       probeWhile(ch => ch != "\n", s => usage = s),
//     )(src, i);
//     if (j !== undefined) {
//       cb({ usage: usage.trim() })
//     }
//     return j;
//   }
// }

// function probeDrugIndex(): Probe {
//   return seq(
//     probeDigits(),
//     probeNoKakuImmediate(")"),
//   )
// }

// function probeDrugCommandLine(cb: (s: string) => void = _ => { }): Probe {
//   return (src: string, i: number) => {
//     let cmd = "";
//     let j: number | undefined = seq(
//       probeSpaces(),
//       probeNoKakuImmediate("@"),
//       probeWhile(ch => ch !== "\n", s => cmd = s),
//       probeEol(),
//     )(src, i);
//     if (j !== undefined) {
//       cb(cmd.trim());
//     }
//     return j;
//   }
// }

// function drugTemplate(): Drug {
//   return {
//     name: "",
//     amount: "",
//     unit: "",
//     drugComments: []
//   };
// }

// function handleDrugCommand(drug: Drug, command: string) {
//   const cmd = parseCommand(command);
//   switch (cmd.key) {
//     case "変更不可": {
//       drug.senpatsu = "henkoufuka";
//       break;
//     }
//     case "患者希望": {
//       drug.senpatsu = "kanjakibou";
//       break;
//     }
//     case "comment": {
//       drug.drugComments.push(cmd.value.trim());
//       break;
//     }
//     default: {
//       throw new Error(`unknown drug command: ${command}`);
//     }
//   }
// }

// function probeDrugLine(cb: (drug: Drug) => void): Probe {
//   return (src: string, i: number) => {
//     let drug: Drug = drugTemplate();
//     let drugCommands: string[] = [];
//     let j: number | undefined = seq(
//       seq(probeDrugNameAndAmount(d => {
//         drug.name = d.name, drug.amount = d.amount, drug.unit = d.unit
//       }), blankLineEnd()),
//       repeat(probeDrugCommandLine(s => drugCommands.push(s))),
//     )(src, i);
//     if (j !== undefined) {
//       drugCommands.forEach(c => handleDrugCommand(drug, c));
//       cb(drug);
//     }
//     return j;
//   }
// }

// function probeDrugGroup(cb: (drugGroup: DrugGroup) => void = _ => { }): Probe {
//   return (src: string, i: number) => {
//     let dg: DrugGroup = {
//       drugs: [],
//       usage: { kind: "other", usage: "" },
//       groupComments: []
//     };
//     let j: number | undefined = seq(
//       proceedSpaces(),
//       probeDrugIndex(),
//       proceedSpaces(),
//       probeDrugLine(drug => dg.drugs.push(drug)),
//       repeat(seq(probeSpaces(), probeDrugLine(drug => dg.drugs.push(drug)))),
//       seq(probeSpaces(), or(
//         probeUsageDays(d => dg.usage = { kind: "days", days: d.days, usage: d.usage }),
//         probeUsageTimes(d => dg.usage = { kind: "times", times: d.times, usage: d.usage }),
//         probeUsageOther(d => dg.usage = { kind: "other", usage: d.usage }),
//       ), blankLineEnd()),
//       peek(or(
//         probeEndOfSource(),
//         probeDrugIndex(),
//         probeNonSpaces(),
//       )),
//     )(src, i);
//     if (j !== undefined) {
//       cb(dg);
//     }
//     return j;
//   }
// }

// function probeShohouCommand(cb: (s: string) => void = _ => { }): Probe {
//   return (src: string, i: number) => {
//     let command = "";
//     let j: number | undefined = seq(
//       probeNoKakuImmediate("@"),
//       proceedWhile(ch => ch != "\n", s => command = s),
//       probeEol(),
//     )(src, i);
//     if (j !== undefined) {
//       cb(command);
//     }
//     return j;
//   }
// }

// function parseCommand(command: string): { key: string, value: string } {
//   let key: string;
//   let value: string;
//   let i: number;
//   i = command.indexOf(":");
//   if (i < 0) {
//     i = command.indexOf("：");
//   }
//   if (i >= 0) {
//     key = command.substring(0, i);
//     value = command.substring(i + 1);
//   } else {
//     key = command;
//     value = "";
//   }
//   return { key, value };
// }

// function handleShohouCommand(shohou: Shohou, command: string) {
//   let cmd = parseCommand(command);
//   switch (cmd.key) {
//     case "memo": {
//       shohou.bikou.push(cmd.value);
//       break;
//     }
//     case "有効期限": {
//       shohou.kigen = DateWrapper.from(cmd.value).asSqlDate();
//       break;
//     }
//     default: {
//       throw new Error(`unknown command: ${command}`)
//     }
//   }
// }

// export function parseShohouPrev(src: string, debug: boolean): Shohou {
//   console.log("src\n", src);
//   const shohou: Shohou = {
//     groups: [],
//     // shohouComments: [],
//     bikou: [],
//   };
//   const shohouCommands: string[] = [];
//   let j: number | undefined = seq(
//     probePrologLines(),
//     repeat(probeDrugGroup(dg => shohou.groups.push(dg))),
//     repeat(probeBlankLine()),
//     repeat(probeShohouCommand(s => shohouCommands.push(s))),
//     repeat(probeBlankLine()),
//   )(src, 0);
//   if (j === undefined || j != src.length) {
//     alert("処方箋の解析に失敗しました。");
//     if (j !== undefined) {
//       console.log("rest", src.substring(j));
//     }
//     throw new Error("failed to parse shohou");
//   }
//   if (j !== undefined) {
//     shohouCommands.forEach(c => handleShohouCommand(shohou, c));
//     console.log("shohou", shohou, shohouCommands,)
//   }
//   return shohou;
// }

// New Parser ///////////////////////////////////////////////////////////////

class SuccessResult<T> {
  j: number;
  value: T;

  constructor(j: number, value: T) {
    this.j = j;
    this.value = value;
  }
}


class Parser<T> {
  apply: (src: string, i: number) => SuccessResult<T> | undefined;

  constructor(apply: (src: string, i: number) => SuccessResult<T> | undefined) {
    this.apply = apply;
  }

  chain<U, S>(next: Parser<U>, comb: (t: T, u: U) => S): Parser<S> {
    const apply = this.apply;
    return new Parser((src, i) => {
      const r = apply(src, i);
      if (r !== undefined) {
        const u = next.apply(src, r.j);
        if (u !== undefined) {
          const v = comb(r.value, u.value);
          return success(u.j, v);
        } else {
          return failure();
        }
      } else {
        return failure();
      }
    })
  }

  then<U>(next: Parser<U>): Parser<U> {
    return this.chain(next, (_, u) => u);
  }

  skip<U>(next: Parser<U>): Parser<T> {
    return this.chain(next, (t, _) => t);
  }

  map<U>(f: (t: T) => U): Parser<U> {
    const apply = this.apply;
    return new Parser(
      (src, i) => {
        const rt = apply(src, i);
        if (rt === undefined) {
          return failure();
        } else {
          return success(rt.j, f(rt.value));
        }
      }
    )
  }

  discard(): Parser<void> {
    return this.map(_ => undefined);
  }

  debug(name: string = "debug"): Parser<T> {
    const apply = this.apply;
    return new Parser(
      (src, i) => {
        console.log(`enter ${name}:`, src.substring(i, i + 10));
        const r = apply(src, i);
        if (r !== undefined) {
          console.log(`success ${name}:`, r.value);
        } else {
          console.log(`failure ${name}`)
        }
        return r;
      }
    )
  }
}

function success<T>(j: number, value: T): SuccessResult<T> {
  return new SuccessResult(j, value);
}

function failure(): undefined {
  return undefined;
}


function immediate(s: string, conv: (ch: string) => string = ch => ch): Parser<string> {
  return new Parser(
    (src, i) => {
      if (src.length - i < s.length) {
        return failure();
      }
      for (let j = 0; j < s.length; j++) {
        if (conv(src[i + j]) !== conv(s[j])) {
          return failure();
        }
      }
      return success(i + s.length, s);
    }
  );
}

function immediateNoKaku(s: string): Parser<string> {
  return immediate(s, toHankaku);
}

function takeWhile(f: (ch: string) => boolean): Parser<string> {
  return new Parser(
    (src, i) => {
      let j = i;
      for (j = i; j < src.length; j++) {
        if (!f(src[j])) {
          break;
        }
      }
      return success(j, src.substring(i, j));
    }
  );
}

function repeatUntil<T, U, S>(item: Parser<T>, cond: Parser<U>, comb: (ts: T[], u: U) => S): Parser<S> {
  return new Parser(
    (src, i) => {
      const ts: T[] = [];
      while (true) {
        const rc = cond.apply(src, i);
        if (rc !== undefined) {
          return success(rc.j, comb(ts, rc.value))
        } else {
          const rt = item.apply(src, i);
          if (rt !== undefined) {
            ts.push(rt.value);
            i = rt.j;
          } else {
            return failure();
          }
        }
      }
    }
  );
}

function repeat<T>(item: Parser<T>, atLeast: number = 0): Parser<T[]> {
  return new Parser(
    (src, i) => {
      const ts: T[] = [];
      while (i < src.length) {
        const rt = item.apply(src, i);
        if (rt === undefined) {
          break;
        } else {
          ts.push(rt.value);
          i = rt.j;
        }
      }
      if (ts.length < atLeast) {
        return failure();
      } else {
        return success(i, ts);
      }
    }
  );
}

function or<T>(...items: Parser<T>[]): Parser<T> {
  return new Parser(
    (src, i) => {
      for (let item of items) {
        const rt = item.apply(src, i);
        if (rt !== undefined) {
          return success(rt.j, rt.value);
        }
      }
      return failure();
    }
  );
}

function peek<T>(item: Parser<T>): Parser<T> {
  return new Parser(
    (src, i) => {
      const r = item.apply(src, i);
      if (r === undefined) {
        return failure();
      } else {
        return success(i, r.value);
      }
    }
  )
}

function not<T>(item: Parser<T>): Parser<void> {
  return new Parser(
    (src, i) => {
      const r = item.apply(src, i);
      if (r !== undefined) {
        return failure();
      } else {
        return success(i, undefined);
      }
    }
  )
}

function opt<T>(item: Parser<T>): Parser<T[]> {
  return new Parser(
    (src, i) => {
      const r = item.apply(src, i);
      if (r !== undefined) {
        return success(r.j, [r.value]);
      } else {
        return success(i, []);
      }
    }
  )
}

function isSpace(ch: string): boolean {
  return ch === " " || ch === "　" || ch === "\t";
}

function isNonSpace(ch: string): boolean {
  return !(isSpace(ch) || ch == "\n");
}


function one(f: (ch: string) => boolean): Parser<string> {
  return new Parser(
    (src, i) => {
      if (f(src[i])) {
        return success(i + 1, src[i]);
      } else {
        return failure();
      }
    }
  );
}

function spaces(atLeast: number): Parser<string> {
  return repeat(one(isSpace), atLeast).map(ss => ss.join(""));
}

function nonSpaces(atLeast: number): Parser<string> {
  return repeat(one(isNonSpace), atLeast).map(ss => ss.join(""));
}

function end(): Parser<void> {
  return new Parser<void>(
    (src, i) => {
      if (i >= src.length) {
        return success(i, undefined);
      } else {
        return failure();
      }
    }
  )
}

export function eol(): Parser<string> {
  return new Parser(
    (src, i) => {
      if (i < src.length) {
        const ch = src[i];
        if (ch === "\n") {
          return success(i + 1, ch);
        } else {
          failure();
        }
      } else if (i < src.length - 1) {
        if (src[i] === "\r" && src[i + 1] == "\n") {
          return success(i + 2, "\r\n");
        } else {
          return failure();
        }
      } else {
        return success(i, "");
      }
    }
  )
}

function sol(): Parser<void> {
  return new Parser(
    (src, i) => {
      if (i === 0) {
        return success(i, undefined);
      } else if (i >= 1) {
        if (src[i - 1] === "\n") {
          return success(i, undefined);
        }
      }
      return failure();
    }
  )
}


function blankLineEnd(): Parser<string> {
  return spaces(0).chain(eol(), (a, b) => a + b);
}

function charsBeforeEol(): Parser<string> {
  return repeatUntil(one(ch => true), peek(eol()), (cs, _) => cs.join(""));
}

function toEol(): Parser<string> {
  return repeatUntil(one(ch => ch != "\n"), eol(), (cs, _) => cs.join(""));
}

function blankLine(): Parser<string> {
  return sol().then(blankLineEnd());
}

function isDigit(ch: string): boolean {
  ch = toHankaku(ch);
  return "0" <= ch && ch <= "9";
}

function str_concat(a: string, b: string): string {
  return a + b;
}

function digits(atLeast: number): Parser<string> {
  return repeat(one(isDigit), atLeast).map(ss => ss.join(""));
}

function float(): Parser<string> {
  return digits(1).chain(
    opt(immediateNoKaku(".").chain(digits(1), str_concat)),
    (s, ss) => s + ss.join("")
  );
}

function ignore(a: any, b: any): void {
  return undefined;
}

function keepRight<T>(a: any, b: T): T {
  return b;
}

let drugUnitStrings = [
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

const _drugUnit: Parser<string> = or(
  ...drugUnitStrings.map(s => immediate(s, toZenkaku).map(toZenkaku))
);

function drugUnit(): Parser<string> {
  return _drugUnit;
}

function drugCommentLine(): Parser<string> {
  return spaces(1)
    .then(immediateNoKaku("@"))
    .then(toEol().map(s => s.trim()))
}

export function drugIndex(): Parser<void> {
  return spaces(0)
    .then(digits(1))
    .then(immediateNoKaku(")"))
    .discard();
}

export function drugNameAndAmount(): Parser<{ name: string, amount: string, unit: string }> {
  return repeatUntil(
    nonSpaces(1).chain(spaces(1), (s, ss) => s + ss),
    float().chain(drugUnit(), (amount, unit) => ({ amount, unit })).skip(peek(blankLineEnd())),
    (ns, au) => ({
      name: ns.join("").trim(),
      amount: au.amount,
      unit: au.unit,
    })
  )
}

export function drugLines(): Parser<Drug[]> {
  return drugNameAndAmount().skip(blankLineEnd())
    .chain(
      repeat(
        spaces(1).then(drugNameAndAmount().skip(blankLineEnd()))
      ),
      (d, ds) => [d, ...ds]
    ).map(list => {
      const drugs: Drug[] = list.map(obj => (
        {
          name: obj.name,
          amount: obj.amount,
          unit: obj.unit,
          drugComments: [],
        }
      ));
      return drugs;
    });
}

// function drugLines(): Parser<Drug> {
//   return repeatUntil(
//     nonSpaces(1).chain(spaces(1), (s, ss) => s + ss),
//     float().chain(drugUnit(), (amount, unit) => ({ amount, unit })).skip(blankLineEnd()),
//     (ns, au) => ({
//       name: ns.join("").trim(),
//       amount: au.amount,
//       unit: au.unit,
//       drugComments: []
//     })
//   ).chain(
//     repeat(drugCommentLine()),
//     (drug, comms) => Object.assign(drug, { drugComments: comms })
//   )
// }

export function daysUsage(): Parser<{ usage: string, days: string, kind: "days" }> {
  return repeatUntil(
    nonSpaces(1).chain(spaces(1), str_concat),
    digits(1).skip(immediate("日分")).skip(peek(blankLineEnd())),
    (ss, days) => ({ usage: ss.join("").trim(), days, kind: "days" })
  )
}

export function timesUsage(): Parser<{ usage: string, times: string, kind: "times" }> {
  return repeatUntil(
    nonSpaces(1).chain(spaces(1), str_concat),
    digits(1).skip(immediate("回分")).skip(peek(blankLineEnd())),
    (ss, times) => ({ usage: ss.join("").trim(), times, kind: "times" })
  )
}

export function otherUsage(): Parser<{ usage: string, kind: "other" }> {
  return repeatUntil(one(ch => true), peek(eol()), (cs, _) => ({
    kind: "other",
    usage: cs.join("")
  }))
}

export function usageLine(): Parser<Usage> {
  return spaces(1)
    .then(or<Usage>(
      daysUsage(), timesUsage(), otherUsage()
    ))
    .skip(blankLineEnd());
}

export function drugGroup(): Parser<DrugGroup> {
  return spaces(0)
    .skip(drugIndex())
    .skip(spaces(0))
    .then(drugLines())
    .chain(usageLine(), (ds, u) => ({
      drugs: ds,
      usage: u,
      groupComments: []
    }));
}

export function prolog(): Parser<void> {
  return immediate("院外処方")
    .then(blankLineEnd())
    .then(immediateNoKaku("Rp)"))
    .then(blankLineEnd())
    .discard()
}

export function shohouCommentLine(): Parser<string> {
  return immediateNoKaku("@")
    .then(repeatUntil(one(ch => true), eol(), (cs, _) => cs.join("")));
}

export function shohou(): Parser<Shohou> {
  return prolog()
    .then(repeat(drugGroup(), 1))
    .map((dgs) => ({
      groups: dgs,
      bikou: [],
    }))
}

// function epilog(): Parser<string[]> {
//   return repeat(
//     immediateNoKaku("@")
//       .then(toEol().map(s => s.trim()))
//   )
// }

// function parser(): Parser<Drug[][]> {
//   return prolog()
//     .then(repeat(drugGroup()))
//     .chain(epilog(), (ds, cs) => ds)
//     .skip(repeat(blankLine()))
// }

// export function parseShohou(src: string, debug: boolean): Shohou {
//   const shohou: Shohou = {
//     groups: [],
//     // shohouComments: [],
//     bikou: [],
//   };
//   const r = parser().apply(src, 0);
//   if (r !== undefined) {
//     console.log("success", r.value);
//     console.log("rest", src.substring(r.j, r.j + 20));
//   } else {
//     console.log("failed");
//   }
//   return shohou;
// }