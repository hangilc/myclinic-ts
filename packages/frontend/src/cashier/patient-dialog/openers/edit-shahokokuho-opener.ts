import type { PatientData } from "../patient-data";
import type { Opener, Closer } from "./opener";
import ShahokokuhoEditDialog from "../ShahokokuhoEditDialog.svelte";
import type { Shahokokuho } from "myclinic-model";
import api from "@/lib/api";

export function editShahokokuhoOpener(
  data: PatientData,
  shahokokuho: Shahokokuho
): Opener {
  return {
    open(): Closer {
      const d = new ShahokokuhoEditDialog({
        target: document.body,
        props: {
          title: "社保国保編集",
          patient: data.patient,
          ops: {
            goback: () => data.goback(),
          },
          shahokokuho,
          onEnter: async (s: Shahokokuho) => {
            await api.updateShahokokuho(s);
            data.goback();
          },
        },
      });
      return d.$destroy;
    },
  };
}
