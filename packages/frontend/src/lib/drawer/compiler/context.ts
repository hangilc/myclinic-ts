import type { Box } from "./box";
import { mkFontManager, type FontSizeManager } from "./font-size-manager";
import type { Op } from "./op";

export interface DrawerContext {
  ops: Op[];
  fsm: FontSizeManager;
  marks: Record<string, Box>;
  currentFont: string | undefined;
}

export function mkDrawerContext(): DrawerContext {
  return {
    ops: [],
    fsm: mkFontManager(),
    marks: {},
    currentFont: undefined,
  }
}

