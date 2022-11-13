<script lang="ts">
  import type { ConductShinryouEx } from "@/lib/model";
  import { confirm } from "@/lib/confirm-call"
    import api from "@/lib/api";

  export let conductShinryou: ConductShinryouEx;
  export let onClose: () => void;

  function doDelete(): void {
    confirm("この診療行為を削除していいですか？", async () => {
      await api.deleteConductShinryou(conductShinryou.conductShinryouId);
      onClose();
    });
  }
</script>

<div class="top">
  <div>{conductShinryou.master.name}</div>
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