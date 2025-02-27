<script lang="ts">
  import api from "@/lib/api";
  import Dialog from "@/lib/Dialog.svelte";
  import type { ShinryouMaster, VisitEx } from "myclinic-model";
  import SelectItem from "@/lib/SelectItem.svelte";
  import { setFocus } from "@/lib/set-focus";
  import { enter } from "./helper";

  export let destroy: () => void;
  export let visit: VisitEx;
  let searchTextInput: HTMLInputElement;
  let result: ShinryouMaster[] = [];
  // let selected: Writable<ShinryouMaster | null> = writable(null);
  let selected: ShinryouMaster | undefined = undefined;

  async function doSearch() {
    const text = searchTextInput.value.trim();
    if (text !== "") {
      result = await api.searchShinryouMaster(text, visit.visitedAt);
    }
  }

  function doSelect(m: ShinryouMaster) {
    selected = m;
  }

  async function doEnter() {
    if (selected) {
      await enter(visit, [selected.shinryoucode], []);
      destroy();
    }
  }
</script>

<Dialog {destroy} title="診療行為検索入力">
  <div style=margin-bottom:6px;width:270px;>{selected ? selected.name : "（未選択）"}</div>
  <div class="top">
    <form on:submit|preventDefault={doSearch}>
      <input type="text" bind:this={searchTextInput} use:setFocus />
      <button type="submit">検索</button>
    </form>
  </div>
  <div class="select">
    {#each result as m (m.shinryoucode)}
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div class="item" on:click={() => doSelect(m)}>{m.name}</div>
    {/each}
  </div>
  <div class="commands">
    <button on:click={doEnter} disabled={!selected}>入力</button>
    <button on:click={destroy}>閉じる</button>
  </div>
</Dialog>

<style>
  .top {
    max-width: 16rem;
  }

  .select {
    width: 16rem;
    height: 200px;
    margin-top: 10px;
    resize: vertical;
  }

  .item {
    cursor: pointer;
    user-select: none;
  }

  .item:hover {
    background-color: #ddd;
  }

  .item:nth-child(even):hover {
    background-color: #afa;
  }

  .item:nth-child(even) {
    background-color: #dfd;
  }

  .commands {
    display: flex;
    justify-content: right;
    align-items: center;
    margin-top: 10px;
    margin-bottom: 4px;
    line-height: 1;
  }

  .commands * + * {
    margin-left: 4px;
  }
</style>
