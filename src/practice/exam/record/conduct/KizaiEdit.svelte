<script lang="ts">
  import type { ConductKizaiEx } from "@/lib/model";
  import { confirm } from "@/lib/confirm-call"
    import api from "@/lib/api";

  export let conductKizai: ConductKizaiEx;
  export let onClose: () => void;

  function doDelete(): void {
    confirm("この器材を削除していいですか？", async () => {
      await api.deleteConductKizai(conductKizai.conductKizaiId);
      onClose();
    });
  }
</script>

<div class="top">
  <div>{conductKizai.master.name}{conductKizai.amount}{conductKizai.master.unit}</div>
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