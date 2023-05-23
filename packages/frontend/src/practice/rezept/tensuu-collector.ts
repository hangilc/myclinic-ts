import { 負担区分コードRev, type 負担区分コードCode } from "./codes";

export class TensuuCollector {
  hokenTen: number = 0;
  kouhiTen: number[];
  souten: number = 0;

  constructor(nhoken: number) {
    this.kouhiTen = [];
    for(let i=0;i<nhoken;i++){
      this.kouhiTen.push(0);
    }
  }

  add(futanKubun: 負担区分コードCode, ten: number): void {
    const key = 負担区分コードRev.get(futanKubun)!;
    key.split("").forEach(c => {
      if( c === "H" ){
        this.hokenTen += ten;
      } else {
        const i = parseInt(c) - 1;
        this.kouhiTen[i] += ten;
      }
      if( c === "H" || c === "1" ){
        this.souten += ten;
      }
    })
  }
}