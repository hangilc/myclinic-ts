import api from "@/lib/api";
import type { EventEmitter } from "@/lib/event-emitter";
import type { Patient } from "myclinic-model";
import { batchFromHoken, fetchHokenList } from "./fetch-hoken-list";
import type { Hoken } from "./hoken";
import { HokenCache } from "./hoken-cache";
import PatientDialog from "./PatientDialog.svelte";

export type Opener = () => void;

export class PatientData {
  patient: Patient;
  hokenCache: HokenCache;
  stack: Opener[] = [];
  hotlineTrigger: EventEmitter<string> | undefined = undefined;

  constructor(patient: Patient, currentList: Hoken[]) {
    this.patient = patient;
    this.hokenCache = new HokenCache(currentList);
  }

  async fetchAllHoken() {
    const [shahokokuhoList, koukikoureiList, roujinList, kouhiList] =
      await api.listAllHoken(this.patient.patientId);
    const hs: Hoken[] = await batchFromHoken(
      shahokokuhoList,
      koukikoureiList,
      roujinList,
      kouhiList
    );
    this.hokenCache = new HokenCache(hs);
  }

  getUpdate(h: Hoken): Hoken {
    return this.hokenCache.getUpdate(h.value);
  }

  cleanup() {}

  getPatient(): Patient {
    return this.patient;
  }

  getCurrentList(): Hoken[] {
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
    if (o !== undefined) {
      this.push(o);
    } else {
      this.cleanup();
    }
  }

  reopen(): void {
    if( this.stack.length > 0 ){
      this.stack[this.stack.length - 1]();
    }
  }

  exit() {
    this.cleanup();
  }

  sendHotlineMessage(msg: string): void {
    this.hotlineTrigger?.emit(msg);
  }

  static async start(patient: Patient, config: StartConfig = {}) {
    const hokenList: Hoken[] = await fetchHokenList(patient.patientId);
    const data = new PatientData(patient, hokenList);
    data.hotlineTrigger = config.hotlineTrigger;
    function open(): void {
      const d: PatientDialog = new PatientDialog({
        target: document.body,
        props: {
          data,
          destroy: () => d.$destroy(),
        },
      });
    }
    data.push(open);
  }
}

export interface StartConfig {
  hotlineTrigger?: EventEmitter<string>;
}
