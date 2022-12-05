import type { PatientData } from "../patient-data";
import type { Opener, Closer } from "./opener";
import KouhiEditDialog from "../KouhiEditDialog.svelte";
import type { Kouhi } from "myclinic-model";
import api from "@/lib/api";

export function editKouhiOpener(
  data: PatientData,
  kouhi: Kouhi
): Opener {
  return {
    open(): Closer {
      const [resolved, usageCount] = data.resolveKouhi(kouhi);
      const d = new KouhiEditDialog({
        target: document.body,
        props: {
          patient: data.patient,
          title: "公費編集",
          ops: {
            goback: () => data.goback(),
          },
          kouhi: resolved,
          usageCount,
          onEnter: async (s: Kouhi) => {
            await api.updateKouhi(s);
            data.goback();
          },
        },
      });
      return d.$destroy;
    },
  };
}