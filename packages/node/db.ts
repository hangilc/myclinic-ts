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

export function coerceRow(row: any): any {
  const obj: any = {};
  for(let k in row){
    obj[snakeToCamel(k)] = row[k];
  }
  return obj;
}