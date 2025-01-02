import { DateWrapper, lastDayOfMonth } from "myclinic-util";

export class DateItem {
  constructor(
    public date: Date,
    public kind: string,
    public isCurrent: boolean,
  ) {}
}

export function listDateItems(
  date: Date
): DateItem[] {
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();
  let firstDate = new Date(year, month - 1, 1);
  let pres: DateItem[] = preDateItems(firstDate);
  let curs: DateItem[] = curDateItems(
    firstDate,
    lastDayOfMonth(year, month),
    day
  );
  let posts: DateItem[] = postDateItems(
    new Date(year, month - 1, lastDayOfMonth(year, month))
  );
  return [...pres, ...curs, ...posts];
}

function preDateItems(firstDate: Date): DateItem[] {
  let dow = firstDate.getDay();
  let npre: number = dow === 0 ? 7 : dow;
  let preItems: DateItem[] = [];
  for (let i = 1; i <= npre; i++) {
    // let d: Date = kanjidate.addDays(firstDate, -i);
    let d: Date = DateWrapper.from(firstDate).incDay(-i).asDate();
    preItems.push(new DateItem(d, "pre", false));
  }
  return preItems.reverse();
}

function curDateItems(
  firstDate: Date,
  n: number,
  curDay: number
): DateItem[] {
  let items: DateItem[] = [];
  for (let i = 1; i <= n; i++) {
    // let d = kanjidate.addDays(firstDate, i - 1);
    let d = DateWrapper.from(firstDate).incDay(i - 1).asDate();
    items.push(new DateItem(d, "cur", i === curDay));
  }
  return items;
}

function postDateItems(lastDate: Date): DateItem[] {
  let dow = lastDate.getDay();
  let n = dow === 6 ? 7 : 6 - dow;
  let items: DateItem[] = [];
  for (let i = 1; i <= n; i++) {
    // let d = kanjidate.addDays(lastDate, i);
    let d = DateWrapper.from(lastDate).incDay(i).asDate();
    items.push(new DateItem(d, "post", false));
  }
  return items;
}
