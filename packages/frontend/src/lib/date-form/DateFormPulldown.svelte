<script lang="ts">
  import { Invalid } from "../validator";
  import DateForm from "./DateForm.svelte";

  export let date: Date | null;
  export let isNullable: boolean = false;
  export let destroy: () => void;
  export let onEnter: (value: Date | null) => void;
  let errors: Invalid[] = [];
  let errorStrings: string[] = [];

  function doEnter(): void {
    if( errors.length === 0 && (date === null && !isNullable)){
      errors = [new Invalid("入力がありません。")];
    }
    if( errors.length === 0 ){
      destroy();
      onEnter(date);
    } else {
      errorStrings = errors.map(e => e.toString());
    }
  }
</script>

<div>
  {#each errorStrings as error}
    <div class="error">{error}</div>
  {/each}
  <DateForm bind:date bind:errors />
  <div class="commands">
    <slot name="aux-commands" />
    <button on:click={doEnter}>入力</button>
    <button on:click={doEnter}>キャンセル</button>
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
