import type { Patient } from "myclinic-model";
import type { ScannerDevice } from "myclinic-model/model";
import { kindChoices } from "./kind-choices";
import { isScannerAvailable } from "./scan-vars";

export class ScanManager {
  patient: Patient | undefined = undefined;
  onPatientChange: (p: Patient) => void = (_) => {};
  scanDevice: ScannerDevice | undefined = undefined;
  onScannerChange: (device: ScannerDevice | undefined) => void = (_) => {};
  kindKey: string = "その他";
  onKindKeyChange: (key: string) => void = (_) => {};
  onScannableChange: (canScan: boolean) => void = (_) => {};
  unsubs: (() => void)[] = [];

  constructor() {}

  setPatient(patient: Patient): void {
    this.patient = patient;
    this.onPatientChange(patient);
    this.triggerScannableChange();
  }

  setDevice(device: ScannerDevice): void {
    this.scanDevice = device;
    this.onScannerChange(device);
    this.triggerScannableChange();
  }

  setKindKey(key: string): void {
    this.kindKey = key;
    this.onKindKeyChange(key);
  }

  get scanKind(): string {
    const kind = kindChoices[this.kindKey];
    return kind || "image";
  }

  get isScannerAvailable(): boolean {
    const device = this.scanDevice;
    if (device == undefined) {
      return false;
    } else {
      return isScannerAvailable(device.deviceId);
    }
  }

  triggerScannableChange(): void {
    this.onScannableChange(
      this.isScannerAvailable && this.patient != undefined
    );
  }

  dispose(): void {
    this.unsubs.forEach((f) => f());
  }
}
