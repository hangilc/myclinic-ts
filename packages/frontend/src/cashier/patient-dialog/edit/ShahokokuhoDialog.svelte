<script lang="ts">
  import api from "@/lib/api";
  import Dialog from "@/lib/Dialog.svelte";
  import type { Patient, Shahokokuho } from "myclinic-model";
  import ShahokokuhoDialogContent from "./ShahokokuhoDialogContent.svelte";

  export let destroy: () => void;
  export let title: string;
  export let init: Shahokokuho | null;
  export let patient: Patient;
  export let onEntered: (entered: Shahokokuho) => void = _ => {};
  export let onUpdated: (updated: Shahokokuho) => void = _ => {};

  async function doEnter(shahokokuho: Shahokokuho): Promise<string[]> {
    try {
      if (init === null) {
        shahokokuho.shahokokuhoId = 0;
        const entered = await api.enterShahokokuho(shahokokuho);
        onEntered(entered);
      } else {
        if( shahokokuho.shahokokuhoId <= 0 ){
          return ["Invalid shahokokuhoId"];
        } else {
          await api.updateShahokokuho(shahokokuho);
          onUpdated(shahokokuho);
        }
      }
      return [];
    } catch (ex: any) {
      return [ex.toString()];
    }
  }
</script>

<Dialog {destroy} {title}>
  <ShahokokuhoDialogContent
    {init}
    {patient}
    onClose={destroy}
    onEnter={doEnter}
  />
</Dialog>

<style>
</style>
