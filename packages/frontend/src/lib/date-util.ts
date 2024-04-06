export function sqlDateToDate(sqlDate: string): Date {
  const year = parseInt(sqlDate.substring(0, 4));
  const month = parseInt(sqlDate.substring(5, 7)) - 1;
  const day = parseInt(sqlDate.substring(8, 10));
  return new Date(year, month, day);
}

export function incMonth(date: Date, amount: number): Date {
  date = new Date(date);
  const day = date.getDate();
  date.setDate(1);
  date.setMonth(date.getMonth() + amount);
  const lastDay = lastDayOfMonth(date.getFullYear(), date.getMonth()+1);
  if( day > lastDay ){
    date.setDate(lastDay);
  } else {
    date.setDate(day);
  }
  return date;
}

export function convertToLastDateOfMonth(date: Date): Date {
  date = new Date(date);
  const lastDay = lastDayOfMonth(date.getFullYear(), date.getMonth() + 1);
  date.setDate(lastDay);
  return date;
}

export function lastDayOfMonth(year: number, month: number): number {
  const d = new Date(year, month, 1);
  d.setDate(d.getDate() - 1);
  return d.getDate();
}

export function incDay(date: Date, amount: number): Date {
  date = new Date(date);
  date.setDate(date.getDate() + amount);
  return date;
}