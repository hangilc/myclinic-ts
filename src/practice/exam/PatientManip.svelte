<script lang="ts">
  import api from "@/lib/api";
  import { confirm } from "@/lib/confirm-call";
  import Confirm from "@/lib/Confirm.svelte";
  import { reqChangePatient, currentPatient } from "./ExamVars";
  import SearchTextDialog from "./patient-manip/SearchTextDialog.svelte";

  let searchTextDialog: SearchTextDialog;

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

  async function doSearchText() {
    if( $currentPatient ){
      searchTextDialog.open();
    }
  }
</script>

<div class="patient-manip top">
  <button>会計</button>
  <button on:click={onEndPatientClick}>患者終了</button>
  <a href="javascript:void(0)" on:click={doRegister}>診察登録</a>
  <a href="javascript:void(0)" on:click={doSearchText}>文章検索</a>
  <a href="javascript:void(0)">画像保存</a>
  <a href="javascript:void(0)">画像一覧</a>
</div>
<SearchTextDialog
  patient={$currentPatient}
  bind:this={searchTextDialog}
/>

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
