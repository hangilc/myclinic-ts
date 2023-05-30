export class Santeibi {
  map: Record<number, number> = {};

  add(sqldate: string): void {
    const d = parseInt(sqldate.substring(8, 10));
    if( d in this.map ){
      this.map[d] += 1;
    } else {
      this.map[d] = 1;
    }
  }

  getSum(): number {
    return Object.values(this.map).reduce((acc, ele) => acc + ele, 0);
  }

  getSanteibiMap(): Record<number, number> {
    return this.map;
  }
}