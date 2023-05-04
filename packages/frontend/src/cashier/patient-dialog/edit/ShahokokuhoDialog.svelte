<script lang="ts">
  import api from "@/lib/api";
  import Dialog from "@/lib/Dialog.svelte";
  import type { Patient, Shahokokuho } from "myclinic-model";
  import ShahokokuhoDialogContent from "./ShahokokuhoDialogContent.svelte";
  import { countInvalidUsage } from "@/lib/hoken-check";

  export let destroy: () => void;
  export let title: string;
  export let init: Shahokokuho | null;
  export let patient: Patient;
  export let onEntered: (entered: Shahokokuho) => void = (_) => {};
  export let onUpdated: (updated: Shahokokuho) => void = (_) => {};
  let prevInvalids: number = 0;
  let error: string = "";

  checkPrevInvalids();

  async function checkPrevInvalids() {
    if( init ){
      prevInvalids = await countInvalidUsage(init);
    }
  }

  async function doEnter(shahokokuho: Shahokokuho): Promise<string[]> {
    if (init === null) {
      shahokokuho.shahokokuhoId = 0;
    }
    try {
      if (init === null) {
        const entered = await api.enterShahokokuho(shahokokuho);
        onEntered(entered);
        return [];
      } else {
        if (shahokokuho.shahokokuhoId <= 0) {
          return ["Invalid shahokokuhoId"];
        } else {
          const invalids = await countInvalidUsage(shahokokuho);
          if( invalids > prevInvalids ){
            return ["有効期間外の使用が発生するので、変更できません。"];
          }
          // let errs = await checkHokenInterval(shahokokuho);
          // errs = errs.filter((e) => {
          //   if (e instanceof Used) {
          //     return true;
          //   } else {
          //     return false;
          //   }
          // });
          // if (errs.length > 0) {
          //   return errs.map((e) => {
          //     if (e instanceof OverlapExists) {
          //       return "有効期間が重なる保険が存在するようになるので、変更できません。";
          //     } else if (e instanceof Used) {
          //       return "使用されている診察があるので、変更できません。";
          //     } else {
          //       return "Shahokokuho error";
          //     }
          //   });
          // }
          await api.updateShahokokuho(shahokokuho);
          onUpdated(shahokokuho);
          return [];
        }
      }
    } catch (ex: any) {
      return [ex.toString()];
    }
  }
</script>

<Dialog {destroy} {title}>
  {#if error}
    <div class="error">{error}</div>
  {/if}
  <ShahokokuhoDialogContent
    {init}
    {patient}
    onClose={destroy}
    onEnter={doEnter}
  />
</Dialog>

<style>
  .error {
    margin: 10px 0;
    color: red;
  }
</style>
