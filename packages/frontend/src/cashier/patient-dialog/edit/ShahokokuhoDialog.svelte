<script lang="ts">
  import api from "@/lib/api";
  import Dialog from "@/lib/Dialog.svelte";
  import { Shahokokuho, type Patient } from "myclinic-model";
  import ShahokokuhoDialogContent from "./ShahokokuhoDialogContent.svelte";
  import { countInvalidUsage } from "@/lib/hoken-check";
  import { tryUpdateShahokokuho } from "@/lib/hoken-lib";

  export let destroy: () => void;
  export let title: string;
  export let init: Shahokokuho | null;
  export let patient: Patient;
  export let onEntered: (entered: Shahokokuho) => void = (_) => {};
  export let onUpdated: (updated: Shahokokuho) => void = (_) => {};
  let prevInvalids: number = 0;

  checkPrevInvalids();

  async function checkPrevInvalids() {
    if (init) {
      prevInvalids = await countInvalidUsage(init);
    }
  }

  async function doEnter(shahokokuho: Shahokokuho): Promise<string[]> {
    try {
      if (init === null) {
        shahokokuho.shahokokuhoId = 0;
        const entered = await api.enterShahokokuho(shahokokuho);
        onEntered(entered);
        return [];
      } else {
        if (shahokokuho.shahokokuhoId <= 0) {
          return ["Invalid shahokokuhoId"];
        }
        const usage = await api.countShahokokuhoUsage(shahokokuho.shahokokuhoId);
        if( usage === 0 ){
          await api.updateShahokokuho(shahokokuho);
          onUpdated(shahokokuho);
          return [];
        } else {
          return ["使用されている保険は内容を変更できません。"];
        }
        // const result = await tryUpdateShahokokuho(shahokokuho);
        // switch(result) {
        //   case "not-allowed": return ["変更が許可されませんでした。"];
        //   case "invalid-valid-upto": return ["有効期間外の使用が発生するので、変更できません。"];
        //   case "success": break;
        //   default: return ["ERROR"];
        // }
      }
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
