<script lang="ts">
  import SurfaceModal from "@/lib/SurfaceModal.svelte";
  import * as kanjidate from "kanjidate";
  import type { PatientData } from "./patient-data";

  export let patientData: PatientData | undefined = undefined;
  export let onClose: () => void = () => {};
</script>

<SurfaceModal
  on:close
  width="360px"
  height="auto"
  title="患者情報"
  {onClose}
>
  {#if patientData}
    {@const p = patientData.patient}
    <div class="info">
      <span>患者番号</span><span>{p.patientId}</span>
      <span>氏名</span><span>{p.lastName} {p.firstName}</span>
      <span>よみ</span><span>{p.lastNameYomi} {p.firstNameYomi}</span>
      <span>生年月日</span><span
        >{kanjidate.format(kanjidate.f2, p.birthday)}</span
      >
      <span>性別</span><span>{p.sexAsKanji}性</span>
      <span>住所</span><span>{p.address}</span>
      <span>電話</span><span>{p.phone}</span>
    </div>
    <div>
      {#each patientData.currentHokenList as h}
        <a href="javascript:void(0)">{h.rep}</a>
      {/each}
    </div>
  {/if}
</SurfaceModal>

<style>
  .info {
    display: grid;
    grid-template-columns: auto 1fr;
  }

  .info *:nth-child(odd) {
    display: flex;
    align-items: center;
    justify-content: right;
    margin-right: 6px;
  }
</style>
