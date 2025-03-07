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

export function drugCommandLine(): Parser<string> {
  return spaces(1)
    .then(immediateNoKaku("@"))
    .then(toEol().map(s => s.trim()))
}

export function groupCommandLine(): Parser<string> {
  return spaces(1)
    .then(immediateNoKaku("@"))
    .then(toEol().map(s => s.trim()))
}

export function shohouCommandLine(): Parser<string> {
  return immediateNoKaku("@")
    .then(repeatUntil(one(ch => true), eol(), (cs, _) => cs.join("").trim()));
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
  return { key, value: value.trim() };
}

function handleDrugCommand(drug: Drug, command: string) {
  const cmd = parseCommand(command);
  switch (cmd.key) {
    case "変更不可": {
      drug.senpatsu = "henkoufuka";
      break;
    }
    case "患者希望": {
      drug.senpatsu = "kanjakibou";
      break;
    }
    case "comment": {
      drug.drugComments.push(cmd.value);
      break;
    }
    default: {
      throw new Error(`unknown drug command: ${command}`);
    }
  }
}

function handleGroupCommand(drugGroup: DrugGroup, command: string) {
  const cmd = parseCommand(command);
  switch (cmd.key) {
    case "comment": {
      drugGroup.groupComments.push(cmd.value);
      break;
    }
    default: {
      throw new Error(`unknown group command: ${command}`)
    }
  }
}

function handleShohouCommand(shohou: Shohou, command: string) {
  let cmd = parseCommand(command);
  switch (cmd.key) {
    case "memo": {
      shohou.bikou.push(cmd.value);
      break;
    }
    case "有効期限": {
      shohou.kigen = DateWrapper.from(cmd.value.trim()).asSqlDate();
      break;
    }
    default: {
      throw new Error(`unknown command: ${command}`)
    }
  }
}

export function drugLines(): Parser<Drug> {
  return drugNameAndAmount()
    .skip(blankLineEnd())
    .chain(
      repeat(
        drugCommandLine()
      ),
      (nau, cs) => {
        const drug: Drug = {
          name: nau.name,
          amount: nau.amount,
          unit: nau.unit,
          drugComments: [],
        };
        cs.forEach(c => handleDrugCommand(drug, c));
        return drug;
      }
    )
}

export function drugsLines(): Parser<Drug[]> {
  return drugLines()
    .chain(
      repeat(
        spaces(1).then(drugLines())),
      (d, ds) => [d, ...ds]
    )
}

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
    .then(drugsLines())
    .chain(usageLine(), (ds, u) => ({
      drugs: ds,
      usage: u,
      groupComments: []
    }))
    .chain(
      repeat(groupCommandLine()),
      (dg, cs) => {
        cs.forEach(c => handleGroupCommand(dg, c));
        return dg;
      }
    )
}

export function prolog(): Parser<void> {
  return immediate("院外処方")
    .then(blankLineEnd())
    .then(immediateNoKaku("Rp)"))
    .then(blankLineEnd())
    .discard()
}

export function shohou(): Parser<Shohou> {
  return prolog()
    .then(repeat(drugGroup(), 1))
    .map((dgs) => ({
      groups: dgs,
      bikou: [],
    }))
    .chain(
      repeat(shohouCommandLine()),
      (s, cs) => {
        cs.forEach(c => handleShohouCommand(s, c));
        return s;
      }
    )
}

export function parseShohou(src: string, debug: boolean): Shohou {
  src = src.trim();
  src = src.replaceAll(/\n{2,}/g, "");
  const r = shohou().apply(src, 0);
  if (r !== undefined) {
    console.log("success", r.value);
    console.log("rest", src.substring(r.j, r.j + 20));
    return r.value;
  } else {
    console.log("failed");
    throw new Error("failed to parse shohou");
  }
}