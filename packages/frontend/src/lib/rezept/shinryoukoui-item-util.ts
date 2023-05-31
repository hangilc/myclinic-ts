import { ConductShinryouEx, ShinryouEx, ShinryouMemoComment, Visit, type ShinryouMaster } from "myclinic-model";
import {
  is診療識別コードCode, type 診療識別コードCode, type 負担区分コードCode,
  診療識別コード,
} from "./codes";
import { getHoukatsuStep, houkatsuTenOf, isHoukatsuGroup, type HoukatsuStep } from "./houkatsu";
import type { 診療行為レコードData } from "./records/shinryoukoui-record";
import type { Santeibi } from "./santeibi";
import { calcFutanKubun, hasHoken, isEqualList, withClassified, partition } from "./util";
import { Combiner, type TekiyouItem, type VisitItem } from "./visit-item";

function isSameComments(a: ShinryouMemoComment[], b: ShinryouMemoComment[]): boolean {
  return isEqualList(a, b, ShinryouMemoComment.isEqualComments);
}

export class SimpleShinryou implements TekiyouItem<診療行為レコードData> {
  readonly isSimpleShinryou = true;
  master: ShinryouMaster;
  comments: ShinryouMemoComment[];

  constructor(master: ShinryouMaster, comments: ShinryouMemoComment[]) {
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
    return parseInt(this.master.tensuuStore);
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
  shinryouList: ShinryouEx[];

  constructor(houkatsuStep: HoukatsuStep, shinryouList: ShinryouEx[]) {
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
        .reduce((acc, ele) => acc + parseInt(ele.tensuuStore), 0);
    }
    return ten;
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
        const comments = shinryou.asShinryou().comments;
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

function resolveShinryouShikibetsu(master: ShinryouMaster): 診療識別コードCode {
  const shinryouShubetsu = Math.floor(parseInt(master.shuukeisaki) / 10).toString();
  if (!is診療識別コードCode(shinryouShubetsu)) {
    throw new Error("Unknown 診療識別コード: " + shinryouShubetsu);
  }
  return shinryouShubetsu;
}

function resolveShinryouKouhi(shinryou: ShinryouEx, visit: Visit): number[] {
  return visit.kouhiIdList;
}

function resolveConductShinryouKouhi(shinryou: ConductShinryouEx, visit: Visit): number[] {
  return visit.kouhiIdList;
}

function commentsOfShinryou(shinryou: ShinryouEx): ShinryouMemoComment[] {
  return shinryou.asShinryou().comments;
}

function commentsOfConductShinryou(shinryou: ConductShinryouEx): ShinryouMemoComment[] {
  return [];
}

function houkatsuClassifier(shinryou: ShinryouEx): [string | undefined, ShinryouEx] {
  const g = shinryou.master.houkatsukensa;
  if (isHoukatsuGroup(g)) {
    return [g, shinryou];
  } else {
    return [undefined, shinryou];
  }
}

function isShinryouEx(arg: any): arg is ShinryouEx {
  return arg instanceof ShinryouEx;
}

export function processShinryouOfVisit(visitItem: VisitItem, kouhiIdList: number[],
  handler: (shikibetsu: 診療識別コードCode, futanKubun: 負担区分コードCode, sqldate: string,
    item: SimpleShinryou | HoukatsuKensaShinryou) => void): void {
  const visitEx = visitItem.visitEx;
  const sqldate = visitItem.visit.visitedAt.substring(0, 10);
  const shinryouList: [診療識別コードCode, ShinryouEx][] = visitEx.shinryouList.map(shinryou => [
    resolveShinryouShikibetsu(shinryou.master),
    shinryou
  ]);
  const conductShinryouList: [診療識別コードCode, ConductShinryouEx][] =
    visitEx.conducts.flatMap(c => c.shinryouList).map(cs => [診療識別コード.処置, cs]);
  const list: [診療識別コードCode, ShinryouEx | ConductShinryouEx][] = [...shinryouList, ...conductShinryouList];
  function resolveFutanKubun(s: ShinryouEx | ConductShinryouEx): 負担区分コードCode {
    if (s instanceof ShinryouEx) {
      return calcFutanKubun(
        hasHoken(visitItem),
        resolveShinryouKouhi(s, visitItem.visit),
        kouhiIdList);
    } else {
      return calcFutanKubun(
        hasHoken(visitItem),
        resolveConductShinryouKouhi(s, visitItem.visit),
        kouhiIdList);
    }
  }
  withClassified(list, (shikibetsu, ss) => {
    withClassified(ss.map(s => [resolveFutanKubun(s), s]), (futanKubun, ss) => {
      const [shinryouList, conductShinryouList] = partition<ShinryouEx, ConductShinryouEx>(ss, isShinryouEx);
      withClassified(shinryouList.map(houkatsuClassifier), (g, ss) => {
        if (g === undefined) {
          ss.forEach(s => {
            handler(shikibetsu, futanKubun, sqldate, new SimpleShinryou(
              s.master, commentsOfShinryou(s)
            ));
          })
        } else {
          const step = getHoukatsuStep(sqldate);
          handler(shikibetsu, futanKubun, sqldate, new HoukatsuKensaShinryou(
            getHoukatsuStep(sqldate), ss
          ));
        }
      });
      conductShinryouList.forEach(s => {
        handler(shikibetsu, futanKubun, sqldate, new SimpleShinryou(
          s.master, commentsOfConductShinryou(s)
        ));
      })
    })
  })
}

export function cvtVisitItemsToShinryouDataList(visitItems: VisitItem[], kouhiIdList: number[]): 診療行為レコードData[] {
  const comb = new Combiner<診療行為レコードData>();
  visitItems.forEach(visitItem => {
    processShinryouOfVisit(visitItem, kouhiIdList, (shikibetsu, futanKubun, sqldate, s) => {
      comb.combine(shikibetsu, futanKubun, sqldate, s);
    });
  });
  return comb.toDataList();
}

