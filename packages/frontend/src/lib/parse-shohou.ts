export function parseShohou(text: string) {
  console.log("text", text);
  let end = seq(
    prolog(),
    groupIndex(),
    whitespaces(),
    drugNameAndAmount(),
    whitespaces(),
    eol(),
  )
    (text, 0);
  console.log("end", end ? text.substring(0, end) : "");
}

function prolog(): Tokenizer {
  return seq(
    or(
      str("Rp)"),
      str("Ｒｐ）"),
    ),
    whitespaces(),
    eol(),
  );
}

function groupIndex(): Tokenizer {
  return seq(
    whitespaces(),
    digits(),
    or(str(")"), str("）"))
  )
}

function drugNameAndAmount(): Tokenizer {
  return (src: string, start: number): number | undefined => {
    let name = "";
    let end = nonWhitespaces()(src, start);
    if (end === undefined) {
      return undefined;
    }
    name += src.substring(start, end);
    start = end;
    end = whitespaces()(src, start);
    if (end === undefined) {
      return undefined;
    }
    start = end;
    end = drugAmount()(src, start);
    if (end === undefined) {
      return undefined;
    }
    start = end;
    return start;
  }
}

function drugAmount(): Tokenizer {
  return (src: string, start: number): number | undefined => {
    return seq(
      digits(1),
      optional(
        seq(
          or(str("."), str("．")),
          digits(1),
        )
      ),
      drugUnit()
    )(src, start);
  }
}

function drugUnit(): Tokenizer {
  return or(
    str("錠"), str("カプセル"), str("ｇ"), str("ｍｇ"), str("包"), str("ｍＬ"), str("ブリスター"),
    str("瓶"), str("個"), str("キット"), str("枚"), str("パック"), str("袋"), str("本"),
  )
}

type Tokenizer = (src: string, start: number) => number | undefined;

function str(s: string): Tokenizer {
  return (src: string, start: number): number | undefined => {
    if (src.substring(start).startsWith(s)) {
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

function one(pred: (ch: string) => boolean): Tokenizer {
  return (src: string, start: number): number | undefined => {
    if (start < src.length) {
      const ch = src[start];
      if (pred(ch)) {
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

function repeat(tok: Tokenizer, atLeast: number = 0, atMost: number | undefined = undefined): Tokenizer {
  return (src: string, start: number): number | undefined => {
    let iter = 0;
    while (true) {
      let end = tok(src, start);
      if (end === undefined) {
        if (iter >= atLeast) {
          return start;
        } else {
          return end;
        }
      }
      start = end;
      iter += 1;
      if (iter === atMost) {
        return start;
      }
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

function whitespaces(atLeast: number = 0, atMost: number | undefined = undefined): Tokenizer {
  return repeat(one(isWhitespace), atLeast, atMost);
}

function nonWhitespaces(atLeast: number = 0, atMost: number | undefined = undefined): Tokenizer {
  return repeat(one(ch => !isWhitespace(ch)), atLeast, atMost);
}

function isDigit(ch: string): boolean {
  return (ch >= "0" && ch <= "9") || (ch >= "１" && ch <= "９");
}

function digits(atLeast: number = 0, atMost: number | undefined = undefined): Tokenizer {
  return repeat(one(isDigit), atLeast, atMost);
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
