<script lang="ts">
  import api from "@/lib/api";
  import Dialog from "@/lib/Dialog.svelte";
  import { genid } from "@/lib/genid";
  import type { ShinryouEx, Visit } from "myclinic-model";
  import { Item } from "./copy-selected-types";

  export let destroy: () => void;
  export let targetVisitId: number ;
  export let shinryouList: ShinryouEx[];
  let items: Item[] = [];
  let selected: number[] = [];

  init();

  async function init() {
    const target: Visit = await api.getVisit(targetVisitId);
    const at: Date = target.visitedAtAsDate;
    items = await Promise.all(
      shinryouList.map(async (s) => {
        const r: number =
          (await api.resolveShinryoucode(s.shinryoucode, at)) ?? 0;
        return new Item(r, s.master.name);
      })
    );
  }

  function doSelectAll(): void {
    selected = items.map(i => i.shinryoucode).filter(n => n > 0);
  }

  function doUnselectAll(): void {
    selected = [];
  }

  async function doEnter() {
    if( targetVisitId != undefined ){
      console.log(selected);
      const shinryoucodes: number[] = selected.filter(n => n > 0);
      await api.batchEnterShinryou(targetVisitId, shinryoucodes);
      destroy();
    }
  }
</script>

<Dialog {destroy} title="診療行為選択コピー">
  <div class="top">
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
        <label for={id}>{item.name}</label>
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
