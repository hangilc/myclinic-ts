import type { PatientData } from "../patient-data";
import type { Opener, Closer } from "./opener";
import InfoDialog from "../InfoDialog.svelte";
import { editOpener } from "./edit-opener";
import { newShahokokuhoOpener } from "./new-shahokokuho-opener";
import { newKoukikoureiOpener } from "./new-koukikourei-opener";
import { newKouhiOpener } from "./new-kouhi-opener";
import type { Kouhi, Koukikourei, Shahokokuho } from "myclinic-model";
import { shahokokuhoInfoOpener } from "./shahokokuho-info-oepner";
import { koukikoureiInfoOpener } from "./koukikourei-info-opener";
import { kouhiInfoOpener } from "./kouhi-info-opener";
import { allHokenOpener } from "./all-hoken-opener";

export function infoOpener(data: PatientData): Opener {
  return {
    open(): Closer {
      const d: InfoDialog = new InfoDialog({
        target: document.body,
        props: {
          patient: data.patient,
          hokenCache: data.hokenCache,
          ops: {
            close: () => data.goback(),
            moveToEdit: () => data.moveTo(editOpener(data)),
            moveToNewShahokokuho: () => data.moveTo(newShahokokuhoOpener(data)),
            moveToNewKoukikourei: () => data.moveTo(newKoukikoureiOpener(data)),
            moveToNewKouhi: () => data.moveTo(newKouhiOpener(data)),
            moveToShahokokuhoInfo: (d: Shahokokuho) =>
              data.moveTo(shahokokuhoInfoOpener(data, d)),
            moveToKoukikoureiInfo: (d: Koukikourei) =>
              data.moveTo(koukikoureiInfoOpener(data, d)),
            moveToKouhiInfo: (d: Kouhi) =>
              data.moveTo(kouhiInfoOpener(data, d)),
            moveToAllHoken: () => data.moveTo(allHokenOpener(data)),
          },
        },
      });
      return d.$destroy;
    },
  };
}
