<script lang="ts">
  import api from "@/lib/api";
  import { genid } from "@/lib/genid";
  import SelectItem from "@/lib/SelectItem.svelte";
  import type {
    ByoumeiMaster,
    DiseaseExample,
    ShuushokugoMaster,
  } from "myclinic-model";
  import { writable, type Writable } from "svelte/store";
  import type { SearchResult } from "./search-result";

  export let examples: DiseaseExample[];
  export let startDate: Date;
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

  doExample();

  searchSelect.subscribe((r) => {
    if (r != null) {
      onSelect(r);
    }
  });

  async function doSearch() {
    console.log(startDate);
    const t = searchText.trim();
    if (t !== "" && startDate != null) {
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
</script>

<div class="command-box">
  <form class="search-form" on:submit|preventDefault={doSearch}>
    <input type="text" class="search-text-input" bind:value={searchText} />
    <button type="submit">検索</button>
  </form>
  <a href="javascript:void(0)" on:click={doExample}>例</a>
</div>
<div>
  <input type="radio" bind:group={searchKind} value="byoumei" id={byoumeiId} />
  <label for={byoumeiId}>病名</label>
  <input
    type="radio"
    bind:group={searchKind}
    value="shuushokugo"
    id={shuushokugoId}
  />
  <label for={shuushokugoId}>修飾語</label>
</div>
<div>
  <div class="search-result select">
    {#each searchResult as r}
      <SelectItem selected={searchSelect} data={r.data}>
        <div>{r.label}</div>
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
