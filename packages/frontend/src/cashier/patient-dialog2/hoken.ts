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

  updateValue(v: HokenType): Hoken {
    return new Hoken(v, this.usageCount);
  }

  get asShahokokuho(): Shahokokuho {
    if( this.value instanceof Shahokokuho ){
      return this.value;
    } else {
      throw new Error("Cannot get Shahokokuho value.");
    }
  }

  get asKoukikourei(): Koukikourei {
    if( this.value instanceof Koukikourei ){
      return this.value;
    } else {
      throw new Error("Cannot get Koukikourei value.");
    }
  }

  get asRoujin(): Roujin {
    if( this.value instanceof Roujin ){
      return this.value;
    } else {
      throw new Error("Cannot get Roujin value.");
    }
  }

  get asKouhi(): Kouhi {
    if( this.value instanceof Kouhi ){
      return this.value;
    } else {
      throw new Error("Cannot get Kouhi value.");
    }
  }

  get hokenId(): number {
    return Hoken.fold(
      this.value,
      (h) => h.shahokokuhoId,
      (h) => h.koukikoureiId,
      (h) => h.roujinId,
      (h) => h.kouhiId,
    );
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

  get name(): string {
    return Hoken.fold(
      this.value,
      (_) => "社保国保",
      (_) => "後期高齢",
      (_) => "老人保険",
      (_) => "公費",
    )
  }

  get slug(): string {
    return Hoken.fold(
      this.value,
      (_) => "shahokokuho",
      (_) => "koukikourei",
      (_) => "roujin",
      (_) => "kouhi",
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


}
