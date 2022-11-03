<script lang="ts">
  import Modal from "../Modal.svelte";
  import DatePicker from "./DatePicker.svelte";

  export let date: Date;
  let modal: Modal;

  export function open(): void {
    modal.open();
  }

  function doEnter(d: Date, close: () => void): void {
    close();
    date = d;
  }
</script>

<Modal bind:this={modal} let:close>
  <DatePicker {date} onCancel={close} onEnter={(d) => doEnter(d, close)} />
</Modal>
