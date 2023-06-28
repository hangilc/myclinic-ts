import {
  is診療識別コードCode, type 診療識別コードCode, type 負担区分コードCode,
} from "./codes";
import { getHoukatsuStep, houkatsuTenOf, isHoukatsuGroup, type HoukatsuStep } from "./houkatsu";
import type { 診療行為レコードData } from "./records/shinryoukoui-record";
import type { Santeibi } from "./santeibi";
import { isEqualList, withClassified, partition, classifyBy, withClassifiedBy } from "./helper";
import { Combiner, type TekiyouItem } from "./tekiyou-item";
import { RezeptComment, RezeptConduct, RezeptConductShinryou, RezeptShinryou, RezeptShinryouMaster, RezeptVisit } from "rezept-types";

function isSameComments(a: RezeptComment[], b: RezeptComment[]): boolean {
  function isEqualComments(a: RezeptComment, b: RezeptComment): boolean {
    return a.code === b.code && a.text === b.text && a.shikibetsuCode === b.shikibetsuCode;
  }

  return isEqualList(a, b, isEqualComments);
}

export class SimpleShinryou implements TekiyouItem<診療行為レコードData> {
  readonly isSimpleShinryou = true;
  master: RezeptShinryouMaster;
  comments: RezeptComment[];

  constructor(master: RezeptShinryouMaster, comments: RezeptComment[]) {
    this.master = master;
    this.comments = comments;
  }

  isSame(other: any): boolean {
    if (other instanceof SimpleShinryou) {
      return this.master.shinryoucode === other.master.shinryoucode &&
        isSameComments(this.comments, other.comments);
    } else {
      return false;
    }
  }

  get ten(): number {
    return this.master.tensuu;
  }

  get label(): string {
    return this.master.name;
  }

  toRecords(shikibetsu: 診療識別コードCode, futanKubun: 負担区分コードCode, santeibi: Santeibi): 診療行為レコードData[] {
    const comments = this.comments;
    const data: 診療行為レコードData = {
      診療識別: shikibetsu,
      負担区分: futanKubun,
      診療行為コード: this.master.shinryoucode,
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
    return [data];
  }
}

export class HoukatsuKensaShinryou implements TekiyouItem<診療行為レコードData> {
  readonly isHoukatsuKensaShinryou = true;
  houkatsuStep: HoukatsuStep;
  shinryouList: RezeptShinryou[];

  constructor(houkatsuStep: HoukatsuStep, shinryouList: RezeptShinryou[]) {
    this.houkatsuStep = houkatsuStep;
    this.shinryouList = shinryouList;
    this.shinryouList.sort((a, b) => a.master.shinryoucode - b.master.shinryoucode);
  }

  isSame(other: any): boolean {
    if (other instanceof HoukatsuKensaShinryou) {
      return isEqualList(this.shinryouList, other.shinryouList, (a, b) => a.master.shinryoucode === b.master.shinryoucode);
    } else {
      return true;
    }
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

  toRecords(shikibetsu: 診療識別コードCode, futanKubun: 負担区分コードCode, santeibi: Santeibi): 診療行為レコードData[] {
    if (this.shinryouList.length === 0) {
      return [];
    } else {
      const g = this.shinryouList[0].master.houkatsukensa
      if (!isHoukatsuGroup(g)) {
        throw new Error("Invalid houkatsu group: " + g);
      }
      return this.shinryouList.map((shinryou, index) => {
        const master = shinryou.master;
        const len = this.shinryouList.length;
        const comments: RezeptComment[] = shinryou.comments;
        const data = {
          診療識別: index === 0 ? shikibetsu : "",
          負担区分: futanKubun,
          診療行為コード: master.shinryoucode,
          点数: (index === len - 1) ? this.ten : undefined,
          回数: santeibi.getSum(),
          コメントコード１: comments[0]?.code,
          コメント文字１: comments[0]?.text,
          コメントコード２: comments[1]?.code,
          コメント文字２: comments[1]?.text,
          コメントコード３: comments[2]?.code,
          コメント文字３: comments[2]?.text,
          算定日情報: santeibi.getSanteibiMap(),
        }
        return data;
      });
    }
  }
}

// function resolveShinryouShikibetsu(master: ShinryouMaster): 診療識別コードCode {
//   const shinryouShubetsu = Math.floor(parseInt(master.shuukeisaki) / 10).toString();
//   if (!is診療識別コードCode(shinryouShubetsu)) {
//     throw new Error("Unknown 診療識別コード: " + shinryouShubetsu);
//   }
//   return shinryouShubetsu;
// }

// function resolveShinryouKouhi(shinryou: ShinryouEx, visit: Visit): number[] {
//   return visit.kouhiIdList;
// }

// function resolveConductShinryouKouhi(shinryou: ConductShinryouEx, visit: Visit): number[] {
//   return visit.kouhiIdList;
// }

// function commentsOfShinryou(shinryou: ShinryouEx): RezeptComment[] {
//   const comms = shinryou.asShinryou().comments;
//   if (comms.length > 0) {
//     console.log("comms", comms);
//   }
//   return comms;
// }

// function commentsOfConductShinryou(shinryou: ConductShinryouEx): RezeptComment[] {
//   return [];
// }

function houkatsuClassifier(shinryou: RezeptShinryou): string | undefined {
  const g = shinryou.master.houkatsukensa;
  if (isHoukatsuGroup(g)) {
    return g;
  } else {
    return undefined;
  }
}

export function processShinryouOfVisit(visit: RezeptVisit,
  handler: (shikibetsu: 診療識別コードCode, futanKubun: 負担区分コードCode, sqldate: string,
    item: SimpleShinryou | HoukatsuKensaShinryou) => void): void {
  const sqldate = visit.visitedAt;
  const shinryouList: [診療識別コードCode, RezeptShinryou][] = visit.shinryouList.map(shinryou => [
    shinryou.shikibetsuCode,
    shinryou
  ]);
  const conducts: [診療識別コードCode, RezeptConduct][] =
    visit.conducts.map(c => [c.shikibetsuCode, c]);

  withClassifiedBy(visit.shinryouList, s => s.shikibetsuCode, (shikibetsu, ss) => {
    withClassifiedBy(ss, s => s.futanKubun, (futanKubun, ss) => {
      withClassifiedBy(ss, houkatsuClassifier, (g, ss) => {
        if (g === undefined) {
          ss.forEach(s => {
            handler(shikibetsu, futanKubun, sqldate, new SimpleShinryou(
              s.master, s.comments
            ));
          })
        } else {
          const step = getHoukatsuStep(sqldate);
          handler(shikibetsu, futanKubun, sqldate, new HoukatsuKensaShinryou(
            getHoukatsuStep(sqldate), ss
          ));
        }
      });
    });
  });

  withClassifiedBy(visit.conducts, c => c.shikibetsuCode, (shikibetsu, cs) => {
    withClassifiedBy(cs, c => c.futanKubun, (futanKubun, cs) => {
      cs.forEach(c => {
        c.shinryouList.forEach(s => {
          handler(shikibetsu, futanKubun, sqldate, new SimpleShinryou(
            s.master, s.comments
          ));
        });
      })
    });
  });
}

export function cvtVisitsToShinryouDataList(visits: RezeptVisit[]): 診療行為レコードData[] {
  const comb = new Combiner<診療行為レコードData>();
  visits.forEach(visit => {
    processShinryouOfVisit(visit, (shikibetsu, futanKubun, sqldate, s) => {
      comb.combine(shikibetsu, futanKubun, sqldate, s);
    });
  });
  return comb.toDataList();
}

