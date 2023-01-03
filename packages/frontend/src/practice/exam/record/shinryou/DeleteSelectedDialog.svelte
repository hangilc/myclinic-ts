<script lang="ts">
  import api from "@/lib/api";
  import Dialog from "@/lib/DialogOld.svelte";
  import { genid } from "@/lib/genid";
  import type { ShinryouEx } from "myclinic-model/model";

  let dialog: Dialog;
  let visitId: number | undefined = undefined;
  let shinryouList: ShinryouEx[] = [];
  let selected: number[] = []; // shinryouIds

  export async function open(visitIdArg: number, shinryouListArg: ShinryouEx[]) {
    visitId = visitIdArg;
    shinryouList = shinryouListArg;
    selected = [];
    dialog.open();
  }

  function doSelectAll(): void {
    selected = shinryouList.map(s => s.shinryouId);
  }

  function doUnselectAll(): void {
    selected = [];
  }

  async function doEnter(close: () => void) {
    if( visitId != undefined ){
      await Promise.all(selected.map(shinryouId => api.deleteShinryou(shinryouId)))
      close();
    }
  }

</script>

<Dialog let:close bind:this={dialog}>
  <span slot="title">診療行為選択削除</span>
  <div>
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
    <button on:click={() => doEnter(close)}>入力</button>
    <button on:click={close}>キャンセル</button>
  </div>
</Dialog>
