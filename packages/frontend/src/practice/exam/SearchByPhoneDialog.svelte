<script lang="ts">
  import api from "@/lib/api";
  import Dialog from "@/lib/Dialog.svelte";
  import { pad } from "@/lib/pad";
  import { setFocus } from "@/lib/set-focus";
  import type { Patient } from "myclinic-model";

  export let destroy: () => void;
  export let onSelected: (patient:Patient) => void;
  let searchText = "";
  let patients: Patient[] = [];

  async function doSearch() {
    const t = searchText.trim();
    if (t === "") {
      return;
    } else {
      patients = await api.seawrchPatientByPhone(t);
      console.log("patients", patients);
    }
  }

  function onItemSelect(patient: Patient) {
    destroy();
    onSelected(patient);
  }

 </script>

<Dialog title="電話番号で検索" {destroy} styleWidth="360px">
  <div class="top">
    <form on:submit|preventDefault={doSearch}>
      <input
        type="text"
        bind:value={searchText}
        use:setFocus
        data-cy="search-text-input"
      /> <button>検索</button>
    </form>
    <div style="max-height:400px;overflow-y:auto;margin-top:10px;" class="search-result">
      {#each patients as patient (patient.patientId)}
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div
          on:click={() => onItemSelect(patient)}
          style="user-select:none;"
          class="item"
        >
          ({pad(patient.patientId, 4, "0")})
          {patient.lastName}
          {patient.firstName}
          {patient.phone}
        </div>
      {/each}
    </div>
  </div>
</Dialog>

<style>
  .search-result .item {
    cursor: pointer;
  }

  .search-result .item:hover {
    background-color: #ccc;
  }
</style>
