<script lang="ts">
  import api from "@/lib/api";
  import type { ShinryouEx } from "myclinic-model";
  import { confirm } from "@/lib/confirm-call"
  import ShinryouMemoDialog from "./ShinryouMemoDialog.svelte";

  export let shinryou: ShinryouEx;
  let mode = "disp";

  async function doDelete() {
    confirm("この診療行為を削除していいですか？", 
      async () => await api.deleteShinryou(shinryou.shinryouId)
    )
  }

  async function updateMemo(memo: string | undefined) {
    await api.updateShinryou(Object.assign(shinryou.asShinryou(), { memo, }))
  }

  function doMemo(): void {
    const d: ShinryouMemoDialog = new ShinryouMemoDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        memo: shinryou.memo,
        onEnter: (newMemo: string | undefined) => {
          updateMemo(newMemo);
        }
      }
    })
  }
</script>

{#if mode === "disp"}
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div on:click={() => mode = "edit"} class="disp">{shinryou.master.name}</div>
{:else if mode === "edit"}
<div class="edit">
  <div>{shinryou.master.name}</div>
  <div class="commands">
    <button on:click={doDelete}>削除</button>
    <a href="javascript:void(0)" on:click={doMemo}>メモ</a>
    <button on:click={() => mode = "disp"}>キャンセル</button>
  </div>
</div>
{/if}

<style>
  .disp {
    cursor: pointer;
  }

  .edit {
    border: 1px solid gray;
    padding: 10px;
  }

  .commands {
    margin-top: 6px;
  }
</style>

