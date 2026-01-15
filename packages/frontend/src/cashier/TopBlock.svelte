<script lang="ts">
  import api from "@/lib/api";
  import type { Patient } from "myclinic-model";
  import NewPatientDialog from "./NewPatientDialog.svelte";
  import { PatientData } from "./patient-dialog/patient-data";
  import SearchPatientResultDialog from "./SearchPatientResultDialog.svelte";
  import * as recordPulldown from "./records-pulldown";
  import * as auxMenu from "./top-block-aux-menu";
  import Bars3 from "@/icons/Bars3.svelte";
  import { onshiFaceList } from "@/lib/onshi-face";
  import FaceListDialog from "./FaceListDialog.svelte";
  import type { EventEmitter } from "@/lib/event-emitter";
  import { popupTrigger } from "@/lib/popup-helper";

  export let hotlineTrigger: EventEmitter<string> | undefined = undefined;
  export let isAdmin: boolean = false;
  let searchText = "";

  async function doSearch() {
    const result: Patient[] = await api.searchPatientSmart(searchText);
    if (result.length === 1) {
      PatientData.start(result[0], { hotlineTrigger, isAdmin });
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
    PatientData.start(patient, { hotlineTrigger, isAdmin });
  }

  function doNewPatient(): void {
    const d: NewPatientDialog = new NewPatientDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        hotlineTrigger,
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
    <!-- svelte-ignore a11y-invalid-attribute -->
    <a href="javascript:void(0)" class="records-link" on:click={popupTrigger(() => [
      ["患者検索", recordPulldown.doSearch],
      ["最近の診察", recordPulldown.doRecentVisit],
      ["日付別", recordPulldown.doByDate],
    ])}
      >診療録</a
    >
    <Bars3 onClick={popupTrigger(() => [
      ["未収処理", auxMenu.doMishuu],
      ["手書き領収書印刷", auxMenu.doBlankReceipt],
      ["顔認証データ", auxMenu.doManualFaceConfirm],
    ])} color="#666" dx="2px" dy="-4px" style="cursor: pointer;"
      dataCy="bars3-menu"/>
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
