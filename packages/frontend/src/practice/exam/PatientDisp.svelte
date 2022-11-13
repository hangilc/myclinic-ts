<script lang="ts">
import type * as m from "myclinic-model";
import * as kanjidate from "kanjidate";
import { sexRep } from "../../lib/util";

  export let patient: m.Patient;
  
  let showDetail: boolean = false;

  function toggleDetail(): void {
    showDetail = !showDetail;
  }
</script>

<!-- svelte-ignore a11y-invalid-attribute -->
<div class="patient-disp">
  <div>
    [{patient.patientId}]
    {patient.lastName} {patient.firstName}
    ({patient.lastNameYomi} {patient.firstNameYomi})
    {kanjidate.format(kanjidate.f2, patient.birthday)}生
    {kanjidate.calcAge(new Date(patient.birthday))}才
    {sexRep(patient.sex)}姓
    <a href="javascript:void(0)" on:click={toggleDetail}>詳細</a>
  </div>
  {#if showDetail}
    <div class="detail">
      <div>
        <span>住所：</span>{patient.address}
      </div>
      <div>
        <span>電話：</span>{patient.phone}
      </div>
    </div>
  {/if}
</div>

<style>
  .detail {
    padding: 0 0 0 2em
  }
</style>