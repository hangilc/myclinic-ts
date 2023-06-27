import type { 診療識別コードCode, 負担区分コードCode } from "./codes";
import type { 医薬品レコードData } from "./records/iyakuhin-record";
import type { Santeibi } from "./santeibi";
import { shochiYakuzaiKingakuToTen, withClassified, withClassifiedBy } from "./helper";
import { Combiner, type TekiyouItem } from "./tekiyou-item";
import { RezeptIyakuhinMaster, RezeptVisit } from "rezept-types";

class SingleConductUnit implements TekiyouItem<医薬品レコードData> {
  readonly isSingleItem = true;
  master: RezeptIyakuhinMaster;
  amount: number;

  constructor(master: RezeptIyakuhinMaster, amount: number) {
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

  get ten(): number {
    return shochiYakuzaiKingakuToTen(this.master.yakka * this.amount);
  }

  get label(): string {
    return `${this.master.name} ${this.amount}${this.master.unit}`;
  }

  toRecords(shikibetsu: 診療識別コードCode, futanKubun: 負担区分コードCode, santeibi: Santeibi): 医薬品レコードData[] {
    return [{
      診療識別: shikibetsu,
      負担区分: futanKubun,
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
    }];
  }
}

export function processIyakuhinOfVisit(visit: RezeptVisit,
  handler: (shikibetsu: 診療識別コードCode, futanKubun: 負担区分コードCode, sqldate: string,
    item: SingleConductUnit) => void): void {
  const sqldate = visit.visitedAt.substring(0, 10);
  withClassifiedBy(visit.conducts, c => c.shikibetsuCode, (shikibetsu, cs) => {
    withClassifiedBy(cs, c => c.futanKubun, (futanKubun, cs) => {
      cs.forEach(c => {
        c.drugList.forEach(d => {
          const unit = new SingleConductUnit(d.master, d.amount);
          handler(shikibetsu, futanKubun, sqldate, unit);
        });
      })
    })
  })
}

export function cvtVisitsToIyakuhinDataList(visits: RezeptVisit[]): 医薬品レコードData[] {
  const comb = new Combiner<医薬品レコードData>();
  visits.forEach(visit => {
    processIyakuhinOfVisit(visit, (shikibetsu, futanKubun, sqldate, s) => {
      comb.combine(shikibetsu, futanKubun, sqldate, s);
    });
  });
  return comb.toDataList();
}

