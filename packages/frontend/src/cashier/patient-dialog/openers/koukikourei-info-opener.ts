import type { Koukikourei } from "myclinic-model";
import type { PatientData } from "../patient-data";
import type { Closer, Opener } from "./opener";
import KoukikoureiInfoDialog from "../KoukikoureiInfoDialog.svelte";
import { editKoukikoureiOpener } from "./edit-koukikourei-opener";
import { newKoukikoureiOpener } from "./new-koukikourei-opener";

export function koukikoureiInfoOpener(
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