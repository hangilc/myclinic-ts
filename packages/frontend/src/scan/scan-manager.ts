import api from "@/lib/api";
import { printApi } from "@/lib/printApi";
import { TaskQueue } from "@/lib/task-queue";
import type { Patient } from "myclinic-model";
import type { ScannerDevice } from "myclinic-model/model";
import { kindChoices } from "./kind-choices";
import { isScannerAvailable, scannerUsage } from "./scan-vars";
import { ScannedDocData, UploadStatus } from "./scanned-doc-data";
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

  constructor() {
    this.unsubs.push(
      scannerUsage.subscribe((_) => {
        this.triggerScannableChange();
      })
    );
  }

  async changePatientTo(data: ScannedDocData, patientId: number) {
    if (data.uploadStatus === UploadStatus.Success) {
      await api.deletePatientImage(data.patientId, data.uploadFileName);
    }
    data.patientId = patientId;
    data.uploadStatus = UploadStatus.NotYet;
  }

  setPatient(patient: Patient): void {
    this.tq.append(async () => {
      const docs = this.docs;
      const proms = docs.map((d) => this.changePatientTo(d, patient.patientId));
      await Promise.all(proms);
      this.patient = patient;
      this.onPatientChange(patient);
      this.triggerScannableChange();
      this.onDocsChange(this.docs);
    });
  }

  setDevice(device: ScannerDevice): void {
    this.scanDevice = device;
    this.onScannerChange(device);
    this.triggerScannableChange();
  }

  async changeKindTo(data: ScannedDocData, kind: string) {
    if (data.uploadStatus === UploadStatus.Success) {
      await api.deletePatientImage(data.patientId, data.uploadFileName);
    }
    data.kind = kind;
    data.uploadStatus = UploadStatus.NotYet;
  }

  setKindKey(key: string): void {
    const kind = kindChoices[key] || "image";
    this.tq.append(async () => {
      const docs = this.docs;
      const proms = docs.map((d) => this.changeKindTo(d, kind));
      await Promise.all(proms);
      this.kindKey = key;
      this.onKindKeyChange(key);
      this.onDocsChange(this.docs);
    });
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
    if (this.patient == undefined) {
      alert("患者が選択されていません。");
      return;
    }
    const patientId = this.patient.patientId;
    const kind = this.scanKind;
    const img = await startScan(
      scanner.deviceId,
      () => this.onScanStart(),
      (pct) => {
        this.onScanPctChange(pct);
      },
      () => this.onScanEnd()
    );
    if (img == undefined) {
      return;
    }
    this.tq.append(async () => {
      const index = this.docs.length + 1;
      const data = new ScannedDocData(
        img,
        patientId,
        kind,
        this.scanDate,
        index
      );
      this.docs.push(data);
      this.onDocsChange(this.docs);
    });
  }

  async reScan(data: ScannedDocData) {
    const id = data.id;
    const scanner = this.scanDevice;
    if (scanner == undefined) {
      alert("スキャナーが設定されていません。");
      return;
    }
    const patientId = data.patientId;
    const prevUploadImage = data.uploadFileName;
    const kind = this.scanKind;
    const img = await startScan(
      scanner.deviceId,
      () => this.onScanStart(),
      (pct) => this.onScanPctChange(pct),
      () => this.onScanEnd()
    );
    if (img == undefined) {
      return;
    }
    this.tq.append(async () => {
      const docs = this.docs;
      const i = docs.findIndex((d) => d.id === id);
      if (i >= 0) {
        const d = docs[i];
        if (d.uploadStatus === UploadStatus.Success) {
          await api.deletePatientImage(patientId, prevUploadImage);
        }
        await printApi.deleteScannedFile(d.scannedImageFile);
        d.scannedImageFile = img;
        d.uploadStatus = UploadStatus.NotYet;
        this.onDocsChange(docs);
      }
    });
  }

  async deleteDoc(data: ScannedDocData) {
    const id = data.id;
    this.tq.append(async () => {
      const docs = this.docs;
      const i = docs.findIndex((d) => d.id === id);
      if (i >= 0) {
        let d: ScannedDocData = docs[i];
        if (d.uploadStatus === UploadStatus.Success) {
          await api.deletePatientImage(d.patientId, d.uploadFileName);
        }
        await printApi.deleteScannedFile(d.scannedImageFile);
        for (let j = i + 1; j < docs.length; j++) {
          d = docs[j];
          const src = d.uploadFileName;
          d.index = j;
          if (d.uploadStatus === UploadStatus.Success) {
            await api.renamePatientImage(d.patientId, src, d.uploadFileName);
          }
        }
        docs.splice(i, 1);
        this.onDocsChange(docs);
      }
    });
  }

  async upload() {
    this.tq.append(async () => {
      const docs = this.docs;
      const proms = docs
        .filter((d) => d.uploadStatus !== UploadStatus.Success)
        .map(async (d) => {
          const bytes = await printApi.getScannedFile(d.scannedImageFile);
          try {
            await api.savePatientImage(d.patientId, d.uploadFileName, bytes);
            d.uploadStatus = UploadStatus.Success;
          } catch (ex) {
            console.error(ex);
            d.uploadStatus = UploadStatus.Failure;
          }
        });
      await Promise.all(proms);
      this.onDocsChange(docs);
    });
  }

  async deleteScannedImages() {
    this.tq.append(async () => {
      const docs = this.docs;
      const proms = docs.map(async (d) => {
        await printApi.deleteScannedFile(d.scannedImageFile);
      });
      await Promise.all(proms);
      this.docs = [];
      this.onDocsChange(docs);
    });
  }

  dispose(): void {
    this.unsubs.forEach((f) => f());
  }
}
