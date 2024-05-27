import { mkRyouyouKeikakushoKeizokuContext } from "./ryouyou-keikakusho-keizoku-drawer";
import { mkRyouyouKeikakushoShokaiContext } from "./ryouyou-keikakusho-shokai-drawer";

export function createInterface(): string {
  const ctxShokai = mkRyouyouKeikakushoShokaiContext();
  const ctxKeizoku = mkRyouyouKeikakushoKeizokuContext();
  const marks = Object.assign({}, ctxShokai.marks, ctxKeizoku.marks);
  const lines: string[] = [];
  lines.push("interface RyouyouKeikakushoData {")
  Object.keys(marks).forEach(key => {
    lines.push(`  "${key}": string;`);
  })
  lines.push("}");
  return lines.join("\n");
}

export function createDataMap(): string {
  const ctxShokai = mkRyouyouKeikakushoShokaiContext();
  const ctxKeizoku = mkRyouyouKeikakushoKeizokuContext();
  const marks = Object.assign({}, ctxShokai.marks, ctxKeizoku.marks);
  const lines: string[] = [];
  lines.push("let ryouyouKeikakushoData: RyouyouKeikakushoData = {")
  Object.keys(marks).forEach(key => {
    lines.push(`  "${key}": "",`);
  })
  lines.push("}");
  return lines.join("\n");
}

export function createShokaiInputs(): string {
  const ctxShokai = mkRyouyouKeikakushoShokaiContext();
  const marks = ctxShokai.marks;
  const dataName = "ryouyouKeikakushoData";
  const lines: string[] = [];
  Object.keys(marks).forEach(key => {
    lines.push(`<div class="data-input"
      ><span>${key}</span
      ><input type="text" bind:value={${dataName}['${key}']}/></div>`);
  })
  return lines.join("\n");
}
export function createKeizokuInputs(): string {
  const ctxKeizoku = mkRyouyouKeikakushoKeizokuContext();
  const marks = ctxKeizoku.marks;
  const dataName = "ryouyouKeikakushoData";
  const lines: string[] = [];
  Object.keys(marks).forEach(key => {
    lines.push(`<div class="data-input"
      ><span>${key}</span
      ><input type="text" bind:value={${dataName}['${key}']}/></div>`);
  })
  return lines.join("\n");
}