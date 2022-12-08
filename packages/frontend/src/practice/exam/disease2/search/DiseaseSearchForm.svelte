<script lang="ts">
  import { genid } from "@/lib/genid";
  import SelectItem from "@/lib/SelectItem.svelte";
  import type { ByoumeiMaster, DiseaseExample, ShuushokugoMaster } from "myclinic-model";
  import { writable, type Writable } from "svelte/store";
  import type { SearchResult } from "./search-result";

  let searchText: string = "";
  let searchKind: string = "byoumei";
  const byoumeiId: string = genid();
  const shuushokugoId: string = genid();
  let searchResult: SearchResult[] = [];
  let searchSelect: Writable<
    ByoumeiMaster | ShuushokugoMaster | DiseaseExample | null
  > = writable(null);

  function doSearch() {}

  function doExample() {}
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

<style>
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
