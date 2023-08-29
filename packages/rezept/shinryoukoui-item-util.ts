import type { 診療識別コードCode, 負担区分コードCode, } from "./codes";
import { getHoukatsuStep, houkatsuTenOf, isHoukatsuGroup, type HoukatsuStep } from "./houkatsu";
import { mk診療行為レコード, type 診療行為レコードData } from "./records/shinryoukoui-record";
import type { Santeibi } from "./santeibi";
import { isEqualList, withClassifiedBy } from "./helper";
import { Combiner, type TekiyouItem } from "./tekiyou-item";
import { RezeptComment, RezeptShinryou, RezeptShinryouMaster, RezeptVisit } from "rezept-types";

function isSameComments(a: RezeptComment[], b: RezeptComment[]): boolean {
  function isEqualComments(a: RezeptComment, b: RezeptComment): boolean {
    return a.code === b.code && a.text === b.text && a.shikibetsuCode === b.shikibetsuCode;
  }

  return isEqualList(a, b, isEqualComments);
}

export class SimpleShinryou implements TekiyouItem {
  readonly isSimpleShinryou = true;
  shikibetsu: 診療識別コードCode;
  futanKubun: 負担区分コードCode;
  master: RezeptShinryouMaster;
  comments: RezeptComment[];
  amount: number | undefined;

  constructor(
    shikibetsu: 診療識別コードCode,
    futanKubun: 負担区分コードCode,
    master: RezeptShinryouMaster,
    comments: RezeptComment[],
    amount: number | undefined,
  ) {
    this.shikibetsu = shikibetsu;
    this.futanKubun = futanKubun;
    this.master = master;
    this.comments = comments;
    this.amount = amount;
  }

  isSame(other: any): boolean {
    if (other instanceof SimpleShinryou) {
      return this.master.shinryoucode === other.master.shinryoucode &&
        isSameComments(this.comments, other.comments);
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
    return this.master.tensuu;
  }

  get label(): string {
    return this.master.name;
  }

  toLabel(): string {
    return this.master.name;
  }

  toRecords(santeibi: Santeibi): string[] {
    const comments = this.comments;
    const data: 診療行為レコードData = {
      診療識別: this.shikibetsu,
      負担区分: this.futanKubun,
      診療行為コード: this.master.shinryoucode,
      数量データ: this.amount,
      点数: this.ten,
      回数: santeibi.getSum(),
      コメントコード１: comments[0]?.code,
      コメント文字１: comments[0]?.text,
      コメントコード２: comments[1]?.code,
      コメント文字２: comments[1]?.text,
      コメントコード３: comments[2]?.code,
      コメント文字３: comments[2]?.text,
      算定日情報: santeibi.getSanteibiMap(),
    }
    return [mk診療行為レコード(data)];
  }
}

export class HoukatsuKensaShinryou implements TekiyouItem {
  readonly isHoukatsuKensaShinryou = true;
  shikibetsu: 診療識別コードCode;
  futanKubun: 負担区分コードCode;
  houkatsuStep: HoukatsuStep;
  shinryouList: RezeptShinryou[];

  constructor(
    shikibetsu: 診療識別コードCode,
    futanKubun: 負担区分コードCode,
    houkatsuStep: HoukatsuStep,
    shinryouList: RezeptShinryou[]
  ) {
    this.shikibetsu = shikibetsu;
    this.futanKubun = futanKubun;
    this.houkatsuStep = houkatsuStep;
    this.shinryouList = shinryouList;
    this.shinryouList.sort((a, b) => a.master.shinryoucode - b.master.shinryoucode);
  }

  isSame(other: any): boolean {
    if (other instanceof HoukatsuKensaShinryou) {
      return isEqualList(
        this.shinryouList,
        other.shinryouList,
        (a, b) => a.master.shinryoucode === b.master.shinryoucode
      );
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
    if (this.shinryouList.length === 0) {
      return 0;
    }
    const g = this.shinryouList[0].master.houkatsukensa
    if (!isHoukatsuGroup(g)) {
      throw new Error("Invalid houkatsu group: " + g);
    }
    let ten = houkatsuTenOf(g, this.shinryouList.length, this.houkatsuStep);
    if (ten === undefined) {
      ten = this.shinryouList.map(s => s.master)
        .reduce((acc, ele) => acc + ele.tensuu, 0);
    }
    return ten;
  }

  get label(): string {
    return this.shinryouList.map(s => s.master.name).join("、");
  }

  toLabel(): string {
    return this.shinryouList.map(shinryou => shinryou.master.name).join("、");
  }

  toRecords(santeibi: Santeibi): string[] {
    if (this.shinryouList.length === 0) {
      return [];
    } else {
      const g = this.shinryouList[0].master.houkatsukensa
      if (!isHoukatsuGroup(g)) {
        throw new Error("Invalid houkatsu group: " + g);
      }
      const shikibetsu = this.shikibetsu;
      const futanKubun = this.futanKubun;
      return this.shinryouList.map((shinryou, index) => {
        const master = shinryou.master;
        const len = this.shinryouList.length;
        const comments: RezeptComment[] = shinryou.comments;
        const data: 診療行為レコードData = {
          診療識別: index === 0 ? shikibetsu : "",
          負担区分: futanKubun,
          診療行為コード: master.shinryoucode,
          数量データ: shinryou.amount,
          点数: (index === len - 1) ? this.ten : undefined,
          回数: santeibi.getSum(),
          コメントコード１: comments[0]?.code,
          コメント文字１: comments[0]?.text,
          コメントコード２: comments[1]?.code,
          コメント文字２: comments[1]?.text,
          コメントコード３: comments[2]?.code,
          コメント文字３: comments[2]?.text,
          算定日情報: santeibi.getSanteibiMap(),
        };
        return mk診療行為レコード(data);
      });
    }
  }
}

function houkatsuClassifier(shinryou: RezeptShinryou): string | undefined {
  const g = shinryou.master.houkatsukensa;
  if (isHoukatsuGroup(g)) {
    return g;
  } else {
    return undefined;
  }
}

export function handleShinryouTekiyouOfVisit(visit: RezeptVisit,
  handler: (shikibetsu: 診療識別コードCode, sqldate: string,
    item: SimpleShinryou | HoukatsuKensaShinryou) => void): void {
  const sqldate = visit.visitedAt;
  withClassifiedBy(visit.shinryouList, s => s.shikibetsuCode, (shikibetsu, ss) => {
    withClassifiedBy(ss, s => s.futanKubun, (futanKubun, ss) => {
      withClassifiedBy(ss, houkatsuClassifier, (g, ss) => {
        if (g === undefined) {
          ss.forEach(s => {
            handler(shikibetsu, sqldate, new SimpleShinryou(
              shikibetsu, futanKubun, s.master, s.comments, s.amount
            ));
          })
        } else {
          const step = getHoukatsuStep(sqldate);
          handler(shikibetsu, sqldate, new HoukatsuKensaShinryou(
            shikibetsu, futanKubun, getHoukatsuStep(sqldate), ss
          ));
        }
      });
    });
  });

  withClassifiedBy(visit.conducts, c => c.shikibetsuCode, (shikibetsu, cs) => {
    withClassifiedBy(cs, c => c.futanKubun, (futanKubun, cs) => {
      cs.forEach(c => {
        c.shinryouList.forEach(s => {
          handler(shikibetsu, sqldate, new SimpleShinryou(
            shikibetsu, futanKubun, s.master, s.comments, s.amount
          ));
        });
      })
    });
  });
}

export function handleShinryouTekiyouOfVisits(visits: RezeptVisit[], comb: Combiner): void {
  visits.forEach(visit => {
    handleShinryouTekiyouOfVisit(visit, (shikibetsu, sqldate, s) => {
      comb.combine(shikibetsu, s, sqldate);
    });
  });
}

