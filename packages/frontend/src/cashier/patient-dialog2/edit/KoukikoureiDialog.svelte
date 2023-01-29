<script lang="ts">
  import api from "@/lib/api";
  import Dialog from "@/lib/Dialog.svelte";
  import type { Patient, Koukikourei } from "myclinic-model";
  import KoukikoureiDialogContent from "./KoukikoureiDialogContent.svelte";

  export let destroy: () => void;
  export let title: string;
  export let init: Koukikourei | null;
  export let patient: Patient;
  export let onEntered: (entered: Koukikourei) => void = _ => {};
  export let onUpdated: (entered: Koukikourei) => void = _ => {};

  async function doEnter(koukikourei: Koukikourei): Promise<string[]> {
    try {
      if (init === null) {
        koukikourei.koukikoureiId = 0;
        const entered = await api.enterKoukikourei(koukikourei);
        onEntered(entered);
      } else {
        if( koukikourei.koukikoureiId <= 0 ){
          return ["Invalid koukikoureiId"];
        } else {
          await api.updateKoukikourei(koukikourei);
          onUpdated(koukikourei);
        }
      }
      return [];
    } catch (ex: any) {
      return [ex.toString()];
    }
  }
</script>

<Dialog {destroy} {title}>
  <KoukikoureiDialogContent
    {init}
    {patient}
    onClose={destroy}
    onEnter={doEnter}
  />
</Dialog>

<style>
</style>
