<script lang="ts">
  import api from "@/lib/api";
  import Dialog from "@/lib/Dialog.svelte";
  import { errorMessagesOf, type VResult } from "@/lib/validation";
  import type { Patient } from "myclinic-model";
  import PatientForm from "../PatientForm.svelte";

  export let destroy: () => void;
  export let onCancel: () => void;
  export let onUpdate: (updated: Patient) => void;
  export let patient: Patient;
  let errors: string[] = [];
  let isEnterClicked = false;
  let validate: (() => VResult<Patient>) | undefined = undefined;

  async function doEnter() {
    if (!validate) {
      throw new Error("uninitialized validator");
    }
    isEnterClicked = true;
    const vs = validate();
    if (vs.isValid) {
      let ok = await api.updatePatient(vs.value);
      if (!ok) {
        errors = ["患者情報の変更に失敗しました。"];
      } else {
        destroy();
        onUpdate(vs.value);
      }
    } else {
      errors = errorMessagesOf(vs.errors);
    }
  }

  function doCancel() {
    destroy();
    onCancel();
  }

  function doChange(): void {
    if (!validate) {
      throw new Error("uninitialized validator");
    }
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

<Dialog {destroy} title="患者情報編集">
  {#if errors.length > 0}
    <div class="error">
      {#each errors as e}
        <div>{e}</div>
      {/each}
    </div>
  {/if}
  <PatientForm init={patient} on:value-change={doChange} bind:validate />
  <div class="commands">
    <button on:click={doEnter}>入力</button>
    <button on:click={doCancel}>キャンセル</button>
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
