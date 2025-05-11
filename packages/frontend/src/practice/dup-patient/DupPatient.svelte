<script lang="ts">
  import ServiceHeader from "@/ServiceHeader.svelte";
  import { searchDupPatient, type DupWrapper } from "./functions";
  import DupDetail from "./DupDetail.svelte";

  let searchResult: DupWrapper[] = [];
  
  async function doSearch() {
	searchResult = await searchDupPatient();
  }

  function doDelete(id: number) {
	searchResult = searchResult.filter(r => r.id !== id);
  }
</script>

<ServiceHeader title="重複患者管理" />
<div>
  <button on:click={doSearch}>重複患者検索</button>
</div>
<div class="search-result">
  {#each searchResult as result (result.id)}
	<div class="result-item">
	  <div>
		{ result.patient1.patientId} {result.patient2.patientId}
		{ result.patient1.lastName}{ result.patient1.firstName }
		<button on:click={() => result.detail = !result.detail}>詳細</button>
	  </div>
	  {#if result.detail}
		<div>
		  <DupDetail patient1={result.patient1} patient2={result.patient2}
			onMerged={() => doDelete(result.id)}/>
		</div>
	  {/if}
	</div>
  {/each}
</div>

<style>
  .search-result {
	margin: 10px 0;
  }

  .result-item {
	margin: 6px 0;
  }
</style>


