
export class CachedValue<T> {
  cached: T | undefined;
  #fetcher: () => Promise<T>

  constructor(fetcher: () => Promise<T>) {
    this.#fetcher = fetcher;
  }

  async get(): Promise<T> {
    if( this.cached === undefined ){
      this.cached = await this.#fetcher();
      return this.cached;
    } else {
      return this.cached;
    }
    
  }
}
