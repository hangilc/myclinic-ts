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
  export let isAdmin: boolean;
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
        if (!isAdmin) {
          const usage = await api.countShahokokuhoUsage(
            shahokokuho.shahokokuhoId
          );
          if (usage > 0) {
            return [
              "この保険証はすでに使用されているので、内容を変更できません。",
            ];
          }
        }
        await api.updateShahokokuho(shahokokuho);
        onUpdated(shahokokuho);
        return [];
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
