import type { PatientData } from "../patient-data";
import type { Closer, Opener } from "./opener";
import AllHokenDialog from "../AllHokenDialog.svelte";

export function allHokenOpener(data: PatientData): Opener {
  return {
    open(): Closer {
      const d = new AllHokenDialog({
        target: document.body,
        props: {
          patient: data.patient,
          ops: {
            goback: () => data.goback(),
          },
          allHoken: data.hokenCache,
        }
      });
      return d.$destroy;
    }
  }
}