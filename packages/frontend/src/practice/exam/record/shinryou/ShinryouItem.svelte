<script lang="ts">
  import api from "@/lib/api";
  import type { ShinryouEx } from "@/lib/model";
  import { confirm } from "@/lib/confirm-call"

  export let shinryou: ShinryouEx;
  let mode = "disp";

  async function doDelete() {
    confirm("この診療行為を削除していいですか？", 
      async () => await api.deleteShinryou(shinryou.shinryouId)
    )
  }
</script>

{#if mode === "disp"}
<div on:click={() => mode = "edit"} class="disp">{shinryou.master.name}</div>
{:else if mode === "edit"}
<div class="edit">
  <div>{shinryou.master.name}</div>
  <div class="commands">
    <button on:click={doDelete}>削除</button>
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

