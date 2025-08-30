<script lang="ts">
  import Commands from "./workarea/Commands.svelte";
  import Title from "./workarea/Title.svelte";
  import Workarea from "./workarea/Workarea.svelte";
  import { cache } from "@/lib/cache";
  import DrugGroupRep from "@/lib/denshi-editor/components/prefab/DrugPrefabRep.svelte";
  import type { RP剤情報 } from "@/lib/denshi-shohou/presc-info";
  import { searchDrugPrefab, type DrugPrefab } from "@/lib/drug-prefab";

  export let destroy: () => void;
  export let onEnter: (value: RP剤情報) => void;
  let list: DrugPrefab[] = [];
  let selected: DrugPrefab[] = [];
  let searchText = "";

  load();

  async function load() {
    list = await cache.getDrugPrefabList();
  }

  function doSearch() {
    selected = searchDrugPrefab(list, searchText.trim())
  }

  async function doSelect(prefab: DrugPrefab) {
    const group = prefab.presc;
    onEnter(group);
    selected = [];
    searchText = "";
  }
</script>

<Workarea>
  <Title>処方例</Title>
  <form on:submit|preventDefault={doSearch}>
    <input type="text" bind:value={searchText} />
    <button type="submit">検索</button>
  </form>
  <div>
    {#each selected as ex}
      <div class="group">
        <div class="rep">
          <DrugGroupRep drugPrefab={ex} onSelect={doSelect} />
        </div>
        <div class="comment">
          {ex.comment ?? ""}
        </div>
      </div>
    {/each}
  </div>
  <Commands>
    <button on:click={destroy}>閉じる</button>
  </Commands>
</Workarea>

<style>
  form {
    margin: 10px 0;
  }

  .group {
    cursor: pointer;
    background-color: #eee;
    margin-bottom: 10px;
    border: 1px solid gray;
    padding: 6px;
  }

  .rep {
    user-select: none;
  }
</style>
