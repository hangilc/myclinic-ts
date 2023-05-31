import { ConductShinryouEx, ShinryouEx, ShinryouMemoComment, Visit, type ShinryouMaster } from "myclinic-model";
import {
  is診療識別コードCode, type 診療識別コードCode, type 負担区分コードCode,
  診療識別コード,
  sort診療識別コードCodeList,
} from "./codes";
import { getHoukatsuStep, houkatsuTenOf, isHoukatsuGroup, type HoukatsuGroup, type HoukatsuStep } from "./houkatsu";
import type { 診療行為レコードData } from "./records/shinryoukoui-record";
import { Santeibi } from "./santeibi";
import { calcFutanKubun, hasHoken, isEqualList, classify, withClassified, partition } from "./util";
import type { VisitItem } from "./visit-item";

function isSameComments(a: ShinryouMemoComment[], b: ShinryouMemoComment[]): boolean {
  return isEqualList(a, b, ShinryouMemoComment.isEqualComments);
}

export class SimpleShinryou {
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

  toRecord(shikibetsu: 診療識別コードCode, futanKubun: 負担区分コードCode, santeibi: Santeibi): 診療行為レコードData {
    const comments = this.comments;
    const data: 診療行為レコードData = {
      診療識別: shikibetsu,
      負担区分: futanKubun,
      診療行為コード: this.master.shinryoucode,
      点数: parseInt(this.master.tensuuStore),
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
  }
}

export class HoukatsuKensaShinryou {
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

  toRecords(shikibetsu: 診療識別コードCode, futanKubun: 負担区分コードCode, santeibi: Santeibi): 診療行為レコードData[] {
    if (this.shinryouList.length === 0) {
      return [];
    } else {
      const g = this.shinryouList[0].master.houkatsukensa
      if (!isHoukatsuGroup(g)) {
        throw new Error("Invalid houkatsu group: " + g);
      }
      let ten = houkatsuTenOf(g, this.shinryouList.length, this.houkatsuStep);
      if (ten === undefined) {
        ten = this.shinryouList.map(s => s.master)
          .reduce((acc, ele) => acc + parseInt(ele.tensuuStore), 0);
      }
      return this.shinryouList.map((shinryou, index) => {
        const master = shinryou.master;
        const len = this.shinryouList.length;
        const comments = shinryou.asShinryou().comments;
        const data = {
          診療識別: index === 0 ? shikibetsu : "",
          負担区分: futanKubun,
          診療行為コード: master.shinryoucode,
          点数: (index === len - 1) ? ten : undefined,
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

function shikibetsuClassifier(shinryou: ShinryouEx): [診療識別コードCode, ShinryouEx] {
  return [resolveShinryouShikibetsu(shinryou.master), shinryou];
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

export function processShinryouOfVisit(visitItem: VisitItem,
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
  const kouhiIdList = visitItem.visit.kouhiIdList;
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

class CombineUnit {
  item: SimpleShinryou | HoukatsuKensaShinryou;
  santei: Santeibi;

  constructor(item: SimpleShinryou | HoukatsuKensaShinryou, sqldate: string) {
    this.item = item;
    this.santei = new Santeibi();
    this.santei.add(sqldate);
  }

  tryAdd(arg: SimpleShinryou | HoukatsuKensaShinryou, sqldate: string): boolean {
    if (this.item.isSame(arg)) {
      this.santei.add(sqldate);
      return true;
    } else {
      return false;
    }
  }
}

class Combiner {
  map: Map<診療識別コードCode, Map<負担区分コードCode, CombineUnit[]>> = new Map();

  getShikibetsu(shikibetsu: 診療識別コードCode): Map<負担区分コードCode, CombineUnit[]> {
    const bmap = this.map.get(shikibetsu);
    if (bmap) {
      return bmap;
    } else {
      const newBmap = new Map<負担区分コードCode, CombineUnit[]>();
      this.map.set(shikibetsu, newBmap);
      return newBmap;
    }
  }

  combine(
    shikibetsu: 診療識別コードCode,
    futanKubun: 負担区分コードCode,
    sqldate: string,
    item: SimpleShinryou | HoukatsuKensaShinryou): void {
    const bmap = this.getShikibetsu(shikibetsu);
    const cs = bmap.get(futanKubun);
    if (cs) {
      for (let c of cs) {
        if (c.tryAdd(item, sqldate)) {
          return;
        }
      }
      cs.push(new CombineUnit(item, sqldate));
    } else {
      bmap.set(futanKubun, [new CombineUnit(item, sqldate)]);
    }
  }

  toDataList(): 診療行為レコードData[] {
    const result: 診療行為レコードData[] = [];
    const keys = Array.from(this.map.keys());
    sort診療識別コードCodeList(keys);
    for(let shikibetsu of keys){
      const bmap = this.map.get(shikibetsu)!;
      for(let futanKubun of bmap.keys()){
        const cs = bmap.get(futanKubun)!;
        cs.forEach(u => {
          
        })
      }
    }
    return result;
  }
}

export function cvtVisitItemsToShinryouDataList(visitItems: VisitItem[], kouhiIdList: number[]): 診療行為レコードData[] {
  const comb = new Combiner();
  visitItems.forEach(visitItem => {
    processShinryouOfVisit(visitItem, (shikibetsu, futanKubun, sqldate, s) => {
      comb.combine(shikibetsu, futanKubun, sqldate, s);
    });
  });
  return comb.toDataList();
}



class RezeptShinryou {
  shikibetsu: 診療識別コードCode;
  master: ShinryouMaster;
  comments: ShinryouMemoComment[];

  constructor(shikibetsu: 診療識別コードCode, master: ShinryouMaster, comments: ShinryouMemoComment[]) {
    this.shikibetsu = shikibetsu;
    this.master = master;
    this.comments = comments;
  }

  static fromShinryou(shinryou: ShinryouEx): RezeptShinryou {
    const shikibetsu = resolveShinryouShikibetsu(shinryou.master);
    return new RezeptShinryou(shikibetsu, shinryou.master, shinryou.asShinryou().comments);
  }

  static fromConductShinryou(shinryou: ConductShinryouEx): RezeptShinryou {
    return new RezeptShinryou(診療識別コード.処置, shinryou.master, []);
  }
}

function isSameRezeptShinryou(a: RezeptShinryou, b: RezeptShinryou): boolean {
  return a.shikibetsu === b.shikibetsu &&
    a.master.shinryoucode === b.master.shinryoucode &&
    isSameComments(a.comments, b.comments);
}

function isSameRezeptShinryouList(as: RezeptShinryou[], bs: RezeptShinryou[]): boolean {
  return isEqualList(as, bs, isSameRezeptShinryou);
}

interface ItemUnit {
  isEqual(arg: any): boolean;
  toDataList<T>(santeibi: Santeibi, modify: (src: 診療行為レコードData, m: ShinryouMaster) => T): T[];
  shikibetsucode: 診療識別コードCode;
}

class SingleUnit implements ItemUnit {
  readonly isSingleItem = true;
  futanKubun: 負担区分コードCode;
  shinryou: RezeptShinryou;

  constructor(futanKubun: 負担区分コードCode, shinryou: RezeptShinryou) {
    this.futanKubun = futanKubun;
    this.shinryou = shinryou;
  }

  get shikibetsucode(): 診療識別コードCode {
    return this.shinryou.shikibetsu;
  }

  isEqual(arg: any): boolean {
    if (arg instanceof SingleUnit) {
      return arg.shikibetsucode === this.shikibetsucode &&
        arg.futanKubun === this.futanKubun &&
        isSameRezeptShinryou(arg.shinryou, this.shinryou);
    } else {
      return false;
    }
  }

  toDataList<T>(santeibi: Santeibi, modify: (src: 診療行為レコードData, master: ShinryouMaster) => T): T[] {
    const comments = this.shinryou.comments;
    const data: 診療行為レコードData = {
      診療識別: this.shikibetsucode,
      負担区分: this.futanKubun,
      診療行為コード: this.shinryou.master.shinryoucode,
      点数: parseInt(this.shinryou.master.tensuuStore),
      回数: santeibi.getSum(),
      コメントコード１: comments[0]?.code,
      コメント文字１: comments[0]?.text,
      コメントコード２: comments[1]?.code,
      コメント文字２: comments[1]?.text,
      コメントコード３: comments[2]?.code,
      コメント文字３: comments[2]?.text,
      算定日情報: santeibi.getSanteibiMap(),
    }
    return [modify(data, this.shinryou.master)];
  }
}

class HoukatsuUnit implements ItemUnit {
  readonly isHoukatsuUnit = true;
  shikibetsucode: 診療識別コードCode;
  futanKubun: 負担区分コードCode;
  houkatsuStep: HoukatsuStep;
  shinryouList: RezeptShinryou[];

  constructor(shikibetsucode: 診療識別コードCode, futanKubun: 負担区分コードCode, houkatsuStep: HoukatsuStep,
    shinryou: ShinryouEx) {
    this.shikibetsucode = shikibetsucode;
    this.futanKubun = futanKubun;
    this.houkatsuStep = houkatsuStep;
    this.shinryouList = [new RezeptShinryou(this.shikibetsucode, shinryou.master, shinryou.asShinryou().comments)];
  }

  toDataList<T>(santeibi: Santeibi, modify: (src: 診療行為レコードData, master: ShinryouMaster) => T): T[] {
    if (this.shinryouList.length === 0) {
      return [];
    } else {
      const g = this.shinryouList[0].master.houkatsukensa
      if (!isHoukatsuGroup(g)) {
        throw new Error("Invalid houkatsu group: " + g);
      }
      let ten = houkatsuTenOf(g, this.shinryouList.length, this.houkatsuStep);
      if (ten === undefined) {
        ten = this.shinryouList.map(s => s.master)
          .reduce((acc, ele) => acc + parseInt(ele.tensuuStore), 0);
      }
      return this.shinryouList.map((shinryou, index) => {
        const master = shinryou.master;
        const len = this.shinryouList.length;
        const comments = shinryou.comments;
        const data = {
          診療識別: index === 0 ? this.shikibetsucode : "",
          負担区分: this.futanKubun,
          診療行為コード: master.shinryoucode,
          点数: (index === len - 1) ? ten : undefined,
          回数: santeibi.getSum(),
          コメントコード１: comments[0]?.code,
          コメント文字１: comments[0]?.text,
          コメントコード２: comments[1]?.code,
          コメント文字２: comments[1]?.text,
          コメントコード３: comments[2]?.code,
          コメント文字３: comments[2]?.text,
          算定日情報: santeibi.getSanteibiMap(),
        }
        return modify(data, master);
      });
    }
  }

  addShinryou(shinryou: ShinryouEx): void {
    this.shinryouList.push(new RezeptShinryou(shinryou.master, shinryou.asShinryou().comments));
    this.shinryouList.sort((a, b) => a.master.shinryoucode - b.master.shinryoucode);
  }

  isEqual(arg: any): boolean {
    if (arg instanceof HoukatsuUnit) {
      return arg.shikibetsucode === this.shikibetsucode &&
        arg.futanKubun === this.futanKubun &&
        isSameRezeptShinryouList(arg.shinryouList, this.shinryouList);
    } else {
      return false;
    }
  }
}

class Combined {
  units: [ItemUnit, Santeibi][] = [];

  combine(unit: ItemUnit, sqldate: string): void {
    for (const [u, santei] of this.units) {
      if (u.isEqual(unit)) {
        santei.add(sqldate);
        return;
      }
    }
    const santei = new Santeibi();
    santei.add(sqldate);
    this.units.push([unit, santei]);
  }

  toDataList<T>(modify: (src: 診療行為レコードData, master: ShinryouMaster) => T): T[] {
    this.units.sort((a, b) => a[0].shikibetsucode.localeCompare(b[0].shikibetsucode));
    const list: T[] = [];
    this.units.forEach(([unit, santeibi]) => {
      list.push(...unit.toDataList<T>(santeibi, modify));
    })
    return list;
  }
}

export function mkShinryouUnits(visitItem: VisitItem, kouhiIdList: number[]): ItemUnit[] {
  function kubunClassifier(shinryou: ShinryouEx): [負担区分コードCode, ShinryouEx] {
    const kubun = calcFutanKubun(hasHoken(visitItem),
      resolveShinryouKouhi(shinryou, visitItem.visit), kouhiIdList);
    return [kubun, shinryou];
  }
  const units: ItemUnit[] = [];
  withClassified(visitItem.visitEx.shinryouList, shikibetsuClassifier, (shikibetsu, shinryouList) => {
    withClassified(shinryouList, kubunClassifier, (kubun, shinryouList) => {
      const houkatsuMap: Map<HoukatsuGroup, HoukatsuUnit> = new Map();
      shinryouList.forEach(shinryou => {
        const g = shinryou.master.houkatsukensa;
        if (isHoukatsuGroup(g)) {
          if (houkatsuMap.has(g)) {
            houkatsuMap.get(g)!.addShinryou(shinryou);
          } else {
            const date = visitItem.visit.visitedAt.substring(0, 10);
            const step = getHoukatsuStep(date);
            houkatsuMap.set(g, new HoukatsuUnit(shinryouShubetsu, futanKubun, step, shinryou))
          }
        } else {
          units.push(new SingleUnit(shinryouShubetsu, futanKubun, RezeptShinryou.fromShinryou(shinryou)));
        }
      })
    });
  })
  const shikibetsuClassified: Map<診療識別コードCode, ShinryouEx[]> =
    classify(visitItem.visitEx.shinryouList, shinryou => {
      const shinryouShubetsu = Math.floor(parseInt(shinryou.master.shuukeisaki) / 10).toString();
      if (!is診療識別コードCode(shinryouShubetsu)) {
        throw new Error("Unknown 診療識別コード: " + shinryouShubetsu);
      }
      return [shinryouShubetsu, shinryou];
    });
  for (let shikibetsu of shikibetsuClassified.keys()) {
    const futanKubunClassified: Map<負担区分コードCode, ShinryouEx[]> =
      classify(Array.from(shikibetsuClassified.get(shikibetsu)!), shinryou => {
        const kubun = calcFutanKubun(hasHoken(visitItem),
          resolveShinryouKouhi(shinryou, visitItem.visit), kouhiIdList);
        return [kubun, shinryou];
      });
  }
  const houkatsuMap: Map<HoukatsuGroup, HoukatsuUnit> = new Map();
  visitItem.visitEx.shinryouList.forEach(shinryou => {
    const shinryouShubetsu = Math.floor(parseInt(shinryou.master.shuukeisaki) / 10).toString();
    if (!is診療識別コードCode(shinryouShubetsu)) {
      throw new Error("Unknown 診療識別コード: " + shinryouShubetsu);
    }
    const g = shinryou.master.houkatsukensa;
    if (isHoukatsuGroup(g)) {
      if (houkatsuMap.has(g)) {
        houkatsuMap.get(g)!.addShinryou(shinryou);
      } else {
        const date = visitItem.visit.visitedAt.substring(0, 10);
        const step = getHoukatsuStep(date);
        houkatsuMap.set(g, new HoukatsuUnit(shinryouShubetsu, futanKubun, step, shinryou))
      }
    } else {
      units.push(new SingleUnit(shinryouShubetsu, futanKubun, RezeptShinryou.fromShinryou(shinryou)));
    }
  });
  for (const unit of houkatsuMap.values()) {
    units.push(unit);
  }
  visitItem.visitEx.conducts.forEach(conduct => {
    conduct.shinryouList.forEach(shinryou => {
      units.push(new SingleUnit(
        診療識別コード.処置, futanKubun, RezeptShinryou.fromConductShinryou(shinryou)
      ));
    });
  })
  return units;
}

