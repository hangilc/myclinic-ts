import api from "@/lib/api";
import { printApi } from "@/lib/printApi";
import { makeUploadFileName } from "./make-upload-file-name";

export enum UploadStatus {
  NotYet,
  Success,
  Failure,
}

export class ScannedDocData {
  uploadStatus: UploadStatus = UploadStatus.NotYet;
  constructor(
    public scannedImageFile: string,
    public patientId: number,
    public kind: string,
    public date: Date,
    public index: number
  ) {}

  async upload(): Promise<void> {
    if (this.uploadStatus === UploadStatus.Success) {
      return;
    } else {
      const data = await printApi.getScannedFile(this.scannedImageFile);
      try {
        await api.savePatientImage(this.patientId, this.uploadFileName, data);
        this.uploadStatus = UploadStatus.Success;
      } catch (ex) {
        console.error(ex);
        this.uploadStatus = UploadStatus.Failure;
      }
    }
  }

  get uploadFileName(): string {
    return makeUploadFileName(this.patientId, this.kind, this.date, this.index);
  }

  get scannedImageUrl(): string {
    return printApi.scannedFileUrl(this.scannedImageFile);
  }
}
