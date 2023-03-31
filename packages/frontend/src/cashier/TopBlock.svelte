<script lang="ts">
  import api from "@/lib/api";
  import Popup from "@/lib/Popup.svelte";
  import type { Patient } from "myclinic-model";
  import NewPatientDialog from "./NewPatientDialog.svelte";
  import { PatientData } from "./patient-dialog/patient-data";
  import SearchPatientResultDialog from "./SearchPatientResultDialog.svelte";
  import RecordsPulldown from "./RecordsPulldown.svelte";
  import TopBlockAuxMenu from "./TopBlockAuxMenu.svelte";
  import Bars3 from "@/icons/Bars3.svelte";
  import { onshiFaceList } from "@/lib/onshi-face";
  import FaceListDialog from "./FaceListDialog.svelte";

  let searchText = "";

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

  async function doListFaceConfirm() {
    const list = await onshiFaceList();
    const d: FaceListDialog = new FaceListDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        list,
      }
    })
  }

</script>

<div class="top">
  <div class="title">受付患者</div>
  <form class="search-form" on:submit|preventDefault={doSearch}>
    <input type="text" class="search-input" bind:value={searchText} data-cy="search-text-input"/>
    <button data-cy="search-button">検索</button>
  </form>
  <button on:click={doNewPatient}>新規患者</button>
  <button on:click={doListFaceConfirm}>顔認証一覧</button>
  <Popup let:trigger let:destroy>
    <a href="javascript:void(0)" class="records-link" on:click={trigger}
      >診療録</a
    >
    <RecordsPulldown slot="menu" {destroy}/>
  </Popup>
  <Popup let:trigger let:destroy>
    <Bars3 onClick={trigger} color="#666" dx="2px" dy="-4px" style="cursor: pointer;"
      dataCy="bars3-menu"/>
    <TopBlockAuxMenu slot="menu" {destroy}/>
  </Popup>
</div>

<style>
  .top {
    display: flex;
    align-items: center;
  }

  .top > button {
    margin-right: 4px;
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

  /* .menu-svg {
    stroke: gray;
    cursor: pointer;
    margin-top: -4px;
    margin-left: 6px;
  } */
</style>
