<script lang="ts">
  import { cache } from "@/lib/cache";
  import type { ShinryouDisease } from "@/lib/shinryou-disease";
  import EditShinryouDiseaseDialog from "./shinryou-disease/EditShinryouDiseaseDialog.svelte";

  export let onChanged: () => void;
  export let at: string;
  let shinryouDiseases: ShinryouDisease[] = [];

  loadShinryouDiseases();

  async function loadShinryouDiseases() {
    shinryouDiseases = await cache.getShinryouDiseases();
  }

  function doEdit(item: ShinryouDisease) {
    const d: EditShinryouDiseaseDialog = new EditShinryouDiseaseDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        shinryouName: item.shinryouName,
        title: "診療病名の編集",
        at,
        orig: item,
        onEnter: async (updated: ShinryouDisease) => {
          let cur = await cache.getShinryouDiseases();
          cur = cur.map(e => e === item ? updated : e) ;
          await cache.setShinryouDiseases(cur);
          onChanged()
        }
      }
    })
  }

  async function doDelete(item: ShinryouDisease) {
    if (confirm("この診療病名を削除していいですか？")) {
      let cur = await cache.getShinryouDiseases();
      cur = cur.filter((e) => e !== item);
      await cache.setShinryouDiseases(cur);
      shinryouDiseases = await cache.getShinryouDiseases();
      onChanged();
    }
  }

  function auxLabel(item: ShinryouDisease): string {
    switch(item.kind){
      case "disease-check": {
        const diseaseName = item.diseaseName;
        let fix = "no fix";
        if( item.fix ){
          fix = item.fix.diseaseName;
          const adj = item.fix.adjNames;
          if( adj.length > 0 ){
            fix = `${fix}（${adj.join("・")}）`
          }
        }
        return `${diseaseName}|${fix}`
      }
      case "no-check": {
        return "no-check";
      }
    }
  }
</script>

<div class="wrapper">
  {#each shinryouDiseases as item}
    <div class="item">
      <div>{item.shinryouName}|{auxLabel(item)}</div>
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
