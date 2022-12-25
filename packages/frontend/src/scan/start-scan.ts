import { printApi } from "@/lib/printApi";
import { get, type Writable } from "svelte/store";
import { getScanner, releaseScanner, scannerUsage } from "./scan-vars";

export async function startScan(
  device: string,
  isScanning: Writable<boolean>,
  pct: Writable<number>
): Promise<string | undefined> {
  console.log(get(scannerUsage));
  console.log("device", device);
  if( !getScanner(device) ){
    alert("スキャナーを使用できません。");
    return undefined;
  }
  pct.set(0);
  isScanning.set(true);
  try {
    return await printApi.scan(device, (loaded, total) => {
      pct.set((loaded / total) * 100);
    });
  } catch (ex) {
    return undefined;
  } finally {
    releaseScanner(device);
    isScanning.set(false);
  }
}
