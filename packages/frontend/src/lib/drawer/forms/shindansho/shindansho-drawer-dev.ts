import { mkShindanshoDrawerData } from "./shindansho-drawer";

export function printShindanshoDrawerInputs() {
  const data = mkShindanshoDrawerData();
  for(let key in data) {
    console.log(`<span>${key}</span>`);
    console.log(`<input type="text" bind:value={data["${key}"]} />`);
  }
}