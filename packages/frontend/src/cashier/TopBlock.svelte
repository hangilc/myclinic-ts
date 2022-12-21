<script lang="ts">
  import api from "@/lib/api";
  import type { Patient } from "myclinic-model";
  import NewPatientDialog from "./NewPatientDialog.svelte";
  import { PatientData } from "./patient-dialog2/patient-data";
  import RecordsPulldown from "./RecordsPulldown.svelte";
  import SearchPatientResultDialog from "./SearchPatientResultDialog.svelte";
  import TopBlockAuxMenuPulldown from "./TopBlockAuxMenuPulldown.svelte";

  let searchText = "";
  let auxMenuIcon: SVGSVGElement;
  let recordsLink: HTMLElement;

  async function doSearch() {
    const result: Patient[] = await api.searchPatientSmart(searchText);
    if (result.length === 1) {
      PatientData.start(result[0]);
    } else {
      const d: SearchPatientResultDialog = new SearchPatientResultDialog({
        target: document.body,
        props: {
          result,
          destroy: () => d.$destroy(),
          onSelect: doPatientSelected,
        },
      });
    }
    searchText = "";
  }

  async function doPatientSelected(patient: Patient) {
    PatientData.start(patient);
  }

  function doNewPatient(): void {
    const d: NewPatientDialog = new NewPatientDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
      },
    });
  }

  function doAuxMenu(): void {
    const d: TopBlockAuxMenuPulldown = new TopBlockAuxMenuPulldown({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        anchor: auxMenuIcon
      }
    })
  }

  function doRecords(): void {
    const d: RecordsPulldown = new RecordsPulldown({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        anchor: recordsLink,
      }
    })
  }
</script>

<div class="top">
  <div class="title">受付患者</div>
  <form class="search-form" on:submit|preventDefault={doSearch}>
    <input type="text" class="search-input" bind:value={searchText} />
    <button>検索</button>
  </form>
  <button on:click={doNewPatient}>新規患者</button>
  <a href="javascript:void(0)" class="records-link" on:click={doRecords}
    bind:this={recordsLink}>診療録</a>
  <svg
    class="menu-svg"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke-width="1.5"
    stroke="currentColor"
    width="24px"
    on:click={doAuxMenu}
    bind:this={auxMenuIcon}
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
    />
  </svg>
</div>

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
