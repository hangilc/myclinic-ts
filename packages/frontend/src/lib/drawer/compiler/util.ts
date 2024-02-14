export function sumOfNumbers(ns: number[]): number {
  return ns.reduce((acc, ele) => acc + ele, 0);
}

export function requiredHeight(nlines: number, fontSize: number): number {
  return nlines * fontSize;
}
