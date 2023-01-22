import * as kanjidate from "kanjidate";

export class DateFormValues {
  gengou: string;
  nen: string;
  month: string;
  day: string;

  constructor(date: Date | null, defaultGengou: string){
    [this.gengou, this.nen] = this.resolveGengouNen(date, defaultGengou);
    this.month = date ? (date.getMonth() + 1).toString() : "";
    this.day = date ? date.getDate().toString() : "";
  }

  resolveGengouNen(date: Date | null, defaultGengou: string): [string, string] {
    if( date === null ){
      return [defaultGengou, ""];
    } else {
      const k = new kanjidate.KanjiDate(date);
      return [k.gengou, k.nen.toString()];
    }
  }
}
