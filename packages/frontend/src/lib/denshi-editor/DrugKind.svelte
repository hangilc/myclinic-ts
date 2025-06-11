<script lang="ts">
  import type {
    剤形区分,
    情報区分,
    薬品コード種別,
    力価フラグ,
  } from "@/lib/denshi-shohou/denshi-shohou";
  import api from "@/lib/api";
  import type { IyakuhinMaster } from "myclinic-model";
  import XCircle from "@/icons/XCircle.svelte";

  export let 薬品コード種別: 薬品コード種別;
  export let 薬品コード: string;
  export let 薬品名称: string;
  export let 単位名: string;
  export let at: string;
  export let onChange: (data: {
	
  }) => void;

  let isEditing = false;
  let searchText = "";
  let searchResult: IyakuhinMaster[] = [];
  let inputElement: HTMLInputElement;

  if (薬品コード === "") {
    isEditing = true;
  }

  async function doSearch() {
    const t = searchText.trim();
    if (t !== "") {
      const ms = await api.searchIyakuhinMaster(t, at);
      searchResult = ms;
    }
  }

  function doCancel() {
    searchText = "";
    searchResult = [];
  }

  function doMasterSelect(m: IyakuhinMaster) {
    薬品コード = m.iyakuhincode.toString();
    薬品名称 = m.name;
    単位名 = m.unit;
    isEditing = false;
    searchText = "";
    searchResult = [];
  }

  function doEdit() {
	searchText = 薬品名称;
	isEditing = true;
  }
</script>

{#if isEditing}
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <!-- svelte-ignore a11y-invalid-attribute -->
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div>
    <form on:submit|preventDefault={doSearch}>
      <input
        type="text"
        bind:value={searchText}
        bind:this={inputElement}
        class="search-text"
      />
      <a
        href="javascript:void(0)"
        style="position:relative;top:5px;margin-left:3px;"
        on:click={doCancel}
      >
        <XCircle color="#999" width="22" />
      </a>
    </form>
    <div
      style="height:10em;overflow-y:auto;resize:vertical;font-size: 14px;margin-top:6px;border:1px solid gray;"
    >
      {#each searchResult as master (master.iyakuhincode)}
        <div class="master-item" on:click={() => doMasterSelect(master)}>
          {master.name}
        </div>
      {/each}
    </div>
  </div>
{:else}
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div class="rep" on:click={doEdit}>{薬品名称}</div>
{/if}

<style>
  .search-text {
    width: 20em;
  }

  .master-item {
    cursor: pointer;
  }

  .master-item:hover {
    background-color: #eee;
  }

  .rep {
    cursor: pointer;
  }
</style>
