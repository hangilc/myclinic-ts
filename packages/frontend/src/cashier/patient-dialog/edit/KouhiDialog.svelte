<script lang="ts">
  import api from "@/lib/api";
  import Dialog from "@/lib/Dialog.svelte";
  import { type Patient, Kouhi } from "myclinic-model";
  import KouhiDialogContent from "./KouhiDialogContent.svelte";
  import { countInvalidUsage } from "@/lib/hoken-check";

  export let destroy: () => void;
  export let title: string;
  export let init: Kouhi | null;
  export let patient: Patient;
  export let onEntered: (entered: Kouhi) => void = (_) => {};
  export let onUpdated: (entered: Kouhi) => void = (_) => {};
  export let isAdmin: boolean;
  let prevInvalids = 0;

  checkPrevInvalids();

  async function checkPrevInvalids() {
    if (init) {
      prevInvalids = await countInvalidUsage(init);
    }
  }

  async function doEnter(kouhi: Kouhi): Promise<string[]> {
    if (init === null) {
      kouhi.kouhiId = 0;
    }
    try {
      if (init === null) {
        const entered = await api.enterKouhi(kouhi);
        onEntered(entered);
        return [];
      } else {
        if (kouhi.kouhiId <= 0) {
          return ["Invalid kouhiId"];
        } else {
          if (!isAdmin) {
            const usage = await api.countKouhiUsage(kouhi.kouhiId);
            if (usage > 0) {
              return [
                "この公費はすでに使用されているので、内容を変更できません。",
              ];
            }
          }
          // const invalids = await countInvalidUsage(kouhi);
          // if (invalids > prevInvalids) {
          //   return ["有効期間外の使用が発生するので、変更できません。"];
          // }
          // const usage = await api.countKouhiUsage(init.kouhiId);
          // if (usage > 0 && !Kouhi.isContentEqual(init, kouhi)) {
          //   return [
          //     "この保険はすでに使われているので、内容の変更ができません。",
          //   ];
          // }
          await api.updateKouhi(kouhi);
          onUpdated(kouhi);
          return [];
        }
      }
    } catch (ex: any) {
      return [ex.toString()];
    }
  }
</script>

<Dialog {destroy} {title}>
  <KouhiDialogContent {init} {patient} onClose={destroy} onEnter={doEnter} />
</Dialog>

<style>
</style>
