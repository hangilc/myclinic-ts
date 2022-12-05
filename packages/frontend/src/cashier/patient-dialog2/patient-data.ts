import type { Patient } from "myclinic-model";
import { get, writable, type Writable } from "svelte/store";
import { fetchHokenList } from "./fetch-hoken-list";
import type { Hoken } from "./hoken";
import { HokenCache } from "./hoken-cache";
import PatientDialog from "./PatientDialog.svelte";

export type Opener = () => void;

export class PatientData {
  patient: Writable<Patient>;
  hokenCache: HokenCache;
  stack: Opener[] = [];

  constructor(patient: Patient, currentList: Hoken[]) {
    this.patient = writable(patient);
    this.hokenCache = new HokenCache(currentList);
  }

  getPatient(): Patient {
    return get(this.patient);
  }

  getCurrentList(): Hoken[] {
    const today = new Date();
    return get(this.hokenCache.cache).filter(h => h.isValidAt(today));
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
    const o = this.stack.shift();
    if( o !== undefined ){
      this.push(o);
    }
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