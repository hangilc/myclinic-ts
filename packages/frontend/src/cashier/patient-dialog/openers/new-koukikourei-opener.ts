import type { PatientData } from "../patient-data";
import type { Opener, Closer } from "./opener";
import KoukikoureiEditDialog from "../KoukikoureiEditDialog.svelte";
import type { Koukikourei } from "myclinic-model";
import api from "@/lib/api";

export function newKoukikoureiOpener(
  data: PatientData,
  koukikourei?: Koukikourei
): Opener {
  return {
    open(): Closer {
      const d = new KoukikoureiEditDialog({
        target: document.body,
        props: {
          patient: data.patient,
          ops: {
            goback: () => data.goback(),
          },
          koukikourei,
          onEnter: async (k: Koukikourei) => {
            await api.enterKoukikourei(k);
            data.goback();
          },
        },
      });
      return d.$destroy;
    },
  };
}

