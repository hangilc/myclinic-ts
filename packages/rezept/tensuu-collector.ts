import { 負担区分コードRev, type 負担区分コードCode } from "./codes";

export class TensuuCollector {
  totalTen: Map<負担区分コードCode, number> = new Map();

  add(futanKubun: 負担区分コードCode, ten: number): void {
    if (this.totalTen.has(futanKubun)) {
      this.totalTen.set(futanKubun, this.totalTen.get(futanKubun)! + ten);
    } else {
      this.totalTen.set(futanKubun, ten);
    }
  }

  getHokenTotal(): number {
    return this.reduce(key => key.includes("H"));
  }

  getKouhiTotals(): number[] {
    let totals = [0, 0, 0, 0];
    this.traverse((key, ten) => {
      console.log("key", key, ten);
      for (let i = 1; i <= 4; i++) {
        if (key.includes(i.toString())) {
          totals[i - 1] += ten;
        }
      }
    })
    return totals;
  }

  getRezeptSouten(): number {
    return this.reduce(key => key.includes("H") || key.includes("1"));
  }

  traverse(handler: (key: string, ten: number) => void): void {
    for (let key of this.totalTen.keys()) {
      const ten = this.totalTen.get(key)!;
      const name: string = 負担区分コードRev.get(key)!;
      handler(name, ten);
    }
  }

  reduce(filter: (key: string) => boolean): number {
    let acc = 0;
    this.traverse((key, ten) => {
      if (filter(key)) {
        acc += ten;
      }
    })
    return acc;
  }
}
