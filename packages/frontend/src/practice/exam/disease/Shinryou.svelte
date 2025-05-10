<script lang="ts">
  import { cache } from "@/lib/cache";
  import type { ShinryouDisease } from "@/lib/shinryou-disease";
  import EditShinryouDiseaseDialog from "./shinryou-disease/EditShinryouDiseaseDialog.svelte";
  import { shinryouDiseasesUpdated } from "../exam-vars";
  import { onDestroy } from "svelte";

  export let onChanged: () => void;
  export let at: string;
  
  let shinryouDiseases: ShinryouDisease[] = [];
  let filterText = "";
  let filteredShinryouDiseases: ShinryouDisease[] = [];
  
  loadShinryouDiseases();

  const unsubs = [shinryouDiseasesUpdated.subscribe(ver => {
	if( ver !== 0 ){
	  console.log("ver", ver);
	  loadShinryouDiseases();
	}
  })];

  onDestroy(() => unsubs.forEach(f => f()))
  
  async function loadShinryouDiseases() {
    shinryouDiseases = await cache.getShinryouDiseases();
	doApplyFilter();
  }

  function doApplyFilter() {
	if( filterText === "" ){
	  console.log("no-filter", shinryouDiseases.length);
	  filteredShinryouDiseases = shinryouDiseases;
	} else {
	  filteredShinryouDiseases = shinryouDiseases.filter(s => {
		return s.shinryouName.indexOf(filterText) >= 0;
	  })
	}
  }

  function doEdit(item: ShinryouDisease) {
    const d: EditShinryouDiseaseDialog = new EditShinryouDiseaseDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        title: "診療行為病名の編集",
        at,
        orig: item,
        onEnter: async (updated: ShinryouDisease) => {
          let cur = await cache.getShinryouDiseases();
          cur = cur.map(e => e.id === updated.id ? updated : e) ;
          await cache.setShinryouDiseases(cur);
		  loadShinryouDiseases();
          onChanged();
        },
		onCancel: () => {},
      }
    })
  }

  async function doDelete(item: ShinryouDisease) {
    if (confirm("この診療病名を削除していいですか？")) {
      let cur = await cache.getShinryouDiseases();
      cur = cur.filter((e) => e !== item);
      await cache.setShinryouDiseases(cur);
	  loadShinryouDiseases();
      onChanged();
    }
  }

  function reqFixRep(fix: { diseaseName: string, adjNames: string[] }): string {
	if( fix.adjNames.length === 0 ){
	  return fix.diseaseName; 
	} else {
	  let adj = fix.adjNames.join("、");
	  return `${fix.diseaseName} (${adj})`
	}
  }
  
  function shinryouRep(item: ShinryouDisease): string {
	switch(item.kind) {
	  case "disease-check": {
		let s = `${item.shinryouName}|${item.diseaseName}`;
		if( item.fix ){
		  s += `|${reqFixRep(item.fix)}`;
		}
		return s;
	  }
	  case "multi-disease-check": {
		let d = item.requirements.map(req => req.diseaseName).join("・");
		let s = `${item.shinryouName}|${d}`;
		let fixes: { diseaseName: string, adjNames: string[]}[] = [];
		for(let req of item.requirements){
		  if( req.fix ){
			fixes.push(req.fix);
		  }
		}
		let f = fixes.map(fix => reqFixRep(fix)).join("、");
		if( f ){
		  s += `|${f}`;
		}
		return s;
	  }
	  case "no-check": {
		return `${item.shinryouName}|no-check`;
	  }
	}
  }
</script>

<div class="wrapper">
  <form on:submit|preventDefault={doApplyFilter}>
	filter: <input type="text" size="9" bind:value={filterText}/>
	<button type="submit">apply</button>
  </form>
  <hr />
  {#each filteredShinryouDiseases as item}
    <div class="item">
      <div>{shinryouRep(item)}</div>
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
