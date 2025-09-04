<script lang="ts">
  import { cache } from "@/lib/cache";
  import Dialog2 from "@/lib/Dialog2.svelte";
  import DrugUsageConvEdit from "./DrugUsageConvEdit.svelte";

  export let destroy: () => void;
  let map: Record<string, string> = {};
  let matched: [number, string, string][] = [];
  let serialId = 1;
  let id: number = 0;
  let srcName: string = "";
  let dstName: string = "";
  let searchText: string = "";

  init();

  async function init() {
    map = await cache.getDrugUsageConv();
    matched = [];
    for (let key in matched) {
      matched.push([serialId++, key, map[key]]);
    }
  }

  function doNew() {
    id = serialId++;
    srcName = "";
    dstName = "";
  }

  function doEditorCancel() {
    id = 0;
    srcName = "";
    dstName = "";
  }

  async function doEditorEnter(
    _targetId: number,
    srcName: string,
    dstName: string,
  ) {
    if (dstName === "") {
      delete map[srcName];
    } else {
      map[srcName] = dstName;
    }
    await cache.setDrugUsageConv(map);
    await init();
    id = 0;
  }

  async function doSearch() {
    const t = searchText.trim();
    matched = [];
    for (let key in map) {
      let value = map[key];
      if (key.includes(t) || value.includes(t)) {
        matched.push([serialId++, key, value]);
      }
    }
  }

  function doItemSelect(targetId: number, src: string, dst: string) {
    srcName = src;
    dstName = dst;
    id = targetId;
    matched = [];
  }
</script>

<Dialog2 {destroy} title="用法変換管理">
  <div class="top">
    <div>
      <div>
        <button on:click={doNew}>新規</button>
      </div>
      <form on:submit|preventDefault={doSearch} class="search-form">
        <input type="text" bind:value={searchText} />
        <button type="submit">検索</button>
      </form>
      <div class="search-result">
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        {#each matched as [id, src, dst] (id)}
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <div
            class="cursor-pointer item"
            on:click={() => doItemSelect(id, src, dst)}
          >
            {src} → {dst}
          </div>
        {/each}
      </div>
    </div>
    <div>
      {#if id > 0}
        <DrugUsageConvEdit
          {id}
          {srcName}
          {dstName}
          onCancel={doEditorCancel}
          onEnter={doEditorEnter}
        />
      {/if}
    </div>
  </div>
</Dialog2>

<style>
  .top {
    width: 700px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 10px;
    padding: 10px;
  }

  .search-form {
    margin: 10px 0;
  }

  .search-result {
    max-height: 200px;
  }

  .cursor-pointer {
    cursor: pointer;
  }

  .item:hover {
    background-color: #eee;
  }
</style>
