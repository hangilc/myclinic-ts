import { TaskQueue } from "@/lib/task-queue";
import type { Patient } from "myclinic-model";
import type { ScannerDevice } from "myclinic-model/model";
import { kindChoices } from "./kind-choices";
import { isScannerAvailable } from "./scan-vars";
import { ScannedDocData } from "./scanned-doc-data";
import { startScan } from "./start-scan";

export class ScanManager {
  patient: Patient | undefined = undefined;
  onPatientChange: (p: Patient) => void = (_) => {};
  scanDevice: ScannerDevice | undefined = undefined;
  onScannerChange: (device: ScannerDevice | undefined) => void = (_) => {};
  kindKey: string = "その他";
  onKindKeyChange: (key: string) => void = (_) => {};
  onScannableChange: (canScan: boolean) => void = (_) => {};
  onScanStart: () => void = () => {};
  onScanEnd: () => void = () => {};
  onScanPctChange: (pct: number) => void = (_) => {};
  scanDateOpt: Date | undefined = undefined;
  docs: ScannedDocData[] = [];
  onDocsChange: (docs: ScannedDocData[]) => void = (_) => {};
  tq: TaskQueue = new TaskQueue();
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

  get scanDate(): Date {
    if (this.scanDateOpt == undefined) {
      this.scanDateOpt = new Date();
    }
    return this.scanDateOpt;
  }

  triggerScannableChange(): void {
    this.onScannableChange(
      this.isScannerAvailable && this.patient != undefined
    );
  }

  async scan() {
    const scanner = this.scanDevice;
    if (scanner == undefined) {
      alert("スキャナーが設定されていません。");
      return;
    }
    if( this.patient == undefined ){
      alert("患者が選択されていません。");
      return;
    }
    const patientId = this.patient.patientId;
    const kind = this.scanKind;
    const img = await startScan(
      scanner.deviceId,
      () => this.onScanStart(),
      (pct) => this.onScanPctChange(pct),
      () => this.onScanEnd()
    );
    if( img == undefined ){
      alert("スキャンに失敗しました。");
      return;
    }
    this.tq.append(async () => {
      const index = this.docs.length + 1;
      const data = new ScannedDocData(img, patientId, kind, this.scanDate, index);
      this.docs.push(data);
      this.onDocsChange(this.docs);
    });
  }

  dispose(): void {
    this.unsubs.forEach((f) => f());
  }
}
