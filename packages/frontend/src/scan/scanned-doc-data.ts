import api from "@/lib/api";
import { printApi } from "@/lib/printApi";

export enum UploadStatus {
  NotYet,
  Success,
  Failure,
}

export class ScannedDocData {
  uploadStatus: UploadStatus = UploadStatus.NotYet;
  constructor(
    public patientId: number,
    public scannedImageFile: string,
    public uploadFileName: string,
    public index: number,
  ) {}

  async upload(): Promise<boolean> {
    const data = await printApi.getScannedFile(this.scannedImageFile);
    return await api.savePatientImage(
      this.patientId,
      this.uploadFileName,
      data
    );
  }
}
