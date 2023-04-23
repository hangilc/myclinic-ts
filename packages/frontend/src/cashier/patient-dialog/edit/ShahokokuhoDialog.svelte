<script lang="ts">
  import api from "@/lib/api";
  import Dialog from "@/lib/Dialog.svelte";
  import type { Patient, Shahokokuho } from "myclinic-model";
  import ShahokokuhoDialogContent from "./ShahokokuhoDialogContent.svelte";
  import { OverlapExists, Used, checkHokenInterval } from "@/lib/hoken-check";

  export let destroy: () => void;
  export let title: string;
  export let init: Shahokokuho | null;
  export let patient: Patient;
  export let onEntered: (entered: Shahokokuho) => void = (_) => {};
  export let onUpdated: (updated: Shahokokuho) => void = (_) => {};

  async function doEnter(shahokokuho: Shahokokuho): Promise<string[]> {
    if (init === null) {
      shahokokuho.shahokokuhoId = 0;
    }
    try {
      if (init === null) {
        const entered = await api.enterShahokokuho(shahokokuho);
        onEntered(entered);
      } else {
        if (shahokokuho.shahokokuhoId <= 0) {
          return ["Invalid shahokokuhoId"];
        } else {
          let errs = await checkHokenInterval(shahokokuho);
          errs = errs.filter((e) => {
            if (e instanceof Used) {
              return true;
            } else {
              return false;
            }
          });
          if (errs.length > 0) {
            return errs.map((e) => {
              if (e instanceof OverlapExists) {
                return "有効期間が重なる保険が存在するようになるので、変更できません。";
              } else if (e instanceof Used) {
                return "使用されている診察があるので、変更できません。";
              } else {
                return "Shahokokuho error";
              }
            });
          }
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
