<script lang="ts">
  import Modal from "../Modal.svelte";
  import DatePicker from "./DatePicker.svelte";

  let init: Date;

  export let onEnter: (value: Date) => void;
  let modal: Modal;

  export function open(initValue: Date): void {
    init = initValue;
    modal.open();
  }

  function doEnter(value: Date, close: () => void): void {
    close();
    onEnter(value);
  }
</script>

<Modal bind:this={modal} let:close>
  <DatePicker {init} onCancel={close} onEnter={(d) => doEnter(d, close)}/>
</Modal>
