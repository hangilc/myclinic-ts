export function sumOfNumbers(ns: number[]): number {
  return ns.reduce((acc, ele) => acc + ele, 0);
}
