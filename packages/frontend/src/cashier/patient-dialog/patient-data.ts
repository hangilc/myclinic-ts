import type { Patient } from "myclinic-model";
import EditDialog from "./EditDialog.svelte";
import { Hoken } from "./hoken";
import InfoDialog from "./InfoDialog.svelte";
import { kouhiEntered, koukikoureiEntered, patientUpdated, shahokokuhoEntered } from "@/app-events";
import { get, writable, type Writable } from "svelte/store";
import NewShahokokuhoDialog from "./NewShahokokuhoDialog.svelte";
import NewKoukikoureiDialog from "./NewKoukikoureiDialog.svelte";
import NewKouhiDialog from "./NewKouhiDialog.svelte";

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
          currentHokenList: data.currentHokenList,
          destroy: () => d.$destroy(),
          onClose: () => {
            data.onDialogClose();
          },
          ops: {
            moveToEdit: () => data.moveToEdit(),
            moveToNewShahokokuho: () => data.moveToNewShahokokuho(),
            moveToNewKoukikourei: () => data.moveToNewKoukikourei(),
            moveToNewKouhi: () => data.moveToNewKouhi(),
          }
        },
      });
      function destroy(): void {
        d.$destroy();
      }
      return destroy;
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
          destroy: destroy,
          onClose: () => {
            console.log("edit onClose");
            data.onDialogClose();
          },
        },
      });
      function destroy(): void {
        d.$destroy();
      }
      return destroy;
    },
  };
}

function newShahokokuhoOpener(data: PatientData): Opener {
  return {
    open(): Closer {
      const d = new NewShahokokuhoDialog({
        target: document.body,
        props: {
          patient: data.patient,
          destroy
        }
    });
    function destroy(): void {
      d.$destroy();
    }
    return destroy;
    }
  }
}

function newKoukikoureiOpener(data: PatientData): Opener {
  return {
    open(): Closer {
      const d = new NewKoukikoureiDialog({
        target: document.body,
        props: {
          patient: data.patient,
          destroy
        }
    });
    function destroy(): void {
      d.$destroy();
    }
    return destroy;
    }
  }
}

function newKouhiOpener(data: PatientData): Opener {
  return {
    open(): Closer {
      const d = new NewKouhiDialog({
        target: document.body,
        props: {
          patient: data.patient,
          destroy
        }
    });
    function destroy(): void {
      d.$destroy();
    }
    return destroy;
    }
  }
}

export class PatientData {
  patient: Writable<Patient>;
  currentHokenList: Writable<Hoken[]>;
  allHoken: Writable<Hoken[] | undefined>;
  current: [Opener, Closer] | undefined = undefined;
  unsubs: (() => void)[] = [];
  stack: Opener[] = [];

  constructor(
    patient: Patient,
    currentHokenList: Hoken[]
  ) {
    this.patient = writable(patient);
    this.currentHokenList = writable(currentHokenList);
    this.allHoken = writable(undefined);
    this.unsubs.push(patientUpdated.subscribe((patient) => {
      if( patient != null ){
        this.patient.set(patient);
      }
    }));
    this.unsubs.push(shahokokuhoEntered.subscribe(shahokokuho => {
      if( shahokokuho == null ){
        return;
      }
      const patient: Patient = get(this.patient);
      if( patient.patientId === shahokokuho.patientId ){
        const h = new Hoken(shahokokuho);
        if( shahokokuho.isValidAt(new Date()) ){
          const chl = get(this.currentHokenList);
          this.currentHokenList.set([...chl, h]);
        }
        this.addToAllHoken(h);
      }
    }))
    this.unsubs.push(koukikoureiEntered.subscribe(koukikourei => {
      if( koukikourei == null ){
        return;
      }
      const patient: Patient = get(this.patient);
      if( patient.patientId === koukikourei.patientId ){
        const h = new Hoken(koukikourei);
        if( koukikourei.isValidAt(new Date()) ){
          const chl = get(this.currentHokenList);
          this.currentHokenList.set([...chl, h]);
        }
        this.addToAllHoken(h);
      }
    }))
    this.unsubs.push(kouhiEntered.subscribe(kouhi => {
      if( kouhi == null ){
        return;
      }
      const patient: Patient = get(this.patient);
      if( patient.patientId === kouhi.patientId ){
        const h = new Hoken(kouhi);
        if( kouhi.isValidAt(new Date()) ){
          const chl = get(this.currentHokenList);
          this.currentHokenList.set([...chl, h]);
        }
        this.addToAllHoken(h);
      }
    }))
  }

  addToAllHoken(h: Hoken): void {
    const c = get(this.allHoken);
    if( c != undefined ){
      c.push(h);
      this.allHoken.set(c);
    }
  }

  cleanup(): void {
    console.log("PatientData cleanup");
    this.unsubs.forEach((f) => f());
  }

  moveTo(opener: Opener): void {
    const closer = opener.open();
    this.current = [opener, closer];
  }

  onDialogClose(): void {
    if (this.stack.length > 0) {
      this.stack.shift();
      if (this.stack.length > 0) {
        const o = this.stack.shift();
        o?.open();
      } else {
        this.cleanup();
      }
    } else {
      console.log("patient-data stack underflow");
    }
  }

  moveToInfo(): void {
    this.moveTo(infoOpener(this));
  }

  moveToEdit(): void {
    this.moveTo(editOpener(this));
  }

  moveToNewShahokokuho(): void {
    this.moveTo(newShahokokuhoOpener(this));
  }

  moveToNewKoukikourei(): void {
    this.moveTo(newKoukikoureiOpener(this));
  }

  moveToNewKouhi(): void {
    this.moveTo(newKouhiOpener(this));
  }
}
