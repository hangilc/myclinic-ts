const starters = ["●", "★"]
const endregex = new RegExp(`^([^${starters.join("")}]|$)`, "m");

export function hasHikitsugi(s: string): boolean {
  if( s.length === 0 ){
    return false;
  } else {
    const c = s.substring(0, 1);
    return starters.indexOf(c) >= 0;
  }
}

export function extractHikitsugi(s: string): string {
  const m = endregex.exec(s);
  if( m == null || m.length === 0 ){
    return s;
  } else {
    console.dir(m);
    return s.substring(0, m.index);
  }
}