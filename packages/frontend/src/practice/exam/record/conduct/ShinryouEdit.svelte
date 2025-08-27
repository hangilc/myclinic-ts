<script lang="ts">
  import type { ConductShinryouEx } from "myclinic-model";
  import { confirm } from "@/lib/confirm-call"
    import api from "@/lib/api";
  import ShinryouMemoEdit from "./ShinryouMemoEdit.svelte";

  export let conductShinryou: ConductShinryouEx;
  export let onClose: () => void;

  function doDelete(): void {
    confirm("この診療行為を削除していいですか？", async () => {
      await api.deleteConductShinryou(conductShinryou.conductShinryouId);
      onClose();
    });
  }

  async function doMemo() {
    const d: ShinryouMemoEdit = new ShinryouMemoEdit({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        shinryou: conductShinryou,
        onUpdate: (_updated: ConductShinryouEx) => {

        }
      }
    });
  }
</script>

<div class="top">
  <div>{conductShinryou.master.name}</div>
  <div class="commands">
    <a href="javascript:void(0)" on:click={doMemo}>メモ</a>
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
    align-items: center;
  }

  .commands :global(button) {
    margin-left: 4px;
  }
</style>