import type { PrescInfoData, 公費レコード } from "../denshi-shohou/presc-info";

export class KouhiSet {
  kouhi1?: 公費レコード;
  kouhi2?: 公費レコード;
  kouhi3?: 公費レコード;
  kouhiSpecial?: 公費レコード;

  constructor(src: { 第一公費レコード?: 公費レコード, 第二公費レコード?: 公費レコード, 第三公費レコード?: 公費レコード, 特殊公費レコード?: 公費レコード }) {
    this.kouhi1 = src.第一公費レコード;
    this.kouhi2 = src.第二公費レコード;
    this.kouhi3 = src.第三公費レコード;
    this.kouhiSpecial = src.特殊公費レコード;
  }

  static fromPrescInfoData(data: PrescInfoData): KouhiSet {
    return new KouhiSet(data);
  }

  isEmpty(): boolean {
    return !this.kouhi1 && !this.kouhi2 && !this.kouhi3 && !this.kouhiSpecial;
  }

  kouhi1Label(): string {
    if( this.kouhi2 || this.kouhi3 || this.kouhiSpecial ){
      return "第一公費";
    } else {
      return "公費";
    }
  }
}
