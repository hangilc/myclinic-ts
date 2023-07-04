import type { 診療識別コードCode, 負担区分コードCode } from "./codes";
import { mk医薬品レコード, type 医薬品レコードData } from "./records/iyakuhin-record";
import type { Santeibi } from "./santeibi";
import { shochiYakuzaiKingakuToTen, withClassified, withClassifiedBy } from "./helper";
import { Combiner, type TekiyouItem } from "./tekiyou-item";
import { RezeptIyakuhinMaster, RezeptVisit } from "rezept-types";

class SingleConductUnit implements TekiyouItem {
  readonly isSingleItem = true;
  shikibetsu: 診療識別コードCode;
  futanKubun: 負担区分コードCode;
  master: RezeptIyakuhinMaster;
  amount: number;

  constructor(shikibetsu: 診療識別コードCode, futanKubun: 負担区分コードCode, master: RezeptIyakuhinMaster, amount: number) {
    this.shikibetsu = shikibetsu;
    this.futanKubun = futanKubun;
    this.master = master;
    this.amount = amount;
  }

  isSame(arg: any): boolean {
    if (arg instanceof SingleConductUnit) {
      return arg.master.iyakuhincode === this.master.iyakuhincode &&
        arg.amount === this.amount;
    } else {
      return false;
    }
  }

  getFutanKubun(): 負担区分コードCode {
    return this.futanKubun;
  }

  getTen(): number {
    return this.ten;
  }

  get ten(): number {
    return shochiYakuzaiKingakuToTen(this.master.yakka * this.amount);
  }

  get label(): string {
    return `${this.master.name} ${this.amount}${this.master.unit}`;
  }

  toLabel(): string {
    return `${this.master.name} ${this.amount}${this.master.unit}`;
  }

  toRecords(santeibi: Santeibi): string[] {
    const data = {
      診療識別: this.shikibetsu,
      負担区分: this.futanKubun,
      医薬品コード: this.master.iyakuhincode,
      使用量: this.amount,
      点数: this.ten,
      回数: santeibi.getSum(),
      コメントコード１: undefined,
      コメント文字１: undefined,
      コメントコード２: undefined,
      コメント文字２: undefined,
      コメントコード３: undefined,
      コメント文字３: undefined,
      算定日情報: santeibi.getSanteibiMap(),
    };
    return [mk医薬品レコード(data)];
  }
}

export function handleIyakuhinTekiyouOfVisit(visit: RezeptVisit,
  handler: (shikibetsu: 診療識別コードCode, sqldate: string,
    item: SingleConductUnit) => void): void {
  const sqldate = visit.visitedAt;
  withClassifiedBy(visit.conducts, c => c.shikibetsuCode, (shikibetsu, cs) => {
    withClassifiedBy(cs, c => c.futanKubun, (futanKubun, cs) => {
      cs.forEach(c => {
        c.drugList.forEach(d => {
          const unit = new SingleConductUnit(shikibetsu, futanKubun, d.master, d.amount);
          handler(shikibetsu, sqldate, unit);
        });
      })
    })
  })
}

export function handleIyakuhinTekiyouOfVisits(visits: RezeptVisit[], comb: Combiner): void {
  visits.forEach(visit => {
    handleIyakuhinTekiyouOfVisit(visit, (shikibetsu, sqldate, s) => {
      comb.combine(shikibetsu, s, sqldate);
    });
  });
}

