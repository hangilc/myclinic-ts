import type { Op } from "./op";

export interface DrawerContext {
  ops: Op[];
}

export function mkDrawerContext() {
  return {
    ops: [],
  }
}

