import type { 診療識別コードCode, 負担区分コードCode } from "./codes";
import { mk特定器材レコード, type 特定器材レコードData } from "./records/tokuteikizai-record";
import type { Santeibi } from "./santeibi";
import { kizaiKingakuToTen, withClassifiedBy } from "./helper";
import { Combiner, type TekiyouItem } from "./tekiyou-item";
import { RezeptKizaiMaster, RezeptVisit } from "rezept-types";

class SingleUnit implements TekiyouItem {
  readonly isSingleItem = true;
  shikibetsu: 診療識別コードCode;
  futanKubun: 負担区分コードCode;
  master: RezeptKizaiMaster;
  amount: number;

  constructor(shikibetsu: 診療識別コードCode, futanKubun: 負担区分コードCode, master: RezeptKizaiMaster, amount: number) {
    this.shikibetsu = shikibetsu;
    this.futanKubun = futanKubun;
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

  toRecords(santeibi: Santeibi): string[] {
    const data = {
      診療識別: this.shikibetsu,
      負担区分: this.futanKubun,
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
    };
    return [mk特定器材レコード(data)];
  }
}

export function handleKizaiTekiyouOfVisit(visit: RezeptVisit,
  handler: (shikibetsu: 診療識別コードCode, sqldate: string,
    item: SingleUnit) => void): void {
  const sqldate = visit.visitedAt;
  withClassifiedBy(visit.conducts, c => c.shikibetsuCode, (shikibetsu, cs) => {
    withClassifiedBy(cs, c => c.futanKubun, (futanKubun, cs) => {
      cs.forEach(c => {
        c.kizaiList.forEach(k => {
          const unit = new SingleUnit(shikibetsu, futanKubun, k.master, k.amount);
          handler(shikibetsu, sqldate, unit);
        });
      });
    })
  })
}

export function handleKizaiTekiyouOfVisits(visits: RezeptVisit[], comb: Combiner): void {
  visits.forEach(visit => {
    handleKizaiTekiyouOfVisit(visit, (shikibetsu, sqldate, s) => {
      comb.combine(shikibetsu, s, sqldate);
    });
  });
}


