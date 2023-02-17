export function fromToTime(from: string): string {
  return from + ":00";
}

export function untilToTime(until: string): string {
  return fromToTime(until);
}