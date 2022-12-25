import { get, writable, type Writable } from "svelte/store";

export enum ScannerState {
  Available,
  Busy,
}

export const scannerUsage: Writable<Record<string, ScannerState>> = writable({});

export function scannerProbed(name: string): void {
  const r = get(scannerUsage);
  if( !(name in r) ){
    r[name] = ScannerState.Available;
    scannerUsage.set(r);
  }
}

export function getScanner(name: string): boolean {
  const r = get(scannerUsage);
  if( r[name] === ScannerState.Available ){
    r[name] = ScannerState.Busy;
    scannerUsage.set(r);
    return true;
  } else {
    return false;
  }
}

export function releaseScanner(name: string) {
  const r = get(scannerUsage);
  r[name] = ScannerState.Available;
  scannerUsage.set(r);
}

export function isScannerAvailable(name: string): boolean {
  const r = get(scannerUsage);
  return r[name] === ScannerState.Available;
}


