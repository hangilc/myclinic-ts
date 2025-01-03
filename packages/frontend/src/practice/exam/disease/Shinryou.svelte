<script lang="ts">
  import { cache } from "@/lib/cache";
  import type { ShinryouDisease } from "@/lib/shinryou-disease";

  export let onChanged: () => void;
  let shinryouDiseases: ShinryouDisease[] = [];

  loadShinryouDiseases();

  async function loadShinryouDiseases() {
    shinryouDiseases = await cache.getShinryouDiseases();
  }

  function doEdit(item: ShinryouDisease) {}

  async function doDelete(item: ShinryouDisease) {
    if (confirm("この診療病名を削除していいですか？")) {
      let cur = await cache.getShinryouDiseases();
      cur = cur.filter((e) => e !== item);
      await cache.setShinryouDiseases(cur);
      shinryouDiseases = await cache.getShinryouDiseases();
      onChanged();
    }
  }
</script>

<div class="wrapper">
  {#each shinryouDiseases as item}
    <div class="item">
      <div>{item.shinryouName}</div>
      <div>
        <button on:click={() => doEdit(item)}>編集</button>
        <button on:click={() => doDelete(item)}>削除</button>
      </div>
    </div>
    <hr />
  {/each}
</div>

<style>
  .wrapper {
    height: fit-content;
    max-height: 300px;
    overflow-y: auto;
    resize: vertical;
    margin-top: 10px;
  }

  .item {
    font-size: 12px;
  }
</style>
