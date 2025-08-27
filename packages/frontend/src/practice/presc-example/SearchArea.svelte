<script lang="ts">
  import Link from "../ui/Link.svelte";
  import type { DrugPrefab } from "@/lib/drug-prefab";
  import DrugPrefabRep from "./components/DrugPrefabRep.svelte";

  export let onSelect: (data: DrugPrefab) => void;
  export let list: DrugPrefab[];
  let selected: DrugPrefab[] = [];
  let searchText = "";

  

  // $: selected = updateSelected(list);

  // function updateSelected(list: PrescExampleData[]): PrescExampleData[] {
  //   if (searchText === "") {
  //     return list;
  //   } else {
  //     return list.filter((e) => {
  //       return e.data.薬品情報グループ.some((d) =>
  //         d.薬品レコード.薬品名称.includes(searchText),
  //       );
  //     });
  //   }
  // }

  function doShowAll() {
    selected = list;
  }

  function doSearch() {
    // selected = updateSelected(list);
  }

</script>

<div class="search-form">
  <form on:submit|preventDefault={doSearch}>
    <input type="text" bind:value={searchText} />
    <button type="submit">検索</button>
  </form>
  <Link onClick={doShowAll}>全例</Link>
</div>
<div class="list">
  {#each selected as data (data.id)}
    <div class="group">
      <div>
        <DrugPrefabRep drugPrefab={data} onSelect={onSelect}/>
      </div>
    </div>
  {/each}
</div>

<style>
  .search-form {
    margin-bottom: 10px;
  }

  .search-form form {
    display: inline-block;
  }

  .list {
    max-height: 500px;
    overflow-y: auto;
  }

  .group {
    margin: 10px 10px 10px 0;
    border: 1px solid gray;
    padding: 6px;
    background-color: #f8f8f8;
  }

  .group:nth-child(1) {
    margin-top: 0;
  }

</style>
