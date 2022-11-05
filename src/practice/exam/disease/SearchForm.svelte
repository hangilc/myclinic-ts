<script lang="ts">
  import { genid } from "@/lib/genid";
  import {
    DiseaseExampleObject,
    type ByoumeiMaster,
    type DiseaseExample,
    type ShuushokugoMaster,
  } from "@/lib/model";
  import { writable, type Readable, type Writable } from "svelte/store";
  import SelectItem from "@/lib/SelectItem.svelte";
  import api from "@/lib/api";
  import type { SearchResultType } from "./types";

  interface SearchResult {
    label: string;
    data: SearchResultType;
  }
  export let selected: Writable<SearchResultType | null>;
  export let examples: DiseaseExample[] = [];
  export let startDate: Readable<Date>;
  let searchSelect: Writable<SearchResult> = writable(null);
  let searchText: string = "";

  searchSelect.subscribe((sel) => {
    selected.set(sel.data);
  });

  type SearchKind = "byoumei" | "shuushokugo";
  let searchKind: SearchKind = "byoumei";
  let byoumeiId: string = genid();
  let shuushokugoId: string = genid();
  let searchResult: SearchResult[] = [];

  async function doSearch() {
    const t = searchText.trim();
    if (t !== "" && $startDate != null) {
      if (searchKind === "byoumei") {
        searchResult = (await api.searchByoumeiMaster(t, $startDate)).map(
          (m) => ({
            label: m.name,
            data: m,
          })
        );
      } else if (searchKind === "shuushokugo") {
        searchResult = (await api.searchShuushokugoMaster(t, $startDate)).map(
          (m) => ({
            label: m.name,
            data: m,
          })
        );
      }
    }
  }

  function doExample(): void {
    searchResult = examples.map((e) => {
      return {
        label: DiseaseExampleObject.repr(e),
        data: e,
      };
    });
  }
</script>

<div>
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
