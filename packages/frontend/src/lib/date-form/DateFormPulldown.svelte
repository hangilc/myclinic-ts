<script lang="ts">
  import { error, errorMessagesOf, type VError } from "../validation";
  import DateForm from "./DateForm.svelte";

  export let date: Date | null;
  export let isNullable: boolean = false;
  export let destroy: () => void;
  export let onEnter: (value: Date | null) => void;
  let errors: VError[] = [];

  function doEnter(): void {
    if( errors.length === 0 && (date === null && !isNullable)){
      errors = [error("入力がありません。", [], [""])];
    }
    if( errors.length === 0 ){
      destroy();
      onEnter(date);
    }
  }
</script>

<div>
  {#if errors.length > 0}
  <div class="error">
    {#each errorMessagesOf(errors) as e}
      <div>{e}</div>
    {/each}
  </div>
  {/if}
  <DateForm bind:date bind:errors />
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
