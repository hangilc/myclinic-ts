import { printApi } from "@/lib/printApi";
import { getScanner, releaseScanner, scannerUsage } from "./scan-vars";

export async function startScan(
  device: string,
  onStart: () => void,
  pct: (pct: number) => void,
  onEnd: () => void
): Promise<string | undefined> {
  if( !getScanner(device) ){
    alert("スキャナーを使用できません。");
    return undefined;
  }
  pct(0);
  onStart();
  try {
    return await printApi.scan(device, (loaded, total) => {
      pct((loaded / total) * 100);
    });
  } catch (ex) {
    console.error("scan-error", ex);
    return undefined;
  } finally {
    releaseScanner(device);
    onEnd();
  }
}
