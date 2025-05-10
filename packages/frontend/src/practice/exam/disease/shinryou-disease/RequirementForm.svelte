<script lang="ts">
  import api from "@/lib/api";
  import type { Requirement } from "@/lib/shinryou-disease";
  import type { ByoumeiMaster, ShuushokugoMaster } from "myclinic-model";

  export let src: Requirement;
  export let at: string;
  export let onEnter: (entered: Requirement) => void;
  export let onCancel: () => void;
  let diseaseName: string = "";
  let fixRep: string = "";
  let fixDiseaseName = "";
  let fixAdjNames: string[] = [];
  let searchMode: "byoumei" | "shuushokugo" = "byoumei";
  let searchText = "";
  let byoumeiResult: ByoumeiMaster[] = [];
  let adjResult: ShuushokugoMaster[] = [];

  if( src ){
	diseaseName = src.diseaseName;
	if( src.fix ){
	  fixDiseaseName = src.fix.diseaseName;
	  fixAdjNames = src.fix.adjNames;
	}
  }
  updateFixRep();
  
  function updateFixRep() {
	if( fixDiseaseName ){
	  if( fixAdjNames.length === 0 ){
		fixRep = fixDiseaseName;
	  } else {
		let d = fixDiseaseName;
		let a = fixAdjNames.join("・");
		fixRep = `${d} (${a})`;
	  }
	} else {
	  fixRep = "";
	}
  }
  
  async function doSearch() {
    searchText = searchText.trim();
    if (searchText !== "") {
	  byoumeiResult = [];
	  adjResult = [];
	  if (searchMode === "byoumei") {
        byoumeiResult = await api.searchByoumeiMaster(searchText, at);
	  } else if (searchMode === "shuushokugo") {
        adjResult = await api.searchShuushokugoMaster(searchText, at);
	  }
    }
  }

  function doByoumeiSelect(m: ByoumeiMaster) {
	if( diseaseName === "" ){
	  diseaseName = m.name;
	}
	fixDiseaseName = m.name;
    searchText = "";
    searchMode = "shuushokugo";
    byoumeiResult = [];
	updateFixRep();
  }

  function doAdjSelect(m: ShuushokugoMaster) {
	fixAdjNames.push(m.name);
    searchText = "";
    searchMode = "shuushokugo";
	adjResult = [];
	updateFixRep();
  }

  function doSusp() {
	fixAdjNames.push("の疑い");
	updateFixRep();
  }

  function doDeleteAdj() {
	fixAdjNames = [];
	updateFixRep();
  }

  function doEnter() {
	diseaseName = diseaseName.trim();
	if( diseaseName === "" ){
	  alert("症病名が設定されていません");
	  return;
	}
	let fix: { diseaseName: string, adjNames: string []} | undefined = undefined;
	if( fixDiseaseName ) {
	  fix = { diseaseName: fixDiseaseName, adjNames: fixAdjNames };
	}
	let req: Requirement = {
	  diseaseName,
	  fix,
	}
	onEnter(req);
  }

  function doCancel() {
	onCancel();
  }
</script>

<!-- svelte-ignore a11y-invalid-attribute -->
<div>
  <div>
	症病名：<input type="text" bind:value={diseaseName} />
  </div>
  <div>
	Ｆｉｘ：{fixRep}
  </div>
  <hr />
  <form on:submit|preventDefault={doSearch}>
    <input type="radio" value="byoumei" bind:group={searchMode} /> 病名
    <input type="radio" value="shuushokugo" bind:group={searchMode} /> 修飾語
	{#if searchMode === "shuushokugo"}
	  <a href="javascript:void(0)" on:click={doSusp}>の疑い</a>
	  <a href="javascript:void(0)" on:click={doDeleteAdj}>修飾語削除</a>
	{/if}
	<div class="search-text-input">
      <input type="text" bind:value={searchText} />
      <button type="submit">検索</button>
</div>
</form>
  <div class="search-result">
    {#if byoumeiResult.length > 0}
{#each byoumeiResult as m (m.shoubyoumeicode)}
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div on:click={() => doByoumeiSelect(m)} style="cursor:pointer;">{m.name}</div>
{/each}
{/if}
{#if adjResult.length > 0}
  {#each adjResult as m (m.shuushokugocode)}
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div on:click={() => doAdjSelect(m)} style="cursor:pointer;">{m.name}</div>
  {/each}
{/if}
</div>
<hr />
<div>
  <button on:click={doEnter}>決定</button>
  <button on:click={doCancel}>キャンセル</button>
</div>
</div>

<style>
  .search-text-input {
	display: block;
  }
  
  .search-result {
	max-height: 12em;
	overflow-y: auto;
  }
</style>








