import type { Box } from "./box";
import type { DataRendererOpt } from "./compiler";
import { mkFontManager, type FontSizeManager } from "./font-size-manager";
import type { Op } from "./op";

export interface DrawerContext {
  ops: Op[];
  fsm: FontSizeManager;
  marks: Record<string, Box>;
  dataRenderOptions: Record<string, DataRendererOpt>;
  currentFont: string | undefined;
  currentPen: string | undefined;
}

export function mkDrawerContext(): DrawerContext {
  return {
    ops: [],
    fsm: mkFontManager(),
    marks: {},
    dataRenderOptions: {},
    currentFont: undefined,
    currentPen: undefined,
  }
}

