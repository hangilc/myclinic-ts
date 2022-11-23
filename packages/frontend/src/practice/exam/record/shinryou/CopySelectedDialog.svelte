<script lang="ts">
  import api from "@/lib/api";
  import Dialog from "@/lib/Dialog.svelte";
  import { genid } from "@/lib/genid";
  import type { ShinryouEx, Visit } from "myclinic-model";
  import { Item } from "./copy-selected-types";

  let dialog: Dialog;
  let items: Item[] = [];
  let selected: number[] = [];
  let targetVisitId: number | undefined = undefined;

  function onClose(): void {
    selected = [];
  }

  export async function open(
    targetVisitIdArg: number,
    shinryouList: ShinryouEx[]
  ) {
    targetVisitId = targetVisitIdArg;
    const target: Visit = await api.getVisit(targetVisitId);
    const at: Date = target.visitedAtAsDate;
    items = await Promise.all(
      shinryouList.map(async (s) => {
        const r: number =
          (await api.resolveShinryoucode(s.shinryoucode, at)) ?? 0;
        return new Item(r, s.master.name);
      })
    );
    dialog.open();
  }

  function doSelectAll(): void {
    selected = items.map(i => i.shinryoucode).filter(n => n > 0);
  }

  function doUnselectAll(): void {
    selected = [];
  }

  async function doEnter(close: () => void) {
    if( targetVisitId != undefined ){
      console.log(selected);
      const shinryoucodes: number[] = selected.filter(n => n > 0);
      await api.batchEnterShinryou(targetVisitId, shinryoucodes);
      close();
    }
  }
</script>

<Dialog let:close bind:this={dialog}>
  <span slot="title">診療行為選択コピー</span>
  <div>
    {#each items as item}
      {@const id = genid()}
      <div>
        <input
          type="checkbox"
          {id}
          value={item.shinryoucode}
          bind:group={selected}
          disabled={item.shinryoucode === 0}
        />
        <label>{item.name}</label>
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

<style>
  .commands {
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }

  .commands button:first-of-type {
    margin-left: 8px;
  }

  .commands * + * {
    margin-left: 4px;
  }
</style>
