<script lang="ts">
  import SurfaceModal from "@/lib/SurfaceModal.svelte";
  import type { Patient } from "myclinic-model";

  export let patient: Patient;
</script>

<SurfaceModal title="患者情報編集" let:close on:close>
  <div class="panel">
    <span>患者番号</span>
    <span>{patient.patientId}</span>
    <span>氏名</span>
    <div class="input-block">
      <input type="text" bind:value={patient.lastName} class="name-input"/>
      <input type="text" bind:value={patient.firstName} class="name-input"/>
    </div>
    <span>よみ</span>
    <div class="input-block">
      <input type="text" bind:value={patient.lastNameYomi} class="name-input"/>
      <input type="text" bind:value={patient.firstNameYomi} class="name-input"/>
    </div>
    <span>生年月日</span>
    <div class="input-block">
      Date Input
    </div>
    <span>性別</span>
    <div class="input-block">

    </div>
    <span>住所</span>
    <div class="input-block">
      <input type="text" />
    </div>
    <span>電話</span>
    <div class="input-block">
      <input type="text" />
    </div>
  </div>
</SurfaceModal>

<style>
  .panel {
    display: grid;
    grid-template-columns: auto 1fr;
  }

  .panel > :nth-child(odd) {
    margin-right: 6px;
    text-align: right;
  }

  .input-block {
    display: inline-block;
  }

  .name-input {
    width: 80px;
  }

</style>
