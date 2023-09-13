<script lang="ts">
  import type { Patient } from "myclinic-model";
  import Dialog from "./Dialog.svelte";
  import api from "./api";

  export let destroy: () => void;
  export let onSelect: (patient: Patient) => void;
  let searchText = "";
  let searchResult: Patient[] = [];

  async function doSearch() {
    searchResult = await api.searchPatientSmart(searchText);
    console.log(searchResult);
  }

  function doSelect(patient: Patient) {
    destroy();
    onSelect(patient);
  }
</script>

<Dialog title="患者検索" {destroy}>
  <div>
    <input type="text" bind:value={searchText}/> <button on:click={doSearch}>検索</button>
  </div>
  <div>
    {#each searchResult as patient (patient.patientId)}
      <div class="patient-wrapper" data-patient-id={patient.patientId}>
        ({patient.patientId}) {patient.fullName()} 
        <button on:click={() => doSelect(patient)}>選択</button>
      </div>
    {/each}
  </div>
</Dialog>

<style>
  .patient-wrapper {
    display: flex;
    align-items: center;
    margin: 6px 0;
  }

  .patient-wrapper button {
    margin-left: 10px;
  }
</style>