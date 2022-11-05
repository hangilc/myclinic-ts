<script lang="ts">
  import DateForm from "./DateForm.svelte";
  import Modal from "../Modal.svelte";

  export let isNullable: boolean = false;
  export let errorPrefix: string = "";
  export let onEnter: (value: Date | null) => void;
  let init: Date | null = null;
  let modal: Modal;
  let dateForm: DateForm;
  let error: string = "";

  export function open(initValue: Date | null): void {
    init = initValue;
    modal.open();
  }

  function doEnter(close: () => void): void {
    const [value, errs] = dateForm.validate();
    if( errs.length > 0 ){
      error = errs.map(e => e.message).join("\n");
    } else {
      close();
      onEnter(value);
    }
  }
</script>

<Modal let:close screenOpacity="0.2" bind:this={modal}>
  {#if error !== ""}
  <div class="error">{error}</div>
  {/if}
  <DateForm {init} {isNullable} bind:this={dateForm} {errorPrefix} />
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
