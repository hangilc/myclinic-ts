export function sqlDateToDate(sqlDate: string): Date {
  const year = parseInt(sqlDate.substring(0, 4));
  const month = parseInt(sqlDate.substring(5, 7)) - 1;
  const day = parseInt(sqlDate.substring(8, 10));
  return new Date(year, month, day);
}
