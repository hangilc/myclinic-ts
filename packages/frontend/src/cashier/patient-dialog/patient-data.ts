import type { Kouhi, Koukikourei, Patient, Shahokokuho } from "myclinic-model";
import EditDialog from "./EditDialog.svelte";
import { Hoken } from "./hoken";
import InfoDialog from "./InfoDialog.svelte";
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
import ShahokokuhoEditDialog from "./ShahokokuhoEditDialog.svelte";
import KoukikoureiEditDialog from "./KoukikoureiEditDialog.svelte";
import NewKouhiDialog from "./NewKouhiDialog.svelte";
import ShahokokuhoInfoDialog from "./ShahokokuhoInfoDialog.svelte";
import KoukikoureiInfoDialog from "./KoukikoureiInfoDialog.svelte";
import api from "@/lib/api";

type Closer = () => void;

interface Opener {
  open(): Closer;
}

function infoOpener(data: PatientData): Opener {
  return {
    open(): Closer {
      const d: InfoDialog = new InfoDialog({
        target: document.body,
        props: {
          patient: data.patient,
          hokenCache: data.hokenCache,
          ops: {
            close: () => data.goback(),
            moveToEdit: () => data.moveTo(editOpener(data)),
            moveToNewShahokokuho: () => data.moveTo(newShahokokuhoOpener(data)),
            moveToNewKoukikourei: () => data.moveTo(newKoukikoureiOpener(data)),
            moveToNewKouhi: () => data.moveTo(newKouhiOpener(data)),
            moveToShahokokuhoInfo: (d: Shahokokuho) =>
              data.moveTo(shahokokuhoInfoOpener(data, d)),
            moveToKoukikoureiInfo: (d: Koukikourei) =>
              data.moveTo(koukikoureiInfoOpener(data, d)),
          },
        },
      });
      return d.$destroy;
    },
  };
}

function editOpener(data: PatientData): Opener {
  return {
    open(): Closer {
      const d: EditDialog = new EditDialog({
        target: document.body,
        props: {
          patient: data.patient,
          ops: {
            goback: () => data.goback(),
          },
        },
      });
      return d.$destroy;
    },
  };
}

function newShahokokuhoOpener(
  data: PatientData,
  template?: Shahokokuho
): Opener {
  return {
    open(): Closer {
      const d = new ShahokokuhoEditDialog({
        target: document.body,
        props: {
          patient: data.patient,
          ops: {
            goback: () => data.goback(),
          },
          shahokokuho: template,
          onEnter: async (s: Shahokokuho) => {
            await api.enterShahokokuho(s);
            data.goback();
          },
        },
      });
      return d.$destroy;
    },
  };
}

function newKoukikoureiOpener(
  data: PatientData,
  koukikourei?: Koukikourei
): Opener {
  return {
    open(): Closer {
      const d = new KoukikoureiEditDialog({
        target: document.body,
        props: {
          patient: data.patient,
          ops: {
            goback: () => data.goback(),
          },
          koukikourei,
          onEnter: async (k: Koukikourei) => {
            await api.enterKoukikourei(k);
            data.goback();
          },
        },
      });
      return d.$destroy;
    },
  };
}

function newKouhiOpener(data: PatientData): Opener {
  return {
    open(): Closer {
      const d = new NewKouhiDialog({
        target: document.body,
        props: {
          patient: data.patient,
          ops: {
            goback: () => data.goback(),
          },
        },
      });
      return d.$destroy;
    },
  };
}

function editShahokokuhoOpener(
  data: PatientData,
  shahokokuho: Shahokokuho
): Opener {
  return {
    open(): Closer {
      const d = new ShahokokuhoEditDialog({
        target: document.body,
        props: {
          patient: data.patient,
          ops: {
            goback: () => data.goback(),
          },
          shahokokuho,
          onEnter: async (s: Shahokokuho) => {
            await api.updateShahokokuho(s);
            data.goback();
          },
        },
      });
      return d.$destroy;
    },
  };
}

function editKoukikoureiOpener(
  data: PatientData,
  koukikourei: Koukikourei
): Opener {
  return {
    open(): Closer {
      koukikourei = data.resolveKoukikourei(koukikourei);
      const d = new KoukikoureiEditDialog({
        target: document.body,
        props: {
          patient: data.patient,
          ops: {
            goback: () => data.goback(),
          },
          koukikourei,
          onEnter: async (s: Koukikourei) => {
            await api.updateKoukikourei(s);
            data.goback();
          },
        },
      });
      return d.$destroy;
    },
  };
}

function shahokokuhoInfoOpener(
  data: PatientData,
  shahokokuho: Shahokokuho
): Opener {
  return {
    open(): Closer {
      shahokokuho = data.resolveShahokokuho(shahokokuho);
      const d = new ShahokokuhoInfoDialog({
        target: document.body,
        props: {
          patient: data.patient,
          shahokokuho,
          ops: {
            goback: () => data.goback(),
            moveToEdit: () =>
              data.moveTo(editShahokokuhoOpener(data, shahokokuho)),
            renew: (s: Shahokokuho) => {
              data.goto(newShahokokuhoOpener(data, s));
            },
          },
        },
      });
      return d.$destroy;
    },
  };
}

function koukikoureiInfoOpener(
  data: PatientData,
  koukikourei: Koukikourei
): Opener {
  return {
    open(): Closer {
      koukikourei = data.resolveKoukikourei(koukikourei);
      const d = new KoukikoureiInfoDialog({
        target: document.body,
        props: {
          patient: data.patient,
          koukikourei,
          ops: {
            goback: () => data.goback(),
            moveToEdit: () =>
              data.moveTo(editKoukikoureiOpener(data, koukikourei)),
            renew: (s: Koukikourei) => {
              data.goto(newKoukikoureiOpener(data, s));
            },
          },
        },
      });
      return d.$destroy;
    },
  };
}

export class PatientData {
  patient: Writable<Patient>;
  hokenCache: Writable<Hoken[]>;
  allHoken: boolean = false;
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
    this.unsubs.push(
      shahokokuhoEntered.subscribe((shahokokuho) => {
        if (shahokokuho == null) {
          return;
        }
        const patient: Patient = get(this.patient);
        if (patient.patientId === shahokokuho.patientId) {
          const h = new Hoken(shahokokuho);
          this.addToCache(h);
        }
      })
    );
    this.unsubs.push(
      shahokokuhoUpdated.subscribe((shahokokuho) => {
        if (shahokokuho == null) {
          return;
        }
        const patient: Patient = get(this.patient);
        if (patient.patientId === shahokokuho.patientId) {
          const h = new Hoken(shahokokuho);
          this.updateCache(h);
        }
      })
    );
    this.unsubs.push(
      koukikoureiEntered.subscribe((koukikourei) => {
        if (koukikourei == null) {
          return;
        }
        const patient: Patient = get(this.patient);
        if (patient.patientId === koukikourei.patientId) {
          const h = new Hoken(koukikourei);
          this.addToCache(h);
        }
      })
    );
    this.unsubs.push(
      koukikoureiUpdated.subscribe((koukikourei) => {
        if (koukikourei == null) {
          return;
        }
        const patient: Patient = get(this.patient);
        if (patient.patientId === koukikourei.patientId) {
          const h = new Hoken(koukikourei);
          this.updateCache(h);
        }
      })
    );
    this.unsubs.push(
      kouhiEntered.subscribe((kouhi) => {
        if (kouhi == null) {
          return;
        }
        const patient: Patient = get(this.patient);
        if (patient.patientId === kouhi.patientId) {
          const h = new Hoken(kouhi);
          this.addToCache(h);
        }
      })
    );
    this.unsubs.push(
      kouhiUpdated.subscribe((kouhi) => {
        if (kouhi == null) {
          return;
        }
        const patient: Patient = get(this.patient);
        if (patient.patientId === kouhi.patientId) {
          const h = new Hoken(kouhi);
          this.updateCache(h);
        }
      })
    );
  }

  addToCache(h: Hoken): void {
    const c = get(this.hokenCache);
    this.hokenCache.set([...c, h]);
  }

  updateCache(h: Hoken): void {
    const c = get(this.hokenCache);
    const key = h.key;
    const i = c.findIndex(e => e.key === key);
    if( i >= 0 ){
      const cc = [...c];
      cc.splice(i, 1, h);
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

  resolveShahokokuho(shahokokuho: Shahokokuho): Shahokokuho {
    const h = new Hoken(shahokokuho);
    return this.resolveHoken(h.key).value as Shahokokuho;
  }

  resolveKoukikourei(koukikourei: Koukikourei): Koukikourei {
    const h = new Hoken(koukikourei);
    return this.resolveHoken(h.key).value as Koukikourei;
  }

  resolveKouhi(kouhi: Kouhi): Kouhi {
    const h = new Hoken(kouhi);
    return this.resolveHoken(h.key).value as Kouhi;
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
}
