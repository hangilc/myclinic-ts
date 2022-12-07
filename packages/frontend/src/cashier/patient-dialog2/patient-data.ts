import type { Patient } from "myclinic-model";
import { fetchHokenList } from "./fetch-hoken-list";
import type { Hoken } from "./hoken";
import { HokenCache } from "./hoken-cache";
import PatientDialog from "./PatientDialog.svelte";

export type Opener = () => void;

export class PatientData {
  patient: Patient;
  hokenCache: HokenCache;
  stack: Opener[] = [];

  constructor(patient: Patient, currentList: Hoken[]) {
    this.patient = patient;
    this.hokenCache = new HokenCache(currentList);
  }

  getUpdate(h: Hoken): Hoken {
    return this.hokenCache.getUpdate(h.value);
  }

  cleanup() {

  }

  getPatient(): Patient {
    return this.patient;
  }

  getCurrentList(): Hoken[] {
    const today = new Date();
    return this.hokenCache.listCurrent();
  }

  push(opener: Opener): void {
    opener();
    this.stack.push(opener);
  }

  pop(): void {
    this.stack.pop();
  }

  goback(): void {
    this.pop();
    const o = this.stack.pop();
    if( o !== undefined ){
      this.push(o);
    } else {
      this.cleanup();
    }
  }

  exit() {
    this.cleanup();
  }

  static async start(patient: Patient) {
    const hokenList: Hoken[] = await fetchHokenList(patient.patientId);
    const data = new PatientData(patient, hokenList);
    function open(): void {
      const d: PatientDialog = new PatientDialog({
        target: document.body,
        props: {
          data,
          destroy: () => d.$destroy(),
        }
      });
    }
    data.push(open);
  }
}