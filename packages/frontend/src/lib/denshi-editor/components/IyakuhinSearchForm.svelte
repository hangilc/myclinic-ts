<script lang="ts">
  import api from "@/lib/api";
  import { DateWrapper } from "myclinic-util";
  import SearchLink from "../icons/SearchLink.svelte";
  import type { IyakuhinMaster } from "myclinic-model";

  export let inputText: string = "";
  export let at: string = DateWrapper.fromDate(new Date()).asSqlDate();
  export let onSelect: (master: IyakuhinMaster, ippanmei: boolean) => void;

  let masters: IyakuhinMaster[] = [];

  async function search(text: string, at: string): Promise<IyakuhinMaster[]> {
    let ms: IyakuhinMaster[];
    if (text.startsWith("【般】")) {
      ms = await api.listIyakuhinMasterByIppanmei(text, at);
    } else {
      ms = await api.searchIyakuhinMaster(text, at);
    }
    ms = ms.filter((m) => m.senteiRyouyouKubun !== 2);
    return ms;
  }

  async function doSearch() {
    const t = inputText.trim();
    if (t !== "") {
      masters = await search(t, at);
    }
  }

  function doDrugNameClick(m: IyakuhinMaster) {
    onSelect(m, false);
  }

  function doIppanmeiClick(m: IyakuhinMaster) {
    onSelect(m, true);
  }
</script>

<div>
  <form on:submit|preventDefault={doSearch}>
    <div class="input-field">
      <input type="text" bind:value={inputText} class="input" />
      <SearchLink onClick={doSearch} />
      <slot name="icon-commands" />
    </div>
  </form>
  {#if masters.length > 0}
    <div class="search-result">
      {#each masters as m (m.iyakuhincode)}
        <div class="rep">
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <span class="drug-name" on:click={() => doDrugNameClick(m)}
            >{m.name}</span
          >
          {#if m.ippanmei !== ""}
            <!-- svelte-ignore a11y-invalid-attribute -->
            <a href="javascript:void(0)" on:click={() => doIppanmeiClick(m)}
              >一般名</a
            >
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .input-field {
    display: flex;
    align-items: center;
    --search-link-margin-left: var(
      --iyakuhin-search-form-search-link-margin-left,
      6px
    );
  }

  .input {
    width: var(--iyakuhin-search-form-input-width, 20em);
  }

  .search-result {
    margin-top: 6px;
    border: 1px solid gray;
    max-height: var(--iyakuhin-search-form-max-height, 6em);
    overflow-y: auto;
  }

  .drug-name {
    cursor: pointer;
  }
</style>
