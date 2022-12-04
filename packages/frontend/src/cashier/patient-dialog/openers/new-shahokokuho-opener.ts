import type { PatientData } from "../patient-data";
import type { Opener, Closer } from "./opener";
import ShahokokuhoEditDialog from "../ShahokokuhoEditDialog.svelte";
import type { Shahokokuho } from "myclinic-model";
import api from "@/lib/api";

export function newShahokokuhoOpener(
  data: PatientData,
  template?: Shahokokuho
): Opener {
  return {
    open(): Closer {
      const d = new ShahokokuhoEditDialog({
        target: document.body,
        props: {
          title: "新規社保国保",
          patient: data.patient,
          ops: {
            goback: () => data.goback(),
          },
          shahokokuho: template,
          onEnter: async (s: Shahokokuho) => {
            await api.enterShahokokuho(s);
            data.goback();
          },
        },
      });
      return d.$destroy;
    },
  };
}
