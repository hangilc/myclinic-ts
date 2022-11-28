import type { Patient } from "myclinic-model";
import type { ComponentType } from "svelte";
import EditDialog from "./EditDialog.svelte";
import type { Hoken } from "./hoken";
import InfoDialog from "./InfoDialog.svelte";

type Closer = () => void;

interface Opener {
  open(): Closer
}

function infoOpener(data: PatientData): Opener {
  return {
    open(): Closer {
      const d = new InfoDialog({
        target: document.body,
        props: {
          patientData: data
        }
      });
      d.$on("close", () => {
        d.$destroy();
        data.onDialogClose();
      });
      return () => d.$destroy();
    }
  }
}

function editOpener(data: PatientData): Opener {
  return {
    open(): Closer {
      const d = new EditDialog({
        target: document.body,
        props: {
          patient: data.patient
        }
      });
      d.$on("close", () => {
        d.$destroy();
        data.onDialogClose();
      });
      return () => d.$destroy();
    }
  }
}

export class PatientData {
  current: [Opener, Closer] | undefined = undefined;

  constructor(
    public patient: Patient,
    public currentHokenList: Hoken[],
    public allHoken: Hoken[] | undefined = undefined,
    public stack: Opener[] = []
  ) {}

  cleanup(): void {
    console.log("PatientData cleanup");
  }

  moveTo(opener: Opener): void {
    if( this.current != undefined ){
      const [opener, closer] = this.current;
      closer();
      console.log("CLOSER");
      this.stack.push(opener);
    }
    const closer = opener.open();
    this.current = [opener, closer];
  }

  goBack(): void {
    const opener: Opener | undefined = this.stack.shift();
    if( opener == undefined ){
      this.cleanup();
    } else {
      opener.open();
    }
  }

  onDialogClose(): void {
    if( this.stack.length > 0 ){
      const o = this.stack.shift();
      o?.open();
    } else {
      this.cleanup();
    }
  }

  moveToInfo(): void {
    this.moveTo(infoOpener(this));
  }

  moveToEdit(): void {
    this.moveTo(editOpener(this));
  }
}