<script lang="ts">
  import type { ConductDrugEx } from "myclinic-model";
  import { confirm } from "@/lib/confirm-call"
    import api from "@/lib/api";

  export let conductDrug: ConductDrugEx;
  export let onClose: () => void;

  function doDelete(): void {
    confirm("この薬剤を削除していいですか？", async () => {
      await api.deleteConductDrug(conductDrug.conductDrugId);
      onClose();
    });
  }
</script>

<div class="top">
  <div>{conductDrug.master.name}{conductDrug.amount}{conductDrug.master.unit}</div>
  <div class="commands">
    <button on:click={doDelete}>削除</button>
    <button on:click={onClose}>キャンセル</button>
  </div>
</div>

<style>
  .top {
    border: 1px solid gray;
    padding: 10px;
  }

  .commands {
    display: flex;
    justify-content: flex-end;
  }

  .commands :global(button) {
    margin-left: 4px;
  }
</style>