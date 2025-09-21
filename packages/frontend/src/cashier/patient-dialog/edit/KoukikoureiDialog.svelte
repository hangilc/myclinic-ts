<script lang="ts">
  import api from "@/lib/api";
  import Dialog from "@/lib/Dialog.svelte";
  import { type Patient, Koukikourei } from "myclinic-model";
  import KoukikoureiDialogContent from "./KoukikoureiDialogContent.svelte";
  
  export let destroy: () => void;
  export let title: string;
  export let init: Koukikourei | null;
  export let patient: Patient;
  export let onEntered: (entered: Koukikourei) => void = (_) => {};
  export let onUpdated: (entered: Koukikourei) => void = (_) => {};
  export let isAdmin: boolean;

  async function doEnter(koukikourei: Koukikourei): Promise<string[]> {
    if (init === null) {
      koukikourei.koukikoureiId = 0;
    }
    try {
      if (init === null) {
        const entered = await api.enterKoukikourei(koukikourei);
        onEntered(entered);
        return [];
      } else {
        if (koukikourei.koukikoureiId <= 0) {
          return ["Invalid koukikoureiId"];
        }
        if (!isAdmin) {
          const usage = await api.countKoukikoureiUsage(init.koukikoureiId);
          if (usage > 0) {
            return [
              "この保険証はすでに使用されているので、内容を変更できません。",
            ];
          }
        }
        await api.updateKoukikourei(koukikourei);
        onUpdated(koukikourei);
        return [];
      }
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
