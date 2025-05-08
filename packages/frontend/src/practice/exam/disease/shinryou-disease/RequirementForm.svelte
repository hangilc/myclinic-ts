<script lang="ts">
  import api from "@/lib/api";
  import type { Requirement } from "@/lib/shinryou-disease";
  import type { ByoumeiMaster, ShuushokugoMaster } from "myclinic-model";

  export let src: Requirement | undefined = undefined;
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
  
  function updateFixRep() {
	let d = fixDiseaseName;
	let a = fixAdjNames.join("・");
	return `${d} (${a})`;
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
    <input type="text" bind:value={searchText} />
    <button type="submit">検索</button>
  </form>
  <div>
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
