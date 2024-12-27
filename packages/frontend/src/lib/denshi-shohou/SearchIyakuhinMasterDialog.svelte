<script lang="ts">
  import type { IyakuhinMaster } from "myclinic-model";
  import api from "../api";
  import Dialog from "../Dialog.svelte";
  import { onMount } from "svelte";

  export let destroy: () => void;
  export let at: string;
  export let onEnter: (master: IyakuhinMaster) => void;
  export let masterZaikei: "内服" | "外用" | "すべて" = "内服"
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
      if (masterZaikei === "内服" ) {
        rs = rs.filter((m) => m.zaikei === "1");
      } else if (masterZaikei === "外用") {
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
  <div>
    <input type="radio" value="内服" bind:group={masterZaikei} />内服
    <input type="radio" value="外用" bind:group={masterZaikei} />外用
    <input type="radio" value="その他" bind:group={masterZaikei} />その他

  </div>
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

