import { mkFontManager, type FontSizeManager } from "./font-size-manager";
import type { Op } from "./op";

export interface DrawerContext {
  ops: Op[];
  fsm: FontSizeManager;
}

export function mkDrawerContext() {
  return {
    ops: [],
    fsm: mkFontManager(),
  }
}

