<script lang="ts">
  import type { Patient } from "myclinic-model";
  import { createMerge, getInfo } from "./functions";
  import type { PatientInfo } from "./dup-patient";
  import PatientInfoComponent from "./PatientInfo.svelte";
  
  export let patient1: Patient
  export let patient2: Patient
  export let onMerged: () => void;
  let info1: PatientInfo | undefined = undefined;
  let info2: PatientInfo | undefined = undefined;
  let merge1: (() => Promise<void>) | undefined = undefined;
  let merge2: (() => Promise<void>) | undefined = undefined;
  
  init();

  async function init() {
	info1 = await getInfo(patient1);
	info2 = await getInfo(patient2);
	merge1 = createMerge(info1, info2, onMerged);
	merge2 = createMerge(info2, info1, onMerged);
  }

</script>

<div>
  {#if info1 !== undefined}
	<div>
	  <PatientInfoComponent info={info1} />
	</div>
	{#if merge1}
	  <div>
		<button on:click={merge1}>Merge this to other</button>
	  </div>
	{/if}
  {/if}
  {#if info2 !== undefined}
	<div>
	  <PatientInfoComponent info={info2} />
	</div>
	{#if merge2}
	  <div>
		<button on:click={merge2}>Merge this to other</button>
	  </div>
	{/if}
  {/if}
</div>



