<script lang="ts">
  import type { IyakuhinMaster } from "myclinic-model";
  import api from "../api";
  import Dialog from "../Dialog.svelte";
  import { onMount } from "svelte";
  import type { 剤形区分 } from "./denshi-shohou";

  export let destroy: () => void;
  export let at: string;
  export let zaikei: 剤形区分;
  export let onEnter: (master: IyakuhinMaster, amount: string) => void;
  let searchText: string = "";
  let searchResult: IyakuhinMaster[] = [];
  let universalNameOnly = true;
  let searchTextElement: HTMLInputElement;
  let master: IyakuhinMaster | undefined = undefined;
  let amountInput: string = "";

  onMount(() => {
    searchTextElement?.focus();
  });

  async function doSearch() {
    const t = searchText.trim();
    if (t) {
      let rs = await api.searchIyakuhinMaster(t, at);
      if( zaikei === "内服" || zaikei === "頓服" ){
        rs = rs.filter(m => m.zaikei === "1");
      } else if( zaikei === "外用" ){
        rs = rs.filter(m => m.zaikei === "6")
      }
      searchResult = rs;
    }
  }

  function isUniversal(master: IyakuhinMaster): boolean {
    return !master.name.includes("「");
  }

  function doSelectMaster(m: IyakuhinMaster) {
    master = m;
    searchText = "";
  }

  function doEnter() {
    if( !master ){
      alert("薬品名が設定されていません。");
      return;
    }
    if( !/^\d+$|^\d+\.\d+$/.test(amountInput) ){
      alert("分量の入力が不適切です。");
      return;
    }
    destroy();
    onEnter(master, amountInput);
  }
</script>

<Dialog title="新規薬剤" {destroy}>
  <div class="data-grid">
    <div class="key">薬品名：</div>
    <div>{ master ? master.name : "（未設定）"}</div>
    <div class="key">分量：</div>
    <div><input type="text" bind:value={amountInput} style="width:4em"/> { master ? master.unit : ""}</div>
  </div>
  <form on:submit|preventDefault={doSearch} class="search-form">
    <input type="text" bind:value={searchText} bind:this={searchTextElement}/>
    <button type="submit">検索</button>
    <input type="checkbox" bind:checked={universalNameOnly} />一般名のみ
  </form>
  <div>
    {#each universalNameOnly ? searchResult.filter(isUniversal) : searchResult as master (master.iyakuhincode)}
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div on:click={() => doSelectMaster(master)} style="cursor:pointer">{master.name}</div>
    {/each}
  </div>
  <div class="commands">
    <button on:click={doEnter} disabled={!(master && amountInput)}>入力</button>
    <button on:click={destroy}>キャンセル</button>
  </div>
</Dialog>

<style>
  .data-grid {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 6px;
  }

  .search-form {
    margin: 10px 0;
  }

  .key {
    text-align: right;
  }

  .commands {
    margin-top: 10px;
    text-align: right;
  }
</style>
