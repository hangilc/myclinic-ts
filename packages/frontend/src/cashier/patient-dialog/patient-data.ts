import type { Patient } from "myclinic-model";
import type { ComponentType } from "svelte";
import type { Hoken } from "./hoken";
import InfoDialog from "./InfoDialog.svelte";

interface Opener {
  open(): void
}

function infoOpener(data: PatientData): Opener {
  return {
    open(): void {
      const d = new InfoDialog({
        target: document.body,
        props: {
          patientData: data
        }
      });
      d.$on("close", () => {
        d.$destroy();
        data.onDialogClose();
      })
  
    }
  }
}

export class PatientData {
  current: Opener | undefined = undefined;

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
      this.stack.push(this.current);
    }
    this.current = opener;
    opener.open();
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
}