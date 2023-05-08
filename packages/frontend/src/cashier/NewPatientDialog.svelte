<script lang="ts">
  import api from "@/lib/api";
  import Dialog from "@/lib/Dialog.svelte";
  import { errorMessagesOf, type VResult } from "@/lib/validation";
  import type { Patient } from "myclinic-model";
  import { PatientData } from "./patient-dialog/patient-data";
  import PatientForm from "./PatientForm.svelte";
  import type { EventEmitter } from "@/lib/event-emitter";

  export let destroy: () => void;
  export let hotlineTrigger: EventEmitter<string> | undefined = undefined;
  let errors: string[] = [];
  let isEnterClicked = false;
  let validate: () => VResult<Patient>;

  async function doEnter() {
    isEnterClicked = true;
    const vs = validate();
    if (vs.isValid) {
      let entered = await api.enterPatient(vs.value);
      destroy();
      PatientData.start(entered, { hotlineTrigger });
    } else {
      errors = errorMessagesOf(vs.errors);
    }
  }

  function doChange(): void {
    if (isEnterClicked) {
      const vs = validate();
      if (vs.isValid) {
        errors = [];
      } else {
        errors = errorMessagesOf(vs.errors);
      }
    }
  }
</script>

<Dialog {destroy} title="新規患者入力">
  {#if errors.length > 0}
    <div class="error">
      {#each errors as e}
        <div>{e}</div>
      {/each}
    </div>
  {/if}
  <PatientForm init={undefined} on:value-change={doChange} bind:validate />
  <div class="commands">
    <button on:click={doEnter}>入力</button>
    <button on:click={destroy}>キャンセル</button>
  </div>
</Dialog>

<style>
  .error {
    color: red;
  }

  .commands {
    display: flex;
    justify-content: right;
    margin-top: 10px;
  }

  .commands > * + * {
    margin-left: 4px;
  }
</style>
