import type { Box } from "./box";
import type { DataRendererOpt } from "./compiler";
import { mkFontManager, type FontSizeManager } from "./font-size-manager";
import type { Op } from "./op";

export interface DrawerContext {
  ops: Op[];
  pages: Op[][];
  fsm: FontSizeManager;
  marks: Record<string, { box: Box, ops: Op[] }>;
  dataRenderOptions: Record<string, DataRendererOpt>;
  currentFont: string | undefined;
  currentPen: string | undefined;
  setup: Op[];
}

export function mkDrawerContext(initSetup: (ctx: DrawerContext) => void = _ => { }): DrawerContext {
  const setup: Op[] = [];
  const ctx: DrawerContext = {
    ops: setup,
    pages: [],
    setup: [],
    fsm: mkFontManager(),
    marks: {},
    dataRenderOptions: {},
    currentFont: undefined,
    currentPen: undefined,
  }
  initSetup(ctx);
  ctx.ops = [...setup];
  ctx.pages = [ctx.ops];
  ctx.setup = setup;
  return ctx;
}

