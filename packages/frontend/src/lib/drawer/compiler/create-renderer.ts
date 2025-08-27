import type { DrawerContext } from "./context";

export function createRendererInterface(ctx: DrawerContext): string {
  const lines: string[] = [];
  lines.push(`interface DataInterface {`);
  for (let key of Object.keys(ctx.marks)) {
    let line: string;
    if (key.endsWith("-mark")) {
      line = `  '${key}'?: boolean;`;
    } else {
      line = `  '${key}'?: string;`;
    }
    lines.push(line);
  }
  lines.push(`};`);
  return lines.join("\n");
}

export function createRendererMap(ctx: DrawerContext, name: string = "dataMap", _values: Record<string, string> = {}): string {
  const lines: string[] = [];
  lines.push(`let ${name} = {`);
  for (let key of Object.keys(ctx.marks)) {
    if (key.endsWith("-mark")) {
      lines.push(`  '${key}': false,`);
    } else {
      lines.push(`  '${key}': "",`);
    }
  }
  lines.push(`};`);
  return lines.join("\n");
}

export function createRendererInputs(ctx: DrawerContext, name: string = "dataMap"): string {
  const lines: string[] = [];
  lines.push(...Object.keys(ctx.marks).map(key => {
    if (key.endsWith("-mark")) {
      return `<div class='drawer-input'><span>${key}</span><input type="checkbox" bind:value={${name}['${key}']}/></div>`;
    } else {
      return `<div class='drawer-input'><span>${key}</span><input type="text" bind:value={${name}['${key}']}/></div>`;
    }
  }));
  return lines.join("\n");
}