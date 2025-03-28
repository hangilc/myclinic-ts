<script lang="ts">
  import api from "@/lib/api";
  import { genid } from "@/lib/genid";
  import SelectItem from "@/lib/SelectItem.svelte";
  import {
    ByoumeiMaster,
    DiseaseExample,
    ShuushokugoMaster,
  } from "myclinic-model";
  import { writable, type Writable } from "svelte/store";
  import type { SearchResult } from "./search-result";
  import { cache } from "@/lib/cache";

  export let startDate: Date | undefined;
  export let onSelect: (
    result: ByoumeiMaster | ShuushokugoMaster | DiseaseExample
  ) => void;
  let searchText: string = "";
  let searchKind: string = "byoumei";
  const byoumeiId: string = genid();
  const shuushokugoId: string = genid();
  let searchResult: SearchResult[] = [];
  let searchSelect: Writable<
    ByoumeiMaster | ShuushokugoMaster | DiseaseExample | null
  > = writable(null);
  let examples: DiseaseExample[];

  init();

  async function init() {
    await loadExamples();
    doExample();
  }

  async function loadExamples() {
    examples = await cache.getDiseaseExamples();
  }

  searchSelect.subscribe((r) => {
    if (r != null) {
      onSelect(r);
    }
  });

  async function doSearch() {
    const t = searchText.trim();
    if (t !== "" && startDate) {
      if (searchKind === "byoumei") {
        searchResult = (await api.searchByoumeiMaster(t, startDate)).map(
          (m) => ({
            label: m.name,
            data: m,
          })
        );
      } else if (searchKind === "shuushokugo") {
        searchResult = (await api.searchShuushokugoMaster(t, startDate)).map(
          (m) => ({
            label: m.name,
            data: m,
          })
        );
      }
    }
  }

  function doExample() {
    searchResult = examples.map((e) => {
      return {
        label: e.repr,
        data: e,
      };
    });
  }

  function resultKind(result: SearchResult): string {
    const data = result.data;
    if( data instanceof ByoumeiMaster ){
      return "byoumei";
    } else if( data instanceof ShuushokugoMaster ){
      return "shuushokugo";
    } else if( data instanceof DiseaseExample ){
      return "example";
    } else {
      return "unknown";
    }
  }
</script>

<div class="command-box">
  <form class="search-form" on:submit|preventDefault={doSearch}>
    <input
      type="text"
      class="search-text-input"
      bind:value={searchText}
      data-cy="disease-search-input"
    />
    <button type="submit" disabled={startDate == undefined}>検索</button>
  </form>
  <a href="javascript:void(0)" on:click={doExample}>例</a>
</div>
<div>
  <input
    type="radio"
    bind:group={searchKind}
    value="byoumei"
    id={byoumeiId}
    data-cy="search-byoumei-checkbox"
  />
  <label for={byoumeiId}>病名</label>
  <input
    type="radio"
    bind:group={searchKind}
    value="shuushokugo"
    id={shuushokugoId}
    data-cy="search-shuushokugo-checkbox"
  />
  <label for={shuushokugoId}>修飾語</label>
</div>
<div>
  <div class="search-result select" data-cy="search-result">
    {#each searchResult as r}
      <SelectItem selected={searchSelect} data={r.data} dataCy="search-result-item">
        <div data-result-kind={resultKind(r)}>{r.label}</div>
      </SelectItem>
    {/each}
  </div>
</div>

<style>
  .command-box {
    margin: 4px 0;
  }

  .search-form {
    display: inline-block;
  }

  .search-text-input {
    width: 8em;
  }

  .search-result {
    height: 8em;
    overflow-y: auto;
  }
</style>
