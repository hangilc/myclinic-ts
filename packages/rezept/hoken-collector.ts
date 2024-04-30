import { is負担区分コードName, 負担区分コードCode, 負担区分コードCodeOf, 負担区分コードName } from "./codes";
import { sortKouhiList } from "./kouhi-order";
import { Hokensha, RezeptKouhi } from "./rezept-types";

export interface HokenCollection {
  hokensha: Hokensha;
  kouhiList: RezeptKouhi[];
}

class HCol {
  hokensha: Hokensha;
  kouhiList: RezeptKouhi[] = [];

  constructor(hokensha: Hokensha, kouhiList: RezeptKouhi[]) {
    this.hokensha = hokensha;
    this.kouhiList = [...kouhiList];
  }

  extendOne(kouhi: RezeptKouhi) {
    if (!this.kouhiList.includes(kouhi)) {
      this.kouhiList.push(kouhi);
    }
  }

  extend(kouhiList: RezeptKouhi[]) {
    kouhiList.forEach(k => this.extendOne(k));
  }

  toHokenCollection(): HokenCollection {
    sortKouhiList(this.kouhiList);
    return {
      hokensha: this.hokensha,
      kouhiList: this.kouhiList,
    }
  }
}

export function unifyHokenList(hokenList: { hokensha: Hokensha, kouhiList: RezeptKouhi[] }[]): HokenCollection[] {
  const hcols: HCol[] = [];
  hokenList.forEach(h => {
    for (let hcol of hcols) {
      if (hcol.hokensha === h.hokensha) {
        hcol.extend(h.kouhiList);
        return;
      }
    }
    hcols.push(new HCol(h.hokensha, h.kouhiList));
  });
  return hcols.map(hcol => hcol.toHokenCollection());
}

export function futanKubunNameByHokenCollection(
  hc: HokenCollection, hokensha: Hokensha | undefined,
  kouhiList: RezeptKouhi[]
): 負担区分コードName {
  if (hokensha !== undefined && hc.hokensha !== hokensha) {
    throw new Error("Inconsistent hoken");
  }
  const h: string = hokensha === undefined ? "" : "H";
  const ids: number[] = kouhiList.map(k => {
    const i = hc.kouhiList.indexOf(k);
    if (i < 0) {
      throw new Error("Unknown kouhi");
    }
    return i + 1;
  });
  ids.sort();
  const result = h + ids.join("");
  if (is負担区分コードName(result)) {
    return result;
  } else {
    throw new Error("Cannot happen");
  }
}

export function futanKubunCodeByHokenCollection(hc: HokenCollection, hokensha: Hokensha | undefined,
  kouhiList: RezeptKouhi[]
): 負担区分コードCode {
  const name = futanKubunNameByHokenCollection(hc, hokensha, kouhiList);
  return 負担区分コードCodeOf(name);
}
