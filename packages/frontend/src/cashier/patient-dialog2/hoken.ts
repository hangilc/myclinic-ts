import { kouhiRep, koukikoureiRep, roujinRep, shahokokuhoRep } from "@/lib/hoken-rep";
import { Kouhi, Koukikourei, Roujin, Shahokokuho } from "myclinic-model";

export type HokenType = Shahokokuho | Koukikourei | Roujin | Kouhi;

export class Hoken {
  value: HokenType;
  key: string;
  usageCount: number;

  constructor(value: HokenType, usageCount: number) {
    this.value = value;
    this.key = Hoken.composeKey(value);
    this.usageCount = usageCount;
  }

  isValidAt(at: Date): boolean {
    return Hoken.fold<boolean>(
      this.value,
      (h) => h.isValidAt(at),
      (h) => h.isValidAt(at),
      (h) => h.isValidAt(at),
      (h) => h.isValidAt(at)
    );
  }

  get rep(): string {
    return Hoken.fold(
      this.value,
      (h) => Hoken.shahokokuhoRep(h),
      (h) => Hoken.koukikoureiRep(h),
      (h) => Hoken.roujinRep(h),
      (h) => Hoken.kouhiRep(h)
    );
  }

  get name(): string {
    return Hoken.fold(
      this.value,
      (h) => "社保国保",
      (h) => "後期高齢",
      (h) => "老人保険",
      (h) => "公費",
    )
  }

  static fold<T>(
    h: HokenType,
    shahokokuhoHandler: (s: Shahokokuho) => T,
    koukikoureiHandler: (k: Koukikourei) => T,
    roujinHandler: (r: Roujin) => T,
    kouhiHandler: (k: Kouhi) => T
  ): T {
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

  static composeKey(h: HokenType): string {
    return Hoken.fold(
      h,
      (h) => `shahokokuho-${h.shahokokuhoId}`,
      (h) => `koukikourei-${h.koukikoureiId}`,
      (h) => `roujin-${h.roujinId}`,
      (h) => `kouhi-${h.kouhiId}`
    );
  }

  static shahokokuhoRep(h: Shahokokuho): string {
    return shahokokuhoRep(h);
  }

  static koukikoureiRep(h: Koukikourei): string {
    return koukikoureiRep(h.futanWari);
  }

  static roujinRep(h: Roujin): string {
    return roujinRep(h.futanWari);
  }

  static kouhiRep(h: Kouhi): string {
    return kouhiRep(h.futansha);
  }

}
