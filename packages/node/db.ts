function capitalize(s: string): string {
  if( s.length === 0 ){
    return s;
  } else {
    return s[0].toUpperCase() + s.substring(1);
  }
}

function snakeToCamel(snake: string): string {
  const ps = snake.split("_")
  const head = ps[0];
  const tail = ps.splice(1).map(s => capitalize(s));
  tail.unshift(head);
  return tail.join("");
}

export function coerceRow(row: any, override: Record<string, string> = {}): any {
  const obj = {};
  for(let k in row){
    if( k in override ){
      obj[override[k]] = row[k];
    } else {
      obj[snakeToCamel(k)] = row[k];
    }
  }
  return obj;
}

export function coerceShahokokuho(row: any): any {
  return coerceRow(row, { kourei: "koureiStore", honnin: "honninStore" });
}
