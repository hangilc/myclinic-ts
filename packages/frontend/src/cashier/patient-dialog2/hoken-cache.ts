import { writable, type Writable } from "svelte/store";
import type { Hoken } from "./hoken";

export class HokenCache {
  cache: Writable<Hoken[]>;

  constructor(list: Hoken[]){
    this.cache = writable(list);
  }
}
