<script lang="ts">
  import api from "@/lib/api";
  import type { IyakuhinMaster, VisitEx } from "myclinic-model";
  import SelectItem from "@/lib/SelectItem.svelte";
  import { showError } from "@/lib/show-error";
  import { writable, type Writable } from "svelte/store";

  export let conductId: number;
  export let visit: VisitEx;
  let show = false;
  let searchTextInput: HTMLInputElement;
  let searchResult: IyakuhinMaster[] = [];
  let selected: Writable<IyakuhinMaster | null> = writable(null);
  let amountInput: HTMLInputElement;

  export function open(): void {
    init();
    show = true;
  }

  function init(): void {
    if( searchTextInput ){
      searchTextInput.value = "";
    }
    selected.set(null);
    searchResult = [];
    if( amountInput ){
      amountInput.value = "1";
    }
  }

  async function doSearch() {
    const t = searchTextInput.value.trim();
    if( t !== "" ){
      searchResult = await api.searchIyakuhinMaster(t, visit.visitedAt);
    }
  }

  async function doEnter() {
    const master = $selected;
    if( master != null ){
      let amount: number;
      try {
        amount = parseFloat(amountInput.value.trim());
      } catch (ex) {
        showError("用量の入力が数字でありません。");
        return;
      }
      const cd = {
        conductDrugId: 0,
        conductId: conductId,
        iyakuhincode: master.iyakuhincode,
        amount
      };
      await api.enterConductDrug(cd);
    }
  }

  function doClose(): void {
    show = false;
  }
</script>

{#if show}
<div class="top">
  <div class="title">薬剤追加</div>
  <form on:submit|preventDefault={doSearch}>
    <input type="text" bind:this={searchTextInput} /> 
    <button type="submit">検索</button>
  </form>
  <div class="select">
    {#each searchResult as master (master.iyakuhincode)}
    <SelectItem selected={selected} data={master}>{master.name}</SelectItem>
    {/each}
  </div>
  <div>
    用量：<input type="text" bind:this={amountInput} value="1"/> {$selected?.unit || ""}
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