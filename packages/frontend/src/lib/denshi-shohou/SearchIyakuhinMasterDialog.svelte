<script lang="ts">
  import type { IyakuhinMaster } from "myclinic-model";
  import api from "../api";
  import Dialog from "../Dialog.svelte";
  import type { 剤形区分 } from "./denshi-shohou";
  import { onMount } from "svelte";

  export let destroy: () => void;
  export let at: string;
  export let zaikei: 剤形区分;
  export let onEnter: (master: IyakuhinMaster) => void;
  let searchText = "";
  let searchResult: IyakuhinMaster[] = [];
  let searchTextElement: HTMLInputElement;
  let universalNameOnly = true;

  onMount(() => {
    searchTextElement?.focus();
  });

  function isUniversal(master: IyakuhinMaster): boolean {
    return !master.name.includes("「");
  }

  async function doSearch() {
    const t = searchText.trim();
    if (t) {
      let rs = await api.searchIyakuhinMaster(t, at);
      if (zaikei === "内服" || zaikei === "頓服") {
        rs = rs.filter((m) => m.zaikei === "1");
      } else if (zaikei === "外用") {
        rs = rs.filter((m) => m.zaikei === "6");
      }
      searchResult = rs;
    }
  }

  function doSelectMaster(m: IyakuhinMaster) {
    destroy();
    onEnter(m);
  }

</script>

<Dialog title="医薬品マスター検索" {destroy}>
  <form on:submit|preventDefault={doSearch} class="search-form">
    <input type="text" bind:value={searchText} bind:this={searchTextElement} />
    <button type="submit">検索</button>
    <input type="checkbox" bind:checked={universalNameOnly} />一般名のみ
  </form>
  <div style="margin:10px 0;">
    {#each universalNameOnly ? searchResult.filter(isUniversal) : searchResult as master (master.iyakuhincode)}
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div on:click={() => doSelectMaster(master)} style="cursor:pointer">
        {master.name}
      </div>
    {/each}
  </div>
  <div style="margin-top:10px;text-align:right">
    <button on:click={destroy}>キャンセル</button>
  </div>
</Dialog>

