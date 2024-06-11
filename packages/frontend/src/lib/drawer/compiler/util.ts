export function sumOfNumbers(ns: number[]): number {
  return ns.reduce((acc, ele) => acc + ele, 0);
}

export function requiredHeight(nlines: number, fontSize: number, leading: number = 0): number {
  return nlines * fontSize + Math.max(0, nlines - 1) * leading;
}
