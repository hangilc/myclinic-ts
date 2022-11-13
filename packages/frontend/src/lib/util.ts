export function padNumber(n: number, finalSize: number){
  let s = n.toString();
  while( s.length < finalSize ){
    s = "0" + s
  }
  return s;
}

export function dateToSql(d: Date): string {
  const year: number = d.getFullYear();
  const month: number = d.getMonth() + 1;
  const day: number = d.getDate();
  return `${padNumber(year, 4)}-${padNumber(month, 2)}-${padNumber(day, 2)}`;
}

export function timeToSql(d: Date): string {
  const hours: number = d.getHours();
  const minutes: number = d.getMinutes();
  const seconds: number = d.getSeconds();
  return `${padNumber(hours, 2)}:${padNumber(minutes, 2)}:${padNumber(seconds, 2)}`
}

export function dateTimeToSql(d: Date): string {
  return `${dateToSql(d)} ${timeToSql(d)}`;
}

export function sexRep(sex: string): string {
  switch(sex){
    case "M": return "男";
    case "F": return "女";
    default: return "??";
  }
}
