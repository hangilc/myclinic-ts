<script lang="ts">
  import api from "@/lib/api";
  import type { ShinryouMaster, VisitEx } from "@/lib/model";
  import SelectItem from "@/lib/SelectItem.svelte";
  import { writable, type Writable } from "svelte/store";

  export let conductId: number;
  export let visit: VisitEx;
  let show = false;
  let searchTextInput: HTMLInputElement;
  let searchResult: ShinryouMaster[] = [];
  let selected: Writable<ShinryouMaster | null> = writable(null);
  export function open(): void {
    init();
    show = true;
  }

  export function init(): void {
    if( searchTextInput ){
      searchTextInput.value = "";
    }
    selected.set(null);
    searchResult = [];
  }

  async function doSearch() {
    const t = searchTextInput.value.trim();
    if( t !== "" ){
      searchResult = await api.searchShinryouMaster(t, visit.visitedAt);
    }
  }

  async function doEnter() {
    const master = $selected;
    if( master != null ){
      const cs = {
        conductShinryouId: 0,
        conductId: conductId,
        shinryoucode: master.shinryoucode
      };
      await api.enterConductShinryou(cs);
    }
  }

  function doClose(): void {
    show = false;
  }
</script>

{#if show}
<div class="top">
  <div class="title">診療行為追加</div>
  <form on:submit|preventDefault={doSearch}>
    <input type="text" bind:this={searchTextInput} /> 
    <button type="submit">検索</button>
  </form>
  <div class="select">
    {#each searchResult as master (master.shinryoucode)}
    <SelectItem selected={selected} data={master}>{master.name}</SelectItem>
    {/each}
  </div>
  <div class="commands">
    <button on:click={doEnter} disabled={$selected == null}>入力</button>
    <button on:click={doClose}>閉じる</button>
  </div>
</div>
{/if}

<style>
  .top {
    margin: 10px 0;
    border: 1px solid gray;
    padding: 10px;
  }

  .title {
    font-weight: bold;
    margin-bottom: 10px;
  }

  .select {
    height: 6em;
    margin-top: 4px;
  }

  .commands {
    display: flex;
    justify-content: flex-end;
    margin-top: 10px;
  }

  .commands :global(a),
  .commands :global(button) {
    margin-left: 4px;
  }
</style>