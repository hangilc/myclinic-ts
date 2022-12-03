<script lang="ts">
  import api from "@/lib/api";
  import type { Patient } from "myclinic-model";
  import { listCurrentHoken } from "./patient-dialog/misc";
  import { PatientData } from "./patient-dialog/patient-data";
  import SearchPatientResultDialog from "./SearchPatientResultDialog.svelte";

  let searchText = "";
  let searchPatientResultDialog: SearchPatientResultDialog;

  async function doSearch() {
    const result: Patient[] = await api.searchPatientSmart(searchText);
    if (searchPatientResultDialog) {
      searchPatientResultDialog.open(result);
      searchText = "";
    }
  }

  async function doPatientSelected(patient: Patient) {
    const hokenList = await listCurrentHoken(patient.patientId);
    const data = new PatientData(patient, hokenList);
    data.moveToInfo();
  }
</script>

<div class="top">
  <div class="title">受付患者</div>
  <form class="search-form" on:submit|preventDefault={doSearch}>
    <input type="text" class="search-input" bind:value={searchText} />
    <button>検索</button>
  </form>
  <button>新規患者</button>
  <a href="javascript:void(0)" class="records-link">診療録</a>
  <svg
    class="menu-svg"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke-width="1.5"
    stroke="currentColor"
    width="24px"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
    />
  </svg>
</div>
<SearchPatientResultDialog
  bind:this={searchPatientResultDialog}
  onSelect={doPatientSelected}
/>

<style>
  .top {
    display: flex;
    align-items: center;
  }

  .title {
    margin-right: 40px;
    font-size: 1.5rem;
  }

  .search-form {
    margin-right: 6px;
  }

  .search-input {
    width: 8em;
  }

  .records-link {
    margin-left: 6px;
  }

  .menu-svg {
    stroke: gray;
    cursor: pointer;
    margin-top: -4px;
    margin-left: 6px;
  }
</style>
