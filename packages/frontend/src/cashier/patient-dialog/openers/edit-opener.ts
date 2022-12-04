import type { PatientData } from "../patient-data";
import type { Opener, Closer } from "./opener";
import EditDialog from "../EditDialog.svelte";

export function editOpener(data: PatientData): Opener {
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
