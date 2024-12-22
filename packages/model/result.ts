export type Result<T> = ({
  ok: true;
  value: T;
} | {
  ok: false;
  message: string;
}) & {
  unwrap: () => T;
  expect: (msg: string) => T;
}

export function ok<T>(value: T): Result<T> {
  return { ok: true, value, unwrap: () => value, expect: () => value };
}

export function error<T>(message: string): Result<T> {
  return { 
    ok: false,
    message,
    unwrap: () => { throw new Error(message); },
    expect: (msg) => { throw new Error(msg) },
  }
}
