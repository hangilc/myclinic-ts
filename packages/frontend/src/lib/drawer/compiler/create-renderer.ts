import type { DrawerContext } from "./context";

export function createRendererData(ctx: DrawerContext): string {
  return Object.keys(ctx.marks).map(k => `"${k}"?: string;`).join("\n");
}

export function createRenderer(ctx: DrawerContext): string {
  return Object.keys(ctx.marks).map(k => {
    return `c.renderData(ctx, "${k}", data["${k}"], ropt({ }));`
  }).join("\n");
}