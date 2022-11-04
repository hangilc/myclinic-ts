<script lang="ts">
  import { genid } from "@/lib/genid";
  import type {
    ByoumeiMaster,
    DiseaseExample,
    ShuushokugoMaster,
  } from "@/lib/model";
  import { writable, type Writable } from "svelte/store";
  import SelectItem from "@/lib/SelectItem.svelte";

  interface SearchResult {
    label: string;
    data: ByoumeiMaster | ShuushokugoMaster | DiseaseExample;
  }
  export let selected: Writable<SearchResult> = writable(null);
  export let examples: DiseaseExample[] = [];

  type SearchKind = "byoumei" | "shuushokugo";
  let searchKind: SearchKind = "byoumei";
  let byoumeiId: string = genid();
  let shuushokugoId: string = genid();
  let searchResult: SearchResult[] = [];
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
      <SelectItem selected={selected} data={r.data}>
        <div>{r.label}</div>
      </SelectItem>
    {/each}
  </div>
</div>
