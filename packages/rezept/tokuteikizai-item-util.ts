import type { 診療識別コードCode, 負担区分コードCode } from "./codes";
import type { 特定器材レコードData } from "./records/tokuteikizai-record";
import type { Santeibi } from "./santeibi";
import { kizaiKingakuToTen, withClassifiedBy } from "./helper";
import { Combiner, type TekiyouItem } from "./tekiyou-item";
import { RezeptKizaiMaster, RezeptVisit } from "rezept-types";

class SingleUnit implements TekiyouItem<特定器材レコードData> {
  readonly isSingleItem = true;
  master: RezeptKizaiMaster;
  amount: number;

  constructor( master: RezeptKizaiMaster, amount: number) {
    this.master = master;
    this.amount = amount;
  }

  isSame(arg: any): boolean {
    if (arg instanceof SingleUnit) {
      return arg.master.kizaicode === this.master.kizaicode &&
        arg.amount === this.amount;
    } else {
      return false;
    }
  }

  get ten(): number {
    return kizaiKingakuToTen(this.master.kingaku * this.amount);
  }

  get label(): string {
    return `${this.master.name} ${this.amount}${this.master.unit}`;
  }

  toRecords(shikibetsu: 診療識別コードCode, futanKubun: 負担区分コードCode, santeibi: Santeibi): 特定器材レコードData[] {
    return [{
      診療識別: shikibetsu,
      負担区分: futanKubun,
      特定器材コード: this.master.kizaicode,
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

export function processKizaiOfVisit(visit: RezeptVisit,
  handler: (shikibetsu: 診療識別コードCode, futanKubun: 負担区分コードCode, sqldate: string,
    item: SingleUnit) => void): void {
  const sqldate = visit.visitedAt.substring(0, 10);
  withClassifiedBy(visit.conducts, c => c.shikibetsuCode, (shikibetsu, cs) => {
    withClassifiedBy(cs, c => c.futanKubun, (futanKubun, cs) => {
      cs.forEach(c => {
        c.kizaiList.forEach(k => {
          const unit = new SingleUnit(k.master, k.amount);
          handler(shikibetsu, futanKubun, sqldate, unit);
        });
      });
    })
  })
}

export function cvtVisitsToKizaiDataList(visits: RezeptVisit[]): 特定器材レコードData[] {
  const comb = new Combiner<特定器材レコードData>();
  visits.forEach(visit => {
    processKizaiOfVisit(visit, (shikibetsu, futanKubun, sqldate, s) => {
      comb.combine(shikibetsu, futanKubun, sqldate, s);
    });
  });
  return comb.toDataList();
}


