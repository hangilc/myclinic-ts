export function range_from_one_upto(upto: number): number[] {
  return Array.from(new Array(upto), (_, i) => i + 1);
}

export function range(end: number): number[] {
  return Array.from(new Array(end), (_, i) => i);
}