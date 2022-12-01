import type { Patient } from "myclinic-model";
import EditDialog from "./EditDialog.svelte";
import type { Hoken } from "./hoken";
import InfoDialog from "./InfoDialog.svelte";
import { patientUpdated } from "@/app-events";

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
          patientData: data,
          destroy: () => d.$destroy(),
          onClose: () => {
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
  current: [Opener, Closer] | undefined = undefined;
  unsubs: (() => void)[] = [];

  constructor(
    public patient: Patient,
    public currentHokenList: Hoken[],
    public allHoken: Hoken[] | undefined = undefined,
    public stack: Opener[] = []
  ) {
    this.unsubs.push(patientUpdated.subscribe((patient) => {
      if( patient != null ){
        this.patient = patient;
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
