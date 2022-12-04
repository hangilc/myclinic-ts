import type { PatientData } from "../patient-data";
import type { Opener, Closer } from "./opener";
import KouhiEditDialog from "../KouhiEditDialog.svelte";
import type { Kouhi } from "myclinic-model";
import api from "@/lib/api";

export function newKouhiOpener(data: PatientData, kouhi?: Kouhi): Opener {
  return {
    open(): Closer {
      const d = new KouhiEditDialog({
        target: document.body,
        props: {
          patient: data.patient,
          kouhi,
          title: "新規公費",
          ops: {
            goback: () => data.goback(),
          },
          onEnter: async (k: Kouhi) => {
            await api.enterKouhi(k);
            data.goback();
          }
        },
      });
      return d.$destroy;
    },
  };
}
