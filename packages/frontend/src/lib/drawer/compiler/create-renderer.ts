import type { DrawerContext } from "./context";

export function createRendererInterface(ctx: DrawerContext): string {
  const lines: string[] = [];
  lines.push(`interface DataInterface {`);
  for(let key of Object.keys(ctx.marks)){
    lines.push(`  '${key}'?: string;`);
  }
  lines.push(`};`);
  return lines.join("\n");
}

export function createRendererMap(ctx: DrawerContext, values: Record<string, string> = {}): string {
  const lines: string[] = [];
  lines.push(`let dataForm = {`);
  for(let key of Object.keys(ctx.marks)){
    lines.push(`  '${key}': "",`);
  }
  lines.push(`};`);
  return lines.join("\n");
}

export function createRendererInputs(ctx: DrawerContext): string {
  const lines: string[] = [];
  lines.push(...Object.keys(ctx.marks).map(key => {
    return `<span>${key}</span><input type="text" bind:value={dataMap['${key}']}/>`
  }));
  return lines.join("\n");
}