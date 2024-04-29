import { is負担区分コードName, 負担区分コードName } from "./codes";
import { sortKouhiList } from "./kouhi-order";
import { Hokensha, RezeptKouhi } from "./rezept-types";

export interface HokenCollection {
  hokensha?: Hokensha;
  kouhiList: RezeptKouhi[];
}

class HCol {
  hokensha: Hokensha | undefined;
  kouhiList: RezeptKouhi[] = [];

  constructor(hokensha: Hokensha | undefined, kouhiList: RezeptKouhi[]) {
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

export function unifyHokenList(hokenList: { hokensha?: Hokensha, kouhiList: RezeptKouhi[] }[]): HokenCollection[] {
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

export function futanKubunOfHokenCollection(hc: HokenCollection, arg: { hokensha?: Hokensha, kouhilist: RezeptKouhi[] }):
  負担区分コードName {
    if( arg.hokensha !== undefined && hc.hokensha !== arg.hokensha ){
      throw new Error("Inconsistent hoken");
    }
  const h: string = arg.hokensha === undefined ? "" : "H";
  const k: string = arg.kouhilist.map(k => {
    const i = hc.kouhiList.indexOf(k);
    if( i < 0 ){
      throw new Error("Unknown kouhi");
    }
    return (i + 1).toString();
  }).join("");
  const result = h + k;
  if( is負担区分コードName(result) ){
    return result;
  } else {
    throw new Error("Cannot happen");
  }
}
