export function range_from_one_upto(upto: number): number[] {
  return Array.from(new Array(upto), (_, i) => i + 1);
}