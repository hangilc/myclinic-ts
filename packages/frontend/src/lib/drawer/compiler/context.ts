import type { Box } from "./box";
import { mkFontManager, type FontSizeManager } from "./font-size-manager";
import type { Op } from "./op";

export interface DrawerContext {
  ops: Op[];
  fsm: FontSizeManager;
  marks: Record<string, Box>;
}

export function mkDrawerContext() {
  return {
    ops: [],
    fsm: mkFontManager(),
    marks: {},
  }
}

