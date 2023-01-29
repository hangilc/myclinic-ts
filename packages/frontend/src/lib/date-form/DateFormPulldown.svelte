<script lang="ts">
  import { errorMessagesOf, VResult } from "../validation";
  import DateForm from "./DateForm.svelte";

  export let init: Date | null;
  export let destroy: () => void;
  export let onEnter: (value: Date | null) => void;
  let validate: () => VResult<Date | null>;
  let errors: string[] = [];

  function doEnter(): void {
    const vs = validate();
    if( vs.isValid ){
      destroy();
      onEnter(vs.value);
      errors = [];
    } else {
      errors = errorMessagesOf(vs.errors);
    }
  }

  function doFormChange(): void {
    const vs = validate();
    if( vs.isValid ){
      errors = [];
    } else {
      errors = errorMessagesOf(vs.errors);
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
  <DateForm {init} on:value-change={doFormChange} bind:validate/>
  <div class="commands">
    <slot name="aux-commands" />
    <button on:click={doEnter}>入力</button>
    <button on:click={destroy}>キャンセル</button>
  </div>
</div>

<style>
  .error {
    color: red;
    margin-bottom: 6px;
  }

  .commands {
    display: flex;
    justify-content: flex-end;
    margin-top: 4px;
  }

  .commands button {
    margin-left: 4px;
  }
</style>
