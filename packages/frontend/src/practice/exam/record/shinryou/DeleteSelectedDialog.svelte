<script lang="ts">
  import api from "@/lib/api";
  import Dialog from "@/lib/Dialog.svelte";
  import { genid } from "@/lib/genid";
  import type { ShinryouEx } from "myclinic-model/model";

  export let destroy: () => void;
  export let visitId: number;
  export let shinryouList: ShinryouEx[];
  let selected: number[] = []; // shinryouIds

  function doSelectAll(): void {
    selected = shinryouList.map(s => s.shinryouId);
  }

  function doUnselectAll(): void {
    selected = [];
  }

  async function doEnter() {
    if( visitId != undefined ){
      await Promise.all(selected.map(shinryouId => api.deleteShinryou(shinryouId)))
      destroy();
    }
  }

</script>

<Dialog {destroy} title="診療行為選択削除">
  <div class="top">
    {#each shinryouList as shinryou}
    {@const id=genid()}
    <div>
      <input type="checkbox" value={shinryou.shinryouId} bind:group={selected} {id}/>
      <label for={id}>{shinryou.master.name}</label>
    </div>
    {/each}
  </div>
  <div class="commands">
    <a href="javascript:void(0)" on:click={doSelectAll}>全選択</a>
    {#if selected.length > 0}
    <a href="javascript:void(0)" on:click={doUnselectAll}>全解除</a>
    {/if}
    <button on:click={doEnter}>入力</button>
    <button on:click={destroy}>キャンセル</button>
  </div>
</Dialog>

<style>
  .top {
    width: 16rem;
  }

    .commands {
    display: flex;
    justify-content: right;
    align-items: center;
    margin-bottom: 4px;
    line-height: 1;
    }
  
    .commands * + * {
    margin-left: 4px;
    }
</style>
