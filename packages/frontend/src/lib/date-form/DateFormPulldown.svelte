<script lang="ts">
  import { errorMessagesOf, VResult } from "../validation";
  import DateForm from "./DateForm.svelte";

  export let date: Date | null;
  export let destroy: () => void;
  export let onEnter: (value: Date | null) => void;
  let errors: string[] = [];

  function doEnter(): void {
    if( errors.length === 0 ){
      destroy();
      onEnter(date);
    }
  }

  function doFormChange(result: VResult<Date | null>): void {
    if( result.isError ){
      errors = errorMessagesOf(result.errors);
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
  <DateForm bind:date onChange={doFormChange}  />
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
