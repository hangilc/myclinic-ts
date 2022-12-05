import type { PatientData } from "../patient-data";
import type { Opener, Closer } from "./opener";
import KoukikoureiEditDialog from "../KoukikoureiEditDialog.svelte";
import type { Koukikourei } from "myclinic-model";
import api from "@/lib/api";

export function editKoukikoureiOpener(
  data: PatientData,
  koukikourei: Koukikourei
): Opener {
  return {
    open(): Closer {
      const [resolved, usageCount] = data.resolveKoukikourei(koukikourei);
      const d = new KoukikoureiEditDialog({
        target: document.body,
        props: {
          patient: data.patient,
          title: "後期高齢編集",
          ops: {
            goback: () => data.goback(),
          },
          koukikourei: resolved,
          usageCount,
          onEnter: async (s: Koukikourei) => {
            await api.updateKoukikourei(s);
            data.goback();
          },
        },
      });
      return d.$destroy;
    },
  };
}