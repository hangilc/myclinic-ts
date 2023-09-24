<script lang="ts">
  import { pad } from "@/lib/pad";
  import Dialog from "@/lib/Dialog.svelte";
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

<Dialog {destroy} title="患者検索結果" styleWidth="260px">
  <div class="result-wrapper">
    {#if patients.length === 0}
      （該当患者がありません）
    {:else}
      {#each patients as p (p.patientId)}
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div class="result-item" on:click={() => doSelect(p)} data-patient-id={p.patientId}>
          ({pad(p.patientId, 4, "0")}) {p.fullName()}
        </div>
      {/each}
    {/if}
  </div>
</Dialog>

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
