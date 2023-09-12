<script lang="ts">
  import api from "@/lib/api";
  import Dialog from "@/lib/Dialog.svelte";
  import { type Patient, Koukikourei } from "myclinic-model";
  import KoukikoureiDialogContent from "./KoukikoureiDialogContent.svelte";
  import {
    OverlapExists,
    Used,
    checkHokenInterval,
    countInvalidUsage,
  } from "@/lib/hoken-check";

  export let destroy: () => void;
  export let title: string;
  export let init: Koukikourei | null;
  export let patient: Patient;
  export let onEntered: (entered: Koukikourei) => void = (_) => {};
  export let onUpdated: (entered: Koukikourei) => void = (_) => {};
  let prevInvalids = 0;

  checkPrevInvalids();

  async function checkPrevInvalids() {
    if (init) {
      prevInvalids = await countInvalidUsage(init);
    }
  }

  async function doEnter(koukikourei: Koukikourei): Promise<string[]> {
    if (init === null) {
      koukikourei.koukikoureiId = 0;
    }
    try {
      if (init === null) {
        const entered = await api.enterKoukikourei(koukikourei);
        onEntered(entered);
      } else {
        if (koukikourei.koukikoureiId <= 0) {
          return ["Invalid koukikoureiId"];
        } else {
          const invalids = await countInvalidUsage(koukikourei);
          if( invalids > prevInvalids ){
            return ["有効期間外の使用が発生するので、変更できません。"];
          }
          const usage = await api.countKoukikoureiUsage(init.koukikoureiId);
          if( usage > 0 && !Koukikourei.isContentEqual(init, koukikourei) ){
            return ["この保険はすでに使われているので、内容の変更ができません。"];
          }
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
