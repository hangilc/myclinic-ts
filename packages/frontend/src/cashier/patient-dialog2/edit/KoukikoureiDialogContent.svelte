<script lang="ts">
  import { errorMessagesOf, type VResult } from "@/lib/validation";
  import type { Patient, Koukikourei } from "myclinic-model";
  import KoukikoureiForm from "./KoukikoureiForm.svelte";

  export let patient: Patient;
  export let data: Koukikourei | null = null;
  export let onEnter: (data: Koukikourei) => Promise<string[]>;
  export let onClose: () => void;
  let validate: () => VResult<Koukikourei>;
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

  function onValueChange(evt: CustomEvent<VResult<Koukikourei>>): void {
    if( enterClicked ){
      const r = evt.detail;
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
  <KoukikoureiForm {patient} bind:data={data} bind:validate on:value-change={onValueChange}/>
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
