import { printApi } from "@/lib/printApi";
import { getScanner, releaseScanner } from "./scan-vars";

export async function startScan(
  device: string,
  onStart: () => void,
  pct: (pct: number) => void,
  onEnd: () => void,
  resolution: number = 100,
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
    }, resolution);
  } catch (ex) {
    console.error("scan-error", ex);
    return undefined;
  } finally {
    releaseScanner(device);
    onEnd();
  }
}
