<script lang="ts">
  import api from "@/lib/api";
  import Dialog from "@/lib/Dialog.svelte";
  import type { Patient, Kouhi } from "myclinic-model";
  import KouhiDialogContent from "./KouhiDialogContent.svelte";

  export let destroy: () => void;
  export let title: string;
  export let init: Kouhi | null;
  export let patient: Patient;
  export let onEntered: (entered: Kouhi) => void = _ => {};
  export let onUpdated: (entered: Kouhi) => void = _ => {};

  async function doEnter(kouhi: Kouhi): Promise<string[]> {
    try {
      if (init === null) {
        kouhi.kouhiId = 0;
        const entered = await api.enterKouhi(kouhi);
        onEntered(entered);
      } else {
        if( kouhi.kouhiId <= 0 ){
          return ["Invalid kouhiId"];
        } else {
          await api.updateKouhi(kouhi);
          onUpdated(kouhi);
        }
      }
      return [];
    } catch (ex: any) {
      return [ex.toString()];
    }
  }
</script>

<Dialog {destroy} {title}>
  <KouhiDialogContent
    {init}
    {patient}
    onClose={destroy}
    onEnter={doEnter}
  />
</Dialog>

<style>
</style>
