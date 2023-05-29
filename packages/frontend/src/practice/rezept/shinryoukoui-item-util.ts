import { ShinryouMemoComment, type ShinryouEx, type ShinryouMaster } from "myclinic-model";
import {
  is診療識別コードCode, type 診療識別コードCode, type 負担区分コードCode,
  診療識別コード
} from "./codes";
import { getHoukatsuStep, houkatsuTenOf, isHoukatsuGroup, type HoukatsuGroup, type HoukatsuStep } from "./houkatsu";
import type { 診療行為レコードData } from "./records/shinryoukoui-record";
import { Santeibi } from "./santeibi";
import { calcFutanKubun, hasHoken, isEqualList } from "./util";
import type { VisitItem } from "./visit-item";

class RezeptShinryou {
  master: ShinryouMaster;
  comments: ShinryouMemoComment[];

  constructor(master: ShinryouMaster, comments: ShinryouMemoComment[]) {
    this.master = master;
    this.comments = comments;
  }
}

function isSameComments(a: ShinryouMemoComment[], b: ShinryouMemoComment[]): boolean {
  return isEqualList(a, b, ShinryouMemoComment.isEqualComments);
}

function isSameRezeptShinryou(a: RezeptShinryou, b: RezeptShinryou): boolean {
  return a.master.shinryoucode === b.master.shinryoucode &&
    isSameComments(a.comments, b.comments);
}

function isSameRezeptShinryouList(as: RezeptShinryou[], bs: RezeptShinryou[]): boolean {
  return isEqualList(as, bs, isSameRezeptShinryou);
}

interface ItemUnit {
  isEqual(arg: any): boolean;
  toDataList(santeibi: Santeibi): 診療行為レコードData[];
  shikibetsucode: 診療識別コードCode;
}

class SingleUnit implements ItemUnit {
  readonly isSingleItem = true;
  shikibetsucode: 診療識別コードCode;
  futanKubun: 負担区分コードCode;
  shinryou: RezeptShinryou;

  constructor(shikibetsucode: 診療識別コードCode, futanKubun: 負担区分コードCode, shinryou: ShinryouEx) {
    this.shikibetsucode = shikibetsucode;
    this.futanKubun = futanKubun;
    this.shinryou = new RezeptShinryou(shinryou.master, shinryou.asShinryou().comments);
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

  toDataList(santeibi: Santeibi): 診療行為レコードData[] {
    const comments = this.shinryou.comments;
    return [{
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
    }];
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
    this.shinryouList = [new RezeptShinryou(shinryou.master, shinryou.asShinryou().comments)];
  }

  toDataList(santeibi: Santeibi): 診療行為レコードData[] {
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
        return {
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

  toDataList(): 診療行為レコードData[] {
    this.units.sort((a, b) => a[0].shikibetsucode.localeCompare(b[0].shikibetsucode));
    const list: 診療行為レコードData[] = [];
    this.units.forEach(([unit, santeibi]) => {
      list.push(...unit.toDataList(santeibi));
    })
    return list;
  }
}

function visitUnits(visitItem: VisitItem, kouhiIdList: number[]): ItemUnit[] {
  const units: ItemUnit[] = [];
  const futanKubun = calcFutanKubun(hasHoken(visitItem), visitItem.hoken.kouhiList.map(k => k.kouhiId), kouhiIdList);
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
      units.push(new SingleUnit(shinryouShubetsu, futanKubun, shinryou));
    }
  });
  for (const unit of houkatsuMap.values()) {
    units.push(unit);
  }
  visitItem.visitEx.conducts.forEach(conduct => {
    conduct.shinryouList.forEach(shinryou => {
      units.push(new SingleUnit(
        診療識別コード.処置, futanKubun, shinryou.master, []
      ));
    });
  })
  return units;
}

export function cvtVisitItemsToShinryouDataList(visitItems: VisitItem[], kouhiIdList: number[]): 診療行為レコードData[] {
  const combined = new Combined();
  visitItems.forEach(visitItem => {
    const units = visitUnits(visitItem, kouhiIdList);
    const date = visitItem.visit.visitedAt.substring(0, 10);
    units.forEach(unit => {
      combined.combine(unit, date);
    })
  })
  return combined.toDataList();
}

