import api from "@/lib/api";
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

  fold<T>(
    shahokokuhoHandler: (s: Shahokokuho) => T,
    koukikoureiHandler: (k: Koukikourei) => T,
    roujinHandler: (r: Roujin) => T,
    kouhiHandler: (k: Kouhi) => T
  ): T {
    return Hoken.fold<T>(
      this.value,
      shahokokuhoHandler,
      koukikoureiHandler,
      roujinHandler,
      kouhiHandler
    );
  }

  get validFrom(): string {
    return this.fold(
      (h) => h.validFrom,
      (h) => h.validFrom,
      (h) => h.validFrom,
      (h) => h.validFrom
    );
  }

  get patientId(): number {
    return Hoken.patientId(this.value);
  }

  get asShahokokuho(): Shahokokuho {
    if( this.value instanceof Shahokokuho ){
      return this.value;
    } else {
      throw new Error("Is not shahokokuho: " + this.value);
    }
  }

  isValidAt(d: Date): boolean {
    return this.fold(
      (h) => h.isValidAt(d),
      (h) => h.isValidAt(d),
      (h) => h.isValidAt(d),
      (h) => h.isValidAt(d)
    );
  }

  get hokenType(): string {
    return Hoken.hokenType(this.value);
  }

  get rep(): string {
    return this.fold(
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

  static hokenType(h: HokenType): string {
    return Hoken.fold(
      h,
      (_) => "shahokokuho",
      (_) => "koukikourei",
      (_) => "roujin",
      (_) => "kouhi"
    );
  }

  static patientId(h: HokenType): number {
    return Hoken.fold(
      h,
      (h) => h.patientId,
      (h) => h.patientId,
      (h) => h.patientId,
      (h) => h.patientId,
    )
  }

  static async getUsageCount(h: Shahokokuho | Koukikourei | Roujin | Kouhi): Promise<number> {
    return await Hoken.fold<Promise<number>>(
      h,
      async (h) => {
        return (await api.batchCountHokenUsage([h.shahokokuhoId], [], [], []))[0][0]
      },
      async (h) => {
        return (await api.batchCountHokenUsage([], [h.koukikoureiId], [], []))[1][0]
      },
      async (h) => {
        return (await api.batchCountHokenUsage([], [], [h.roujinId], []))[2][0]
      },
      async (h) => {
        return (await api.batchCountHokenUsage([], [], [], [h.kouhiId]))[3][0]
      },
    )
  }

  static async batchFromHoken(shahokokuhoList: Shahokokuho[], koukikoureiList: Koukikourei[], 
    roujinList: Roujin[], kouhiList: Kouhi[]): Promise<Hoken[]> {
      const [shahoMap, koukiMap, roujinMap, kouhiMap] = await api.batchCountHokenUsage(
        shahokokuhoList.map(e => e.shahokokuhoId), 
        koukikoureiList.map(e => e.koukikoureiId), 
        roujinList.map(e => e.roujinId), 
        kouhiList.map(e => e.kouhiId)
      );
      const shahokokuhoHokens: Hoken[] = shahokokuhoList.map(h => {
        return new Hoken(h, shahoMap[h.shahokokuhoId]);
      });
      const koukikoureiHokens: Hoken[] = koukikoureiList.map(h => {
        return new Hoken(h, koukiMap[h.koukikoureiId]);
      });
      const roujinHokens: Hoken[] = roujinList.map(h => {
        return new Hoken(h, roujinMap[h.roujinId]);
      });
      const kouhiHokens: Hoken[] = kouhiList.map(h => {
        return new Hoken(h, kouhiMap[h.kouhiId]);
      })
      return [...shahokokuhoHokens, ...koukikoureiHokens, 
        ...roujinHokens, ...kouhiHokens];
    }

  static async fromHoken(h: HokenType): Promise<Hoken> {
    const c: number = await Hoken.getUsageCount(h);
    return new Hoken(h, c);
  }
}
