import type { DrawerCompiler, Line } from "@/lib/drawer-compiler/drawer-compiler";
import type { TextVariant } from "@/lib/drawer-compiler/text-variant";

const map: Record<string, (comp: DrawerCompiler) => Line> = {
  "ten_thousand_per_ul": (comp) => [
    "x10",
    comp.str("4", { font: "small-entry", dy: -1.2, padRight: 1.0 }),
    "/μL",
  ]
}

const re = new RegExp(
  Object.keys(map).join("|")
);

export function convLine(line: string, c: DrawerCompiler): Line {
  console.log(re);
  let start = 0;
  const result: (string | TextVariant)[] = [];
  while(true){
    const sub = line.substring(start);
    const m = re.exec(line.substring(start));
    if( m ){
      console.log(m);
      if( m.index > 0 ){
        result.push(sub.substring(0, m.index));
      }
      const k = m[0];
      result.push(...(map[k](c)));
      start += m.index + k.length;
    } else {
      result.push(sub);
      break;
    }
  }
  return result;
}