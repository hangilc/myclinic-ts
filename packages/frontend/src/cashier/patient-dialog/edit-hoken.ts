import { Kouhi, Koukikourei, Patient, Shahokokuho } from "myclinic-model";
import type { Hoken } from "./hoken";
import ShahokokuhoDialog from "./edit/ShahokokuhoDialog.svelte";
import KoukikoureiDialog from "./edit/KoukikoureiDialog.svelte";
import KouhiDialog from "./edit/KouhiDialog.svelte";
import type { PatientData } from "./patient-data";

export function editHoken(
  data: PatientData,
  patient: Patient,
  destroy: () => void,
  hoken: Hoken
): void {
  if (hoken.value instanceof Shahokokuho) {
    const shahokokuho = hoken.value;
    function open(): void {
      const d: ShahokokuhoDialog = new ShahokokuhoDialog({
        target: document.body,
        props: {
          init: shahokokuho,
          destroy: () => {
            d.$destroy();
            data.goback();
          },
          title: "社保国保編集",
          patient,
          isAdmin: data.isAdmin,
          onUpdated: (updated: Shahokokuho) => {
            data.hokenCache.updateWithHokenType(updated);
          },
        },
      });
    }
    destroy();
    data.push(open);
  } else if (hoken.value instanceof Koukikourei) {
    const koukikourei = hoken.value;
    function open(): void {
      const d: KoukikoureiDialog = new KoukikoureiDialog({
        target: document.body,
        props: {
          init: koukikourei,
          isAdmin: data.isAdmin,
          destroy: () => {
            d.$destroy();
            data.goback();
          },
          title: "後期高齢編集",
          patient,
          onUpdated: (updated: Koukikourei) => {
            data.hokenCache.updateWithHokenType(updated);
          },
        },
      });
    }
    destroy();
    data.push(open);
  } else if (hoken.value instanceof Kouhi) {
    const kouhi = hoken.value;
    function open(): void {
      const d: KouhiDialog = new KouhiDialog({
        target: document.body,
        props: {
          init: kouhi,
          isAdmin: data.isAdmin,
          destroy: () => {
            d.$destroy();
            data.goback();
          },
          title: "公費編集",
          patient,
          onUpdated: (updated: Kouhi) => {
            data.hokenCache.updateWithHokenType(updated);
          },
        },
      });
    }
    destroy();
    data.push(open);
  }
}
