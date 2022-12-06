import type { Kouhi, Koukikourei, Patient, Roujin, Shahokokuho } from "myclinic-model";
import { Hoken, type HokenType } from "./hoken";
import {
  kouhiEntered,
  kouhiUpdated,
  koukikoureiEntered,
  koukikoureiUpdated,
  patientUpdated,
  shahokokuhoEntered,
  shahokokuhoUpdated,
} from "@/app-events";
import { get, writable, type Writable } from "svelte/store";
import api from "@/lib/api";
import type { Opener, Closer } from "./openers/opener";
import { infoOpener } from "./openers/info-opener";

export class PatientData {
  patient: Writable<Patient>;
  hokenCache: Writable<Hoken[]>;
  allHokenLoaded: boolean = false;
  unsubs: (() => void)[] = [];
  stack: [Opener, Closer][] = [];

  constructor(patient: Patient, currentHokenList: Hoken[]) {
    this.patient = writable(patient);
    this.hokenCache = writable(currentHokenList);
    this.unsubs.push(
      patientUpdated.subscribe((patient) => {
        if (patient != null) {
          this.patient.set(patient);
        }
      })
    );
    [shahokokuhoEntered, koukikoureiEntered, kouhiEntered].forEach((w) =>
      this.enterSubscribe(w)
    );
    [shahokokuhoUpdated, koukikoureiUpdated, kouhiUpdated].forEach((w) =>
      this.updateSubscribe(w)
    );
  }

  enterSubscribe(w: Writable<Shahokokuho | Koukikourei | Kouhi | null>): void {
    this.unsubs.push(
      w.subscribe(async (v) => {
        if (v == null) {
          return;
        }
        const h = await Hoken.fromHoken(v);
        console.log("entered", h);
        const patient = get(this.patient);
        if (patient.patientId === h.patientId) {
          this.addToCache(h);
        }
      })
    );
  }

  updateSubscribe(w: Writable<Shahokokuho | Koukikourei | Kouhi | null>): void {
    this.unsubs.push(
      w.subscribe((v) => {
        if (v == null) {
          return;
        }
        const patient = get(this.patient);
        if (patient.patientId === Hoken.patientId(v)) {
          this.updateCache(v);
        }
      })
    );
  }

  async fetchAllHoken() {
    if (!this.allHokenLoaded) {
      const patient = get(this.patient);
      const [shahokokuhoList, koukikoureiList, roujinList, kouhiList] =
        await api.listAllHoken(patient.patientId);
      const hs: Hoken[] = await Hoken.batchFromHoken(
        shahokokuhoList, koukikoureiList, roujinList, kouhiList
      );
      this.hokenCache.set(hs);
      this.allHokenLoaded = true;
    }
  }

  addToCache(h: Hoken): void {
    const c = get(this.hokenCache);
    this.hokenCache.set([...c, h]);
  }

  updateCache(v: Shahokokuho | Koukikourei | Roujin | Kouhi): void {
    const c = get(this.hokenCache);
    const key = Hoken.composeKey(v);
    const i = c.findIndex((e) => e.key === key);
    if (i >= 0) {
      const h: Hoken = c[i];
      const cc = [...c];
      cc.splice(i, 1, h.updateValue(v));
      this.hokenCache.set(cc);
    }
  }

  resolveHoken(key: string): Hoken {
    let h = get(this.hokenCache).find((e) => e.key === key);
    if (h !== undefined) {
      return h;
    } else {
      throw new Error("Cannot find hoken: " + key);
    }
  }

  resolveShahokokuho(shahokokuho: Shahokokuho): [Shahokokuho, number] {
    const h = this.resolveHoken(Hoken.composeKey(shahokokuho));
    return [h.value as Shahokokuho, h.usageCount];
  }

  resolveKoukikourei(koukikourei: Koukikourei): [Koukikourei, number] {
    const h = this.resolveHoken(Hoken.composeKey(koukikourei));
    return [h.value as Koukikourei, h.usageCount];
  }

  resolveKouhi(kouhi: Kouhi): [Kouhi, number] {
    const h = this.resolveHoken(Hoken.composeKey(kouhi));
    return [h.value as Kouhi, h.usageCount];
  }

  cleanup(): void {
    console.log("PatientData cleanup");
    this.unsubs.forEach((f) => f());
  }

  closeCurrent(): void {
    if (this.stack.length > 0) {
      const [_, closer] = this.stack[this.stack.length - 1];
      closer();
    }
  }

  pop(): void {
    this.stack.pop();
  }

  push(opener: Opener): void {
    this.stack.push([opener, opener.open()]);
  }

  moveTo(opener: Opener): void {
    this.closeCurrent();
    this.push(opener);
  }

  goto(opener: Opener): void {
    this.closeCurrent();
    this.pop();
    this.push(opener);
  }

  goback(): void {
    this.closeCurrent();
    this.pop();
    const s = this.stack.pop();
    if (s == undefined) {
      this.cleanup();
    } else {
      const [opener, _] = s;
      this.push(opener);
    }
  }

  close(): void {
    this.closeCurrent();
    this.cleanup();
  }

  startInfo(): void {
    this.moveTo(infoOpener(this));
  }

  resolveUsageCount(v: HokenType): number | undefined {
    const key = Hoken.composeKey(v);
    for(let hoken of get(this.hokenCache)){
      if( hoken.key === key ){
        return hoken.usageCount;
      }
    }
    return undefined;
  }
}
