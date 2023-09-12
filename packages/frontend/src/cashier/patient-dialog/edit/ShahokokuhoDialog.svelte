<script lang="ts">
  import api from "@/lib/api";
  import Dialog from "@/lib/Dialog.svelte";
  import { Shahokokuho, type Patient } from "myclinic-model";
  import ShahokokuhoDialogContent from "./ShahokokuhoDialogContent.svelte";
  import { countInvalidUsage } from "@/lib/hoken-check";

  export let destroy: () => void;
  export let title: string;
  export let init: Shahokokuho | null;
  export let patient: Patient;
  export let onEntered: (entered: Shahokokuho) => void = (_) => {};
  export let onUpdated: (updated: Shahokokuho) => void = (_) => {};
  let prevInvalids: number = 0;

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
          const usage = await api.countShahokokuhoUsage(init.shahokokuhoId);
          if( usage > 0 && !Shahokokuho.isContentEqual(init, shahokokuho) ){
            return ["この保険はすでに使われているので、内容の変更ができません。"];
          }
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
  <ShahokokuhoDialogContent
    {init}
    {patient}
    onClose={destroy}
    onEnter={doEnter}
  />
</Dialog>

