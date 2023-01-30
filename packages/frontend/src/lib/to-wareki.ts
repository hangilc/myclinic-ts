import { dateToSql } from "./util";

export function toWareki(date: Date | string): [string, number] {
  if( typeof date !== "string" ){
    date = dateToSql(date);
  }
  const year = parseInt(date);
  if( date >= "2019-05-01" ){
    return ["令和", year - 2019 + 1];
  } else if( date >= "1989-01-08" ){
    return ["平成", year - 1989 + 1];
  } else if( date >= "1926-12-25" ){
    return ["昭和", year - 1926 + 1];
  } else if( date >= "1912-07-30" ) {
    return ["大正", year - 1912 + 1];
  } else if( date >= "1873-01-01" ) {
    return ["明治", year - 1868 + 1]
  } else {
    return ["西暦", year];
  }

  return ["昭和", 46];
}