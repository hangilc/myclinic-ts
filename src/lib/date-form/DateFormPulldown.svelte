<script lang="ts">
  import DateForm from "./DateForm.svelte";
  import Modal from "../Modal.svelte";
  import type { AppError } from "../app-error";

  export let date: Date | null = null;
  export let isNullable: boolean = false;
  export let errorPrefix: string = "";
  let modal: Modal;
  let dateForm: DateForm;
  let error: string = "";

  export function open(): void {
    modal.open();
  }

  function doEnter(close: () => void): void {
    const errs: AppError[] = [];
    if( dateForm.validate(errs) ){
      close();
    } else {
      error = errs.map(e => e.message).join("\n");
    }
  }
</script>

<Modal let:close screenOpacity="0.2" bind:this={modal}>
  {#if error !== ""}
  <div class="error">{error}</div>
  {/if}
  <DateForm bind:date={date} {isNullable} bind:this={dateForm} {errorPrefix} />
  <div class="commands">
    <slot name="aux-commands" />
    <button on:click={() => doEnter(close)}>入力</button>
    <button on:click={close}>キャンセル</button>
  </div>
</Modal>

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
