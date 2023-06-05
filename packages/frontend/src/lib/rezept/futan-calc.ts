import type { Kouhi, Koukikourei, Shahokokuho } from "myclinic-model";
import { 負担区分コードRev, type 負担区分コードCode } from "./codes";
import { futanWariOfHoken } from "./util";

class Slot {
  totalTen: number;
  hokenCharge: number = 0;
  patientCharge: number = 0;

  constructor(totalTen: number) {
    this.totalTen = totalTen;
  }
}

export class FutanCalc {
  hoken: Shahokokuho | Koukikourei | undefined;
  kouhiList: Kouhi[];
  slots: Map<負担区分コードCode, Slot> = new Map();

  constructor(hoken: Shahokokuho | Koukikourei | undefined, kouhiList: Kouhi[]) {
    this.hoken = hoken;
    this.kouhiList = kouhiList;
  }

  process(totalTens: Map<負担区分コードCode, number>): void {
    const kubunList = sortFutanKubun(Array.from(totalTens.keys()));
    for (let kubun of kubunList) {
      const slot = new Slot(totalTens.get(kubun)!);
      const [hoken, kouhiList] = kubunToHoken(kubun, this.hoken, this.kouhiList);
      if( hoken ){
        const futanWari = futanWariOfHoken(hoken);
        slot.hokenCharge = slot.totalTen * futanWari;
      } else {
        slot.hokenCharge = slot.totalTen * 10;
      }
      slot.patientCharge = slot.hokenCharge;
    }
  }

}

function sortFutanKubun(kubuns: 負担区分コードCode[]): 負担区分コードCode[] {
  kubuns.sort(kubun => -負担区分コードRev.get(kubun)!.length);
  return kubuns;
}

function kubunToHoken(kubun: 負担区分コードCode, hoken: Shahokokuho | Koukikourei | undefined, kouhiList: Kouhi[]):
  [Shahokokuho | Koukikourei | undefined, Kouhi[]] {
  const ks: Kouhi[] = [];
  kubun.split("").forEach((k) => {
    if (k !== "H") {
      const i = parseInt(k);
      ks.push(kouhiList[i - 1]);
    }
  })
  const name = 負担区分コードRev.get(kubun)!;
  return [
    name.startsWith("H") ? hoken : undefined,
    ks
  ];
}