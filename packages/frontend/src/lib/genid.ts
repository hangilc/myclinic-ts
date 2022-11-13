let id = 1;

export function genid(prefix: string = "genid-"): string {
  return `${prefix}${id++}`;
}
