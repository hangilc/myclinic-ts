<script lang="ts">
    import api from "@/lib/api";
  import { reqChangePatient, currentPatient } from "./ExamVars";

  function onEndPatientClick() {
    reqChangePatient.set(null);
  }

  async function doRegister() {
    const patient = $currentPatient;
    if( patient != null ){
      await api.startVisit(patient.patientId, new Date());
    }
  }

  async function doSearchText() {

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