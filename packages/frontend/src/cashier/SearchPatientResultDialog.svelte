<script lang="ts">
  import { pad } from "@/lib/pad";
  import SurfaceModal from "@/lib/SurfaceModal.svelte";
  import type { Patient } from "myclinic-model";

  export let result: Patient[];
  export let destroy: () => void;
  export let onSelect: (patient: Patient) => void = (_) => {};
  let patients: Patient[] = result.sort((a, b) => {
    const c = a.lastNameYomi.localeCompare(b.lastNameYomi);
    if (c === 0) {
      return a.firstNameYomi.localeCompare(b.firstNameYomi);
    } else {
      return c;
    }
  });

  function doSelect(patient: Patient): void {
    destroy();
    onSelect(patient);
  }
</script>

<SurfaceModal {destroy} title="患者検索結果" width="260px">
  <div class="result-wrapper">
    {#if patients.length === 0}
      （該当患者がありません）
    {:else}
      {#each patients as p (p.patientId)}
        <div class="result-item" on:click={() => doSelect(p)} data-patient-id={p.patientId}>
          ({pad(p.patientId, 4, "0")}) {p.fullName()}
        </div>
      {/each}
    {/if}
  </div>
</SurfaceModal>

<style>
  .result-wrapper {
    max-height: 360px;
    overflow-y: auto;
  }

  .result-item {
    cursor: pointer;
  }

  .result-item:hover {
    background-color: #eee;
  }
</style>
