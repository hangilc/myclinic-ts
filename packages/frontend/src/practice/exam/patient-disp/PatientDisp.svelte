<script lang="ts">
  import type * as m from "myclinic-model";
  import * as kanjidate from "kanjidate";
  import { sexRep } from "../../../lib/util";
  import { PhoneMatch, splitPhoneNumber } from "@/lib/phone-number";
  import { CutText } from "@/lib/regexp-util";

  export let patient: m.Patient;

  let showDetail = false;
  let showPhone = false;
  let address = "";
  let phoneFrags: (CutText | PhoneMatch)[] = [];

  $: {
    showDetail = false;
    showPhone = false;
    phoneFrags = [];
    address = patient.address;
  }

  function toggleDetail(): void {
    showDetail = !showDetail;
    if (showDetail && phoneFrags.length === 0) {
      phoneFrags = splitPhoneNumber(patient.phone);
      console.log(phoneFrags);
    }
  }

  function doPhone(): void {
    alert("phone");
  }
</script>

<div class="patient-disp">
  <div>
    [{patient.patientId}]
    {patient.lastName}
    {patient.firstName}
    ({patient.lastNameYomi}
    {patient.firstNameYomi})
    {kanjidate.format(kanjidate.f2, patient.birthday)}生
    {kanjidate.calcAge(new Date(patient.birthday))}才
    {sexRep(patient.sex)}姓
    <a href="javascript:void(0)" on:click={toggleDetail}>詳細</a>
  </div>
  {#if showDetail}
    <div class="detail">
      <div>
        <span>住所：</span>{address}
      </div>
      <div>
        <span>電話：</span>
        <span>
          {#each phoneFrags as frag}
            {#if frag instanceof CutText}
              {frag.text}
            {:else}
              {frag.orig}
            {/if}
          {/each}
        </span>
      </div>
    </div>
  {/if}
  {#if showDetail && showPhone}
    <div>Phone:</div>
  {/if}
</div>

<style>
  .detail {
    padding: 0 0 0 2em;
  }
</style>
