<script lang="ts">
  import { errorMessagesOf, type VResult } from "@/lib/validation";
  import type { Patient, Kouhi } from "myclinic-model";
  import KouhiForm from "./KouhiForm.svelte";

  export let patient: Patient;
  export let init: Kouhi | null;
  export let onEnter: (data: Kouhi) => Promise<string[]>;
  export let onClose: () => void;
  let validate: () => VResult<Kouhi>;
  let errors: string[] = [];

  async function doEnter() {
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

</script>

<div>
  {#if errors.length > 0}
    <div class="error">
      {#each errors as e}
        <div>{e}</div>
      {/each}
    </div>
  {/if}
  <KouhiForm {patient} {init} bind:validate/>
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
