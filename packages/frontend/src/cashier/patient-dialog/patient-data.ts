import type { Patient } from "myclinic-model";
import EditDialog from "./EditDialog.svelte";
import type { Hoken } from "./hoken";
import InfoDialog from "./InfoDialog.svelte";
import { patientUpdated } from "@/app-events";
import { writable, type Writable } from "svelte/store";

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
            moveToEdit: () => data.moveToEdit()
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
}
