import type { Kouhi } from "myclinic-model";
import type { PatientData } from "../patient-data";
import type { Closer, Opener } from "./opener";
import KouhiInfoDialog from "../KouhiInfoDialog.svelte";
import { editKouhiOpener } from "./edit-kouhi-opener";
import { newKouhiOpener } from "./new-kouhi-opener";

export function kouhiInfoOpener(
  data: PatientData,
  kouhi: Kouhi
): Opener {
  return {
    open(): Closer {
      kouhi = data.resolveKouhi(kouhi);
      const d = new KouhiInfoDialog({
        target: document.body,
        props: {
          patient: data.patient,
          kouhi,
          ops: {
            goback: () => data.goback(),
            moveToEdit: () =>
              data.moveTo(editKouhiOpener(data, kouhi)),
            renew: (k: Kouhi) => {
              data.goto(newKouhiOpener(data, k));
            },
          },
        },
      });
      return d.$destroy;
    },
  };
}