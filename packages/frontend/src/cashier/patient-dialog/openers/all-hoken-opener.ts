import type { PatientData } from "../patient-data";
import type { Closer, Opener } from "./opener";
import AllHokenDialog from "../AllHokenDialog.svelte";
import type { Kouhi, Koukikourei, Shahokokuho } from "myclinic-model";
import { editShahokokuhoOpener } from "./edit-shahokokuho-opener";
import { editKoukikoureiOpener } from "./edit-koukikourei-opener";
import { editKouhiOpener } from "./edit-kouhi-opener";

export function allHokenOpener(data: PatientData): Opener {
  return {
    open(): Closer {
      const d = new AllHokenDialog({
        target: document.body,
        props: {
          patient: data.patient,
          ops: {
            goback: () => data.goback(),
            moveToShahokokuhoEdit: (h: Shahokokuho) => {
              data.moveTo(editShahokokuhoOpener(data, h))
            },
            moveToKoukikoureiEdit: (h: Koukikourei) => {
              data.moveTo(editKoukikoureiOpener(data, h))
            },
            moveToKouhiEdit: (h: Kouhi) => {
              data.moveTo(editKouhiOpener(data, h))
            },
          },
          allHoken: data.hokenCache,
        }
      });
      data.fetchAllHoken();
      return d.$destroy;
    }
  }
}

