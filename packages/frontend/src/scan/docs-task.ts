import api from "@/lib/api";
import { TaskQueue } from "@/lib/task-queue";
import { UploadStatus, type ScannedDocData } from "./scanned-doc-data";

const tq = new TaskQueue();

export async function taskDelete(
  docsRef: () => ScannedDocData[],
  data: ScannedDocData,
  callback: (docs: ScannedDocData[]) => void
): Promise<void> {
  const patientId = data.patientId;
  const docs = docsRef();
  const i = docs.findIndex((d) => d === data);
  if (i < 0) {
    return;
  }
  if (data.uploadStatus === UploadStatus.Success) {
    await api.deletePatientImage(patientId, data.uploadFileName);
  }
  for (let j = i + 1; j < docs.length; j++) {
    const d = docs[j];
    const prevFileName = d.uploadFileName;
    d.index = j - 1;
    if (d.uploadStatus === UploadStatus.Success) {
      await api.renamePatientImage(patientId, prevFileName, d.uploadFileName);
    }
  }
  docs.splice(i, 1);
  callback(docs);
}

export function docsAddTask(task: () => Promise<void>): void {
  tq.append(task);
}
