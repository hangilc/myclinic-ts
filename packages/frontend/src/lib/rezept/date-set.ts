export class DateSet {
  set: string[] = [];

  add(sqldate: string): void {
    if( sqldate.length > 10 ){
      sqldate = sqldate.substring(0, 10);
    }
    if( !this.set.includes(sqldate) ){
      this.set.push(sqldate);
    }
  }

  get length(): number {
    return this.set.length;
  }
}
