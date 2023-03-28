import { Hoken, type HokenType } from "./hoken";

export class Hoken1<T extends HokenType> extends Hoken {
  constructor(value: T, usageCount: number) {
    super(value, usageCount);
  }
}

export class HokenCache {
  #cache: Hoken[];

  constructor(list: Hoken[]){
    this.#cache = [...list];
  }

  updateWithHokenType(ht: HokenType): void {
    const key = Hoken.composeKey(ht);
    const hs = this.#cache;
    const i = hs.findIndex(h => h.key === key);
    if( i >= 0 ){
      const h = hs[i];

      hs.splice(i, 1, h.updateValue(ht));
    }
  }

  enterHokenType(ht: HokenType): void {
    const h = new Hoken(ht, 0);
    this.#cache.push(h);
  }

  remove(ht: HokenType): void {
    const key = Hoken.composeKey(ht);
    const i = this.#cache.findIndex(h => h.key === key);
    if( i >= 0 ){
      this.#cache.splice(i, 1);
    } else {
      console.error("Cannot find hoken to remove: " + ht);
    }
  }

  getUpdate(ht: HokenType): Hoken{
    const key = Hoken.composeKey(ht);
    const hs = this.#cache;
    const i = hs.findIndex(h => h.key === key);
    if( i >= 0 ){
      return hs[i];
    } else {
      throw new Error("Cannot find in cache: " + ht);
    }
  }

  listCurrent(): Hoken[] {
    const today = new Date();
    return this.#cache.filter(h => h.isValidAt(today));
  }

  listAll(): Hoken[] {
    return [...this.#cache];
  }
}
