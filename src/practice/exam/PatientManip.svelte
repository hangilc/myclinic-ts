<script lang="ts">
  import api from "@/lib/api";
  import { confirm } from "@/lib/confirm-call";
  import type { Meisai } from "@/lib/model";
  import { writable, type Writable } from "svelte/store";
  import { reqChangePatient, currentPatient, currentVisitId } from "./ExamVars";
  import CashierDialog from "./patient-manip/CashierDialog.svelte";
  import SearchTextDialog from "./patient-manip/SearchTextDialog.svelte";
  import UploadImageDialog from "./patient-manip/UploadImageDialog.svelte";

  let cashierDialog: CashierDialog;
  let searchTextDialog: SearchTextDialog;
  let uploadImageDialog: UploadImageDialog;
  let cashierVisitId: Writable<number | null> = writable(null);

  async function doCashier() {
    const visitId = $currentVisitId;
    if (visitId != null) {
      cashierVisitId.set(visitId);
      cashierDialog.open();
    }
  }

  function onEndPatientClick() {
    reqChangePatient.set(null);
  }

  function doRegister(): void {
    const patient = $currentPatient;
    if (patient != null) {
      confirm("診察を登録しますか？", () => {
        api.startVisit(patient.patientId, new Date());
      });
    }
  }

  function doSearchText() {
    if ($currentPatient) {
      searchTextDialog.open();
    }
  }

  function doUploadImage() {
    if ($currentPatient) {
      uploadImageDialog.open();
    }
  }
</script>

<div class="patient-manip top">
  <button on:click={doCashier} disabled={$currentVisitId == null}>会計</button>
  <button on:click={onEndPatientClick}>患者終了</button>
  <a href="javascript:void(0)" on:click={doRegister}>診察登録</a>
  <a href="javascript:void(0)" on:click={doSearchText}>文章検索</a>
  <a href="javascript:void(0)" on:click={doUploadImage}>画像保存</a>
  <a href="javascript:void(0)">画像一覧</a>
</div>
<CashierDialog bind:this={cashierDialog} visitId={cashierVisitId} />
<SearchTextDialog patient={$currentPatient} bind:this={searchTextDialog} />
<UploadImageDialog bind:this={uploadImageDialog} />

<style>
  .top {
    display: flex;
    align-items: center;
  }
  * + button {
    margin-left: 4px;
  }
  * + a {
    margin-left: 4px;
  }
</style>
