export function parseShohou(text: string) {
  let end = seq(
    prolog(),
    repeat(whitespaces()),
  )
  (text, 0);
  console.log(end)
}


function prolog(): Tokenizer {
  return seq(
    or(
      matches("Rp)"),
      matches("Ｒｐ）"),
    ),
    whitespaces(),
    eol(),
  );
}

function drugGroup(): Tokenizer {
  return seq(
    groupIndex(),
    // drugNameAndAmount(console.log, console.log),
  )
}

function groupIndex(cb?: Callback): Tokenizer {
  return seq(
    whitespaces(),
    // digits(cb),
    // or(matches(")"), matches("）"))
  );
}

function drugNameAndAmount(nameCallback: Callback, amountCallback: Callback): Tokenizer {
  return seq(
    whitespaces(),
    nonWhitespaces(console.log),
    eol(),
  );
}

type Tokenizer = (src: string, start: number) => number[];
type Callback = (m: string) => void;

function eolOrEof(): Tokenizer {
  return or(eof(), eol());
}

function eof(): Tokenizer {
  return (src: string, start: number): number[] => {
    if (src.length === start) {
      return [start];
    } else {
      return [];
    }

  }
}

function isWhitespace(ch: string): boolean {
  return ch === " " || ch === "\t" || ch === "　";
}

function whitespaces(): Tokenizer {
  return eatWhile(isWhitespace);
}

function nonWhitespaces(cb?: Callback): Tokenizer {
  return eatWhile(ch => !isWhitespace(ch));
}

function digits(cb?: Callback): Tokenizer {
  return eatWhile(ch => (ch >= "0" && ch <= "9") || (ch >= "１" && ch <= "９"), cb);
}

function matches(s: string | RegExp, cb?: Callback): Tokenizer {
  if (typeof s === "string") {
    return matchesString(s, cb);
  } else {
    return matchesRegExp(s, cb);
  }
}

function matchesString(s: string, cb?: Callback): Tokenizer {
  return (src: string, start: number): number[] => {
    if (src.substring(start).startsWith(s)) {
      if (cb) { cb(s) }
      return [start + s.length];
    } else {
      return [];
    }
  }
}

function matchesRegExp(re: RegExp, cb?: Callback): Tokenizer {
  return (src: string, start: number): number[] => {
    const m = re.exec(src.substring(start));
    if (m) {
      if (m.index === 0) {
        if (cb) { cb(m[0]); }
        return [start + m[0].length];
      } else {
        return [];
      }
    } else {
      return [];
    }
  }
}

function eol(): Tokenizer {
  return or(matches("\n"), matches("\r\n"));
}

function seq(...tokenizers: Tokenizer[]): Tokenizer {
  return (src: string, start: number): number[] => {
    let from: number[] = [start];
    for (let tok of tokenizers) {
      let to: Set<number> = new Set();
      for(let start of from) {
        const ends = tok(src, start);
        ends.forEach(end => to.add(end));
      }
      from = Array.from(to);
    }
    return from;
  }
}

function or(...tokenizers: Tokenizer[]): Tokenizer {
  return (src: string, start: number): number[] => {
    const to: Set<number> = new Set();
    for (let tok of tokenizers) {
      const ends = tok(src, start);
      ends.forEach(end => to.add(end));
    }
    return Array.from(to);
  }
}

function repeat(tok: Tokenizer): Tokenizer {
  return (src: string, start: number): number[] => {
    const result: Set<number> = new Set([start]);
    let from: number[] = [start];
    let iter = 0;
    while (true) {
      if( iter++ > 100 ){
        throw new Error("too many repeat");
      }
      const to: number[] = [];
      let ends = tok(src, start);
      if( ends.length === 0 ){
        break;
      }
      result.push(...ends);
      from = ends;
    }
    return result;
  }
}

function nop(cb?: () => void): Tokenizer {
  return (src: string, start: number): number[] => {
    if( cb ){ cb(); }
    return [start];
  }
}

function eatWhile(pred: (ch: string) => boolean, cb?: Callback): Tokenizer {
  return repeat((src: string, start: number): number[] => {
    if( start < src.length ){
      const ch = src[start];
      if( pred(ch) ){
        return [start + 1];
      } else {
        return [];
      }
    } else {
      return [];
    }
  })
}

function optional(tok: Tokenizer): Tokenizer {
  return (src: string, start: number): number[] => {
    return [start, ...tok(src, start)];
  }
}
