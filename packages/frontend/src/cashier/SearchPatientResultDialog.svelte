<script lang="ts">
  import Dialog from "@/lib/Dialog.svelte";
  import { pad } from "@/lib/pad";
  import type { Patient } from "myclinic-model";

  export let onSelect: (patient: Patient) => void = (_) => {};
  let patients: Patient[] = [];
  let dialog: Dialog;

  export function open(result: Patient[]): void {
    patients = result.sort((a, b) => {
      const c = a.lastNameYomi.localeCompare(b.lastNameYomi);
      if (c === 0) {
        return a.firstNameYomi.localeCompare(b.firstNameYomi);
      } else {
        return c;
      }
    });
    dialog.open();
  }

  function doSelect(patient: Patient, close: () => void): void {
    close();
    onSelect(patient);
  }
</script>

<Dialog bind:this={dialog} let:close>
  <span slot="title">患者検索結果</span>
  <div class="result-wrapper">
    {#each patients as p (p.patientId)}
      <div class="result-item" on:click={() => doSelect(p, close)}>
        ({pad(p.patientId, 4, "0")}) {p.fullName()}
      </div>
    {/each}
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
