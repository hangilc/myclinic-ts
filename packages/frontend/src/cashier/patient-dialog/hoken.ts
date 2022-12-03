import {
  kouhiRep,
  koukikoureiRep,
  roujinRep,
  shahokokuhoRep,
} from "@/lib/hoken-rep";
import { Koukikourei, Shahokokuho, Kouhi, Roujin } from "myclinic-model";

export type HokenType = Shahokokuho | Koukikourei | Roujin | Kouhi;

export class Hoken {
  value: HokenType;

  constructor(value: HokenType) {
    this.value = value;
  }

  fold<T>(
    shahokokuhoHandler: (s: Shahokokuho) => T,
    koukikoureiHandler: (k: Koukikourei) => T,
    roujinHandler: (r: Roujin) => T,
    kouhiHandler: (k: Kouhi) => T
  ): T {
    const h = this.value;
    if (h instanceof Shahokokuho) {
      return shahokokuhoHandler(h);
    } else if (h instanceof Koukikourei) {
      return koukikoureiHandler(h);
    } else if (h instanceof Roujin) {
      return roujinHandler(h);
    } else if (h instanceof Kouhi) {
      return kouhiHandler(h);
    } else {
      throw new Error("不明の保険：" + h);
    }
  }

  isValidAt(d: Date): boolean {
    return this.fold(
      h => h.isValidAt(d),
      h => h.isValidAt(d),
      h => h.isValidAt(d),
      h => h.isValidAt(d),
    )
  }

  get key(): string {
    return this.fold(
      h => `shahokokuho-${h.shahokokuhoId}`,
      h => `koukikourei-${h.koukikoureiId}`,
      h => `roujin-${h.roujinId}`,
      h => `kouhi-${h.kouhiId}`,
    )
  }

  get rep(): string {
    return this.fold(
      h => shahokokuhoRep(h),
      h => koukikoureiRep(h.futanWari),
      h => roujinRep(h.futanWari),
      h => kouhiRep(h.futansha),
    )
  }
}
