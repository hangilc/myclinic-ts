<script lang="ts">
  import Dialog from "@/lib/Dialog.svelte";
  import api from "@/lib/api";
  import type { ConductShinryouEx } from "myclinic-model";

  export let destroy: () => void;
  export let shinryou: ConductShinryouEx;
  export let onUpdate: (updated: ConductShinryouEx) => void;
  let memo: string = shinryou.memo ?? "";

  function doClose(): void {
    destroy();
  }

  async function doEnter() {
    try {
      const json = JSON.parse(memo);
      const newMemo = JSON.stringify(json);
      const newShinryou = Object.assign({}, shinryou, { memo: newMemo });
      const updated = await api.updateConductShinryou(newShinryou);
      const updatedEx = await api.getConductShinryouEx(updated.conductShinryouId);
      doClose();
      onUpdate(updatedEx);
    } catch(ex: any) {
      alert(ex.toString());
    }
  }
</script>

<Dialog title="処置診療行為メモの編集" destroy={doClose}>
  <textarea bind:value={memo}/>
  <div class="commands">
    <button on:click={doEnter}>入力</button>
    <button on:click={doClose}>キャンセル</button>
  </div>
</Dialog>

<style>
  .commands {
    display: flex;
    justify-content: right;
  }
  .commands * + * {
    margin-left: 4px;
  }
</style>
