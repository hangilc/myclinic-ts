<script lang="ts">
  import { errorMessagesOf, type VResult } from "@/lib/validation";
  import type { Patient, Shahokokuho } from "myclinic-model";
  import ShahokokuhoForm from "./ShahokokuhoForm.svelte";

  export let patient: Patient;
  export let init: Shahokokuho | null;
  export let onEnter: (data: Shahokokuho) => Promise<string[]>;
  export let onClose: () => void;
  let validate: () => VResult<Shahokokuho>;
  let errors: string[] = [];
  let enterClicked = false;

  async function doEnter() {
    enterClicked = true;
    const vs = validate();
    if( vs.isValid ){
      errors = [];
      const errs = await onEnter(vs.value);
      if( errs.length === 0 ){
        onClose();
      } else {
        errors = errs;
      }
    } else {
      errors = errorMessagesOf(vs.errors);
    }
  }

  function doClose() {
    onClose();
  }

  function onValueChange(): void {
    if( enterClicked ){
      const r = validate();
      errors = errorMessagesOf(r.errors);
    }
  }
</script>

<div>
  {#if errors.length > 0}
    <div class="error">
      {#each errors as e}
        <div>{e}</div>
      {/each}
    </div>
  {/if}
  <ShahokokuhoForm {patient} {init} bind:validate on:value-change={onValueChange}/>
  <div class="commands">
    <button on:click={doEnter}>入力</button>
    <button on:click={doClose}>キャンセル</button>
  </div>
</div>

<style>
  .error {
    margin: 10px 0;
    color: red;
  }
  .commands {
    display: flex;
    justify-content: right;
    margin-top: 10px;
  }

  .commands * + * {
    margin-left: 4px;
  }
</style>