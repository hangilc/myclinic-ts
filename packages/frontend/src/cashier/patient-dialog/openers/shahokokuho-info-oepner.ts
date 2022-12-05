import type { Shahokokuho } from "myclinic-model";
import type { PatientData } from "../patient-data";
import type { Closer, Opener } from "./opener";
import ShahokokuhoInfoDialog from "../ShahokokuhoInfoDialog.svelte";
import { editShahokokuhoOpener } from "./edit-shahokokuho-opener";
import { newShahokokuhoOpener } from "./new-shahokokuho-opener";

export function shahokokuhoInfoOpener(
  data: PatientData,
  shahokokuho: Shahokokuho
): Opener {
  return {
    open(): Closer {
      const [v, usageCount] = data.resolveShahokokuho(shahokokuho);
      const d = new ShahokokuhoInfoDialog({
        target: document.body,
        props: {
          patient: data.patient,
          shahokokuho,
          usageCount,
          ops: {
            goback: () => data.goback(),
            moveToEdit: () => data.moveTo(editShahokokuhoOpener(data, v)),
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
