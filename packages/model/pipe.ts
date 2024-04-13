export function pipe<A1, R>(f1: (arg: A1) => R): (arg: A1) => R;
export function pipe<A1, A2, R>(f1: (arg: A1) => A2, f2: (arg: A2) => R): (arg: A1) => R;
export function pipe<A1, A2, A3, R>(f1: (arg: A1) => A2, f2: (arg: A2) => A3,
  f3: (arg: A3) => R): (arg: A1) => R;
export function pipe<A1, A2, A3, A4, R>(f1: (arg: A1) => A2, f2: (arg: A2) => A3,
  f3: (arg: A3) => A4, f4: (arg: A4) => R): (arg: A1) => R;
export function pipe<A1, A2, A3, A4, A5, R>(f1: (arg: A1) => A2, f2: (arg: A2) => A3,
  f3: (arg: A3) => A4, f4: (arg: A4) => A5, f5: (arg: A5) => R): (arg: A1) => R;
export function pipe<A1, A2, A3, A4, A5, A6, R>(f1: (arg: A1) => A2, f2: (arg: A2) => A3,
  f3: (arg: A3) => A4, f4: (arg: A4) => A5, f5: (arg: A5) => A6,
  f6: (arg: A6) => R): (arg: A1) => R;
export function pipe<A1, A2, A3, A4, A5, A6, A7, R>(f1: (arg: A1) => A2, f2: (arg: A2) => A3,
  f3: (arg: A3) => A4, f4: (arg: A4) => A5, f5: (arg: A5) => A6,
  f6: (arg: A6) => A7, f7: (arg: A7) => R): (arg: A1) => R;
export function pipe<A1, A2, A3, A4, A5, A6, A7, A8, R>(f1: (arg: A1) => A2, f2: (arg: A2) => A3,
  f3: (arg: A3) => A4, f4: (arg: A4) => A5, f5: (arg: A5) => A6,
  f6: (arg: A6) => A7, f7: (arg: A7) => A8, f8: (arg: A8) => R): (arg: A1) => R;
export function pipe<A1, A2, A3, A4, A5, A6, A7, A8, A9, R>(f1: (arg: A1) => A2, f2: (arg: A2) => A3,
  f3: (arg: A3) => A4, f4: (arg: A4) => A5, f5: (arg: A5) => A6,
  f6: (arg: A6) => A7, f7: (arg: A7) => A8, f8: (arg: A8) => A9,
  f9: (arg: A9) => R): (arg: A1) => R;
export function pipe<A1, A2, A3, A4, A5, A6, A7, A8, A9, A10, R>(f1: (arg: A1) => A2, f2: (arg: A2) => A3,
  f3: (arg: A3) => A4, f4: (arg: A4) => A5, f5: (arg: A5) => A6,
  f6: (arg: A6) => A7, f7: (arg: A7) => A8, f8: (arg: A8) => A9,
  f9: (arg: A9) => A10, f10: (arg: A10) => R): (arg: A1) => R;

export function pipe(...fs: ((arg: any) => any)[]): (arg: any) => any {
  return (arg: any) => fs.reduce((acc, f) => f(acc), arg);
}